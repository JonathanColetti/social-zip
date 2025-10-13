import { CheckAuth } from "../../util.js";
import { IContext } from "../../@types/user.js";
import {
  AddPostToWeaviate,
  ChangeName,
  DeletePostWeaviate,
  DeleteWeaviateUser,
} from "../weaviate/index.js";
import {
  BlockOrUnBlockUser,
  CommentOnPost,
  CreateClickedOn,
  CreatePostD,
  CreateViewed,
  DeleteComment,
  DeletePostD,
  DeleteUserD,
  EditUser,
  FollowOrUnFollowHashtag,
  FollowOrUnFollowUser,
  LikeOrUnLikeComment,
  LikeOrUnLikePost,
  MakeAccountPrivate,
} from "../dgraphql/actions/mutations.js";
import CreateNotification from "../notification/index.js";
import { GetComment, IsBlocked } from "../dgraphql/actions/queries.js";
import { DeleteUser } from "../dynamodb/index.js";

const Mutations = {
  Mutation: {
    createPost: async (
      _parent: unknown,
      args: { uri: string; hashtag: string },
      context: string,
      _info: unknown
    ): Promise<string | null> => {
      let { uri, hashtag } = args;
      if (!uri || !hashtag) return null;
      uri = uri.trim();
      hashtag = hashtag.toLowerCase().replace(/[^a-z0-9]/g, "");
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return null;
      try {
        const postId = await AddPostToWeaviate(uri, authObj.username, hashtag);
        if (!postId || postId === undefined) return null;
        const didCreateD = await CreatePostD(authObj.username, postId, hashtag);
        if (!didCreateD) {
          await DeletePostWeaviate(postId, authObj.username);
          return null;
        }
        // get all usernames denoted by @ to
        const usernameMatches = uri.match(/(?<=@)[a-zA-Z0-9]+/g);
        if (usernameMatches) {
          for (const user of usernameMatches) {
            await CreateNotification(
              user,
              `@${authObj.username} mentioned you in a post`,
              postId,
              null
            );
          }
        }
        CreateViewed(authObj.username, postId);
        CreateClickedOn(authObj.username, postId);
        return postId;
      } catch (err) {
        return null;
      }
    },
    deletePost: async (
      _parent: unknown,
      args: { postId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { postId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return null;
      try {
        // weaviate tells if the post is created by the user
        const didWeaviateDelete = await DeletePostWeaviate(
          postId,
          authObj.username
        );
        if (!didWeaviateDelete) return false;
        const didDeleteD = await DeletePostD(authObj.username, postId);
        if (!didDeleteD) return false;
        return true;
      } catch (err) {
        return false;
      }
    },
    followUser: async (
      _parent: unknown,
      args: { toFollow: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { toFollow } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return false;
      if (authObj.username === toFollow) return false;
      const isBlocked = await IsBlocked(toFollow, authObj.username);
      if (isBlocked) return false;
      const didFollow = await FollowOrUnFollowUser(
        authObj.username,
        toFollow,
        true
      );
      if (!didFollow) return false;

      await CreateNotification(
        toFollow,
        `@${authObj.username} started following you`,
        null,
        null
      );
      return true;
    },
    // this works
    unfollowUser: async (
      _parent: unknown,
      args: { toUnFollow: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { toUnFollow } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return false;
      return await FollowOrUnFollowUser(authObj.username, toUnFollow, false);
    },
    // this works
    likePost: async (
      _parent: unknown,
      args: { postId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { postId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !postId) return null;

      return await LikeOrUnLikePost(authObj.username, postId, true);
    },
    // this works
    unlikePost: async (
      _parent: unknown,
      args: { postId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { postId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !postId) return false;
      return await LikeOrUnLikePost(authObj.username, postId, false);
    },
    // this works
    createComment: async (
      _parent: unknown,
      args: { postId: string; comment: string },
      context: string,
      _info: unknown
    ): Promise<string | false> => {
      const { postId, comment } = args;
      if (!postId || !comment || comment === "" || postId === "") return false;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return false;
      const didComment = await CommentOnPost(authObj.username, postId, comment);

      if (!didComment) return false;
      // get users denoted by @
      const users = comment.match(/(?<=@)[a-zA-Z0-9]+/g);
      if (users) {
        for (const user of users) {
          await CreateNotification(
            user,
            `@${authObj.username} mentioned you in a comment`,
            null,
            didComment
          );
        }
      }
      // get owner of post so we can give notification
      return didComment;
    },
    // this works
    likeComment: async (
      _parent: unknown,
      args: { commentId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { commentId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !commentId) return false;
      const didLike = await LikeOrUnLikeComment(
        authObj.username,
        commentId,
        true
      );
      if (!didLike) return false;
      // get comment owner so we can give notification
      const commentOwner = (await GetComment(commentId)).username;
      if (commentOwner) {
        await CreateNotification(
          commentOwner,
          `@${authObj.username} liked your comment`,
          null,
          commentId
        );
      }
      return true;
    },
    // this works
    unlikeComment: async (
      _parent: unknown,
      args: { commentId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { commentId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username || !commentId) return null;
      return await LikeOrUnLikeComment(authObj.username, commentId, false);
    },
    // this works
    deleteComment: async (
      _parent: unknown,
      args: { postId: string; commentId: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { postId, commentId } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !postId || !commentId) return false;

      return await DeleteComment(authObj.username, commentId);
    },
    // this works
    followHashtag: async (
      _parent: unknown,
      args: { hashtag: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { hashtag } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !hashtag) return false;
      return await FollowOrUnFollowHashtag(authObj.username, hashtag, true);
    },
    // this works
    unfollowHashtag: async (
      _parent: unknown,
      args: { hashtag: string },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { hashtag } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !hashtag) return null;
      return await FollowOrUnFollowHashtag(authObj.username, hashtag, false);
    },
    // this works
    editUser: async (
      _parent: unknown,
      args: {
        rname: string;
        profilePicture: string;
        backgroundPicture: string;
        accent: string;
      },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { rname, profilePicture, backgroundPicture, accent } = args;

      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return false;
      if (rname && rname.length > 0) {
        // change name in weaviate
        const didChange = await ChangeName(rname, authObj.username);
        if (!didChange) return false;
      }
      return await EditUser(
        authObj.username,
        rname,
        profilePicture,
        backgroundPicture,
        accent
      );
    },
    // this works
    deleteUser: async (
      _parent: unknown,
      _args: unknown,
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return false;
      const dgraphDelete = await DeleteUserD(authObj.username);
      if (!dgraphDelete) return false;
      const dynamodbDelete = await DeleteUser(authObj.id, authObj.authType);
      if (!dynamodbDelete) return false;
      const weaviateDelete = await DeleteWeaviateUser(authObj.username);
      return weaviateDelete;
    },

    // this works
    blockUser: async (
      _parent: unknown,
      args: { username: string; unblock: boolean },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const { username, unblock } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return null;
      if (authObj.username === username) return null;
      return await BlockOrUnBlockUser(authObj.username, username, unblock);
    },
    makePrivate: async (
      _parent: unknown,
      args: { makePrivate: boolean },
      context: string,
      _info: unknown
    ): Promise<boolean> => {
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return false;
      return await MakeAccountPrivate(authObj.username, args.makePrivate);
    },
  },
};

export default Mutations;
