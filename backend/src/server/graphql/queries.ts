import { GetNotifications } from "../dynamodb/index.js";
import { IContext } from "../../@types/user.js";
import {
  SearchHastags,
  SearchPosts,
  SearchUser,
  getPost,
  SimilarPosts,
} from "../weaviate/index.js";

import { IMiniUser, IUser } from "../../@types/user.js";
import {
  IPost,
  ITiniPost,
  PostNeo,
  SimilarPost,
  UserPosts,
} from "../../@types/post.js";
import { INotification } from "../../@types/notification.js";
import { IComment } from "../../@types/comment.js";
import { IDHashtag, IHashtag } from "../../@types/hashtag.js";
import { CheckAuth } from "../../util.js";
import {
  GetTopPosts,
  GetFollowingPosts,
  GetHistoryPosts,
  GetLikedPosts,
  GetUserPosts,
  GetUserD,
  GetMostPinnedHashtags,
  GetMostFollowedUser,
  GetPinnedHashtags,
  GetComments,
  FriendSuggestion,
  CollaborativeFiltering,
  HashtagRecomendation,
  GetHashtagPosts,
  IsFollowingUser,
  IsBlocked,
  GetNewestHashtagPosts,
  DidLikePost,
  GetBlockedUsers,
} from "../dgraphql/actions/queries.js";
import {
  CreateClickedOn,
  CreateViewed,
  GetPostD,
} from "../dgraphql/actions/mutations.js";
import MixpanelEvent from "../mixpanel/index.js";

const Queries = {
  Query: {
    // this works but missing followers and following
    getUser: async (
      _parent: unknown,
      args: { username: string | null },
      context: string,
      _info: unknown
    ): Promise<IUser> => {
      let { username } = args;
      username = username ? username.toLowerCase() : null;
      const authObj: false | IContext = await CheckAuth(context);
      if (!username && authObj) {
        const userD = await GetUserD(authObj.username);
        if (!userD) return null;
        return {
          isVerified: userD.isVerified,
          isBanned: userD.isBanned,
          username: userD.username,
          rname: userD.rname,
          profilePicture: userD.profilePicture,
          accent: userD.accent,
          backgroundPicture: userD.backgroundPicture,
          followers: userD.followers,
          following: userD.following,
          isFollowing: false,
        };
      }
      const userD = await GetUserD(username);
      if (!userD) return null;
      return {
        isVerified: userD.isVerified,
        isBanned: userD.isBanned,
        username: userD.username,
        rname: userD.rname,
        profilePicture: userD.profilePicture,
        accent: userD.accent,
        backgroundPicture: userD.backgroundPicture,
        followers: userD.followers,
        following: userD.following,
        isFollowing: authObj
          ? await IsFollowingUser(authObj.username, username)
          : false,
      };
    },
    getPopularPosts: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IPost[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      const popularPs: IPost[] = [];
      const popularPosts: PostNeo[] = await GetTopPosts(
        !authObj ? null : authObj.username,
        pageNum
      );
      for (let index = 0; index < popularPosts.length; index++) {
        const post = await getPost(popularPosts[index].postId);
        if (post) {
          popularPs.push({
            postId: popularPosts[index].postId,
            uri: post.uri,
            rname: popularPosts[index].user.rname,
            username: popularPosts[index].user.username,
            timestamp: popularPosts[index].timestamp,
            hashtag: post.hashtag,
            profilePicture: popularPosts[index].user.profilePicture,
            isVerified: popularPosts[index].user.isVerified,
            views: popularPosts[index].views,
            likes: popularPosts[index].likes,
            comments: popularPosts[index].comments,
          });
        }
      }
      return popularPs;
    },

    getFollowingPosts: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IPost[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj) return null;
      const followingPs: IPost[] = [];
      const followingPosts: PostNeo[] = await GetFollowingPosts(
        authObj.username,
        pageNum
      );
      for (let i = 0; i < followingPosts.length; i++) {
        const post = await getPost(followingPosts[i].postId);
        if (post) {
          followingPs.push({
            postId: followingPosts[i].postId,
            uri: post.uri,
            rname: followingPosts[i].user.rname,
            username: followingPosts[i].user.username,
            timestamp: followingPosts[i].timestamp,
            hashtag: post.hashtag,
            profilePicture: followingPosts[i].user.profilePicture,
            isVerified: followingPosts[i].user.isVerified,
            views: followingPosts[i].views,
            likes: followingPosts[i].likes,
            comments: followingPosts[i].comments,
          });
        }
      }
      return followingPs;
    },
    getPost: async (
      _parent: unknown,
      args: { postId: string },
      context: string,
      _info: unknown
    ): Promise<IPost | null> => {
      const { postId } = args;
      if (!postId) return null;
      const post = await getPost(postId);
      if (!post) return null;
      const postDgraph: PostNeo | false = await GetPostD(postId);
      if (!postDgraph) return null;
      const checkAuth: false | IContext = await CheckAuth(context);
      if (checkAuth) {
        const didBlock = await IsBlocked(checkAuth.username, post.username);
        if (didBlock) return null;
        CreateClickedOn(checkAuth.username, postId);
        CreateViewed(checkAuth.username, postId);
      }
      MixpanelEvent("getPost", {
        username: checkAuth ? checkAuth.username : false,
        postId: postId,
      });

      return {
        postId: postDgraph.postId,
        uri: post.uri,
        hashtag: post.hashtag,
        timestamp: postDgraph.timestamp,
        username: post.username,
        profilePicture: postDgraph.user.profilePicture,
        isVerified: postDgraph.user.isVerified,
        rname: postDgraph.user.rname,
        views: postDgraph.views,
        likes: postDgraph.likes,
        comments: postDgraph.comments,
        isLiked: checkAuth
          ? await DidLikePost(checkAuth.username, postId)
          : false,
      };
    },
    getHistoryPosts: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<ITiniPost[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return null;
      const returnedHistoryPosts: ITiniPost[] = [];
      const historyPosts = await GetHistoryPosts(authObj.username, pageNum);
      for (let i = 0; i < historyPosts.length; i++) {
        const post = await getPost(historyPosts[i].postId);
        if (post) {
          returnedHistoryPosts.push({
            postId: historyPosts[i].postId,
            uri: post.uri,
          });
        }
      }
      return returnedHistoryPosts;
    },
    getLikedPosts: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<ITiniPost[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return null;
      const likedPs: ITiniPost[] = [];
      const likedPosts = await GetLikedPosts(authObj.username, pageNum || 0);
      for (let i = 0; i < likedPosts.length; i++) {
        const post = await getPost(likedPosts[i].postId);
        if (post) {
          likedPs.push({
            postId: likedPosts[i].postId,
            uri: post.uri,
          });
        }
      }
      return likedPs;
    },
    getUserPosts: async (
      _parent: unknown,
      args: { username: string; pageNum: number },
      _context: string,
      _info: unknown
    ): Promise<UserPosts[]> => {
      let { username, pageNum } = args;
      if (!username) return null;
      username = username.toLowerCase();
      const userPs: UserPosts[] = [];
      const usersPosts: PostNeo[] = await GetUserPosts(username, pageNum || 0);
      for (let i = 0; i < usersPosts.length; i++) {
        const post = await getPost(usersPosts[i].postId);
        if (post)
          userPs.push({
            comments: usersPosts[i].comments,
            likes: usersPosts[i].likes,
            timestamp: usersPosts[i].timestamp,
            uri: post.uri,
            views: usersPosts[i].views,
            postId: usersPosts[i].postId,
          });
      }
      return userPs;
    },
    similarPosts: async (
      _parent: unknown,
      args: { postId: string; pageNum: number },
      _context: string,
      _info: unknown
    ): Promise<ITiniPost[]> => {
      const { postId, pageNum } = args;
      if (!postId || pageNum) return null;
      const returnPosts: ITiniPost[] = [];
      const similarPosts: SimilarPost[] = await SimilarPosts(postId, pageNum);
      for (let i = 0; i < similarPosts.length; i++) {
        if (similarPosts[i]._additional.id === postId) continue;
        returnPosts.push({
          postId: similarPosts[i]._additional.id,
          uri: similarPosts[i].uri,
        });
      }
      return returnPosts;
    },
    getPostsBySearch: async (
      _parent: unknown,
      args: { query: string; pageNum: number },
      _context: string,
      _info: unknown
    ): Promise<ITiniPost[]> => {
      const { query, pageNum } = args;
      return await SearchPosts(query, pageNum);
    },
    getHashtagsBySearch: async (
      _parent: unknown,
      args: { query: string; pageNum: number },
      _context: string,
      _info: unknown
    ): Promise<string[]> => {
      let { query, pageNum } = args;
      query = query.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!query || query === "") {
        // get most pinned hashtags
        const returnedHashtags: string[] = [];
        const mostPopular = await GetMostPinnedHashtags(pageNum);
        for (let i = 0; i < mostPopular.length; i++) {
          returnedHashtags.push(mostPopular[i].hashtag);
        }
        return returnedHashtags;
      }
      return await SearchHastags(query, pageNum);
    },
    getUsersBySearch: async (
      _parent: unknown,
      args: { query: string; pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IMiniUser[]> => {
      const { query, pageNum } = args;
      const returnUsers: IMiniUser[] = [];
      if (!query || query === "") {
        return await GetMostFollowedUser(null, pageNum);
      }
      const susers = await SearchUser(query, pageNum);
      for (let i = 0; i < susers.length; i++) {
        const user: IUser = await GetUserD(susers[i].username);
        if (user) {
          returnUsers.push({
            username: user.username,
            profilePicture: user.profilePicture,
            rname: user.rname,
            isVerified: user.isVerified,
          });
        }
      }
      return returnUsers;
    },
    getPosts: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IPost[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      const retPosts: IPost[] = [];
      let tempPosts: PostNeo[] = [];
      if (authObj) {
        tempPosts = await CollaborativeFiltering(authObj.username);
      } else {
        tempPosts = await GetTopPosts(null, pageNum);
      }
      if (tempPosts.length < 5) {
        const extraPosts = await GetTopPosts(
          authObj ? authObj.username : null,
          5 - tempPosts.length
        );
        for (let i = 0; i < extraPosts.length; i++) {
          tempPosts.push(extraPosts[i]);
        }
      }
      for (let i = 0; i < tempPosts.length; i++) {
        const post = await getPost(tempPosts[i].postId);
        if (post) {
          if (authObj) {
            CreateViewed(authObj.username, tempPosts[i].postId);
          }
          retPosts.push({
            postId: tempPosts[i].postId,
            uri: post.uri,
            rname: tempPosts[i].user.rname,
            username: tempPosts[i].user.username,
            timestamp: tempPosts[i].timestamp,
            hashtag: post.hashtag,
            profilePicture: tempPosts[i].user.profilePicture,
            isVerified: tempPosts[i].user.isVerified,
            views: tempPosts[i].views,
            likes: tempPosts[i].likes,
            comments: tempPosts[i].comments,
          });
        }
      }
      MixpanelEvent("getPosts", {
        username: authObj ? authObj.username : false,
        pageNum: pageNum,
      });
      return retPosts;
    },
    getPostsByHashtag: async (
      _parent: unknown,
      args: { hashtag: string; pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IPost[]> => {
      let { hashtag, pageNum } = args;
      hashtag = hashtag.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!hashtag) return null;
      const authObj: false | IContext = await CheckAuth(context);
      const postReturn: IPost[] = [];
      const retPosts = await GetHashtagPosts(
        authObj ? authObj.username : null,
        hashtag,
        pageNum
      );
      if (retPosts.length < 5) {
        const extraPosts = await GetNewestHashtagPosts(
          hashtag,
          pageNum,
          5 - retPosts.length
        );
        for (let i = 0; i < extraPosts.length; i++) {
          retPosts.push(extraPosts[i]);
        }
      }
      for (let i = 0; i < retPosts.length; i++) {
        const post = await getPost(retPosts[i].postId);
        if (post) {
          if (authObj) CreateViewed(authObj.username, retPosts[i].postId);

          postReturn.push({
            postId: retPosts[i].postId,
            uri: post.uri,
            rname: retPosts[i].user.rname,
            username: retPosts[i].user.username,
            timestamp: retPosts[i].timestamp,
            hashtag: post.hashtag,
            profilePicture: retPosts[i].user.profilePicture,
            isVerified: retPosts[i].user.isVerified,
            views: retPosts[i].views,
            likes: retPosts[i].likes,
            comments: retPosts[i].comments,
          });
        }
      }
      MixpanelEvent("getPostByHashtag", {
        username: authObj ? authObj.username : false,
        hashtag: hashtag,
        pageNum: pageNum,
      });
      return postReturn;
    },
    // this works
    getPinnedHashtags: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IHashtag[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return null;
      const returnedHashtags: IHashtag[] = [];
      const pinnedHashtags: string[] = await GetPinnedHashtags(
        authObj.username,
        pageNum
      );

      for (let i = 0; i < pinnedHashtags.length; i++) {
        returnedHashtags.push({
          hashtag: pinnedHashtags[i],
          isPinned: true,
        });
      }
      return returnedHashtags;
    },
    // this works
    getNotifications: async (
      _parent: unknown,
      args: { lastSortKey: string },
      context: string,
      _info: unknown
    ): Promise<INotification[]> => {
      const { lastSortKey } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return [];
      const notifications: INotification[] = [];
      const fetchedNotifs = await GetNotifications(
        authObj.username,
        lastSortKey ? lastSortKey : null
      );

      if (!fetchedNotifs) return [];
      for (let index = 0; index < fetchedNotifs.length; index++) {
        const notification = fetchedNotifs[index];
        const user = await GetUserD(notification.username);
        if (notification.postId) {
          // const post = await getPost(notification.postId);
          notifications.push({
            username: notification.username,
            name: user.rname,
            postId: notification.postId,
            commentId: null,
            profilePicture: user.profilePicture,
            message: notification.message,
            stimestamp: notification.stimestamp,
          });
        } else if (notification.commentId) {
          notifications.push({
            username: notification.username,
            name: user.rname,
            postId: null,
            commentId: notification.commentId,
            profilePicture: user.profilePicture,
            message: notification.message,
            stimestamp: notification.stimestamp,
          });
        } else {
          notifications.push({
            username: notification.username,
            name: user.rname,
            postId: null,
            commentId: null,
            profilePicture: user.profilePicture,
            message: notification.message,
            stimestamp: notification.stimestamp,
          });
        }
      }
      // MixpanelEvent("getNotifications", {})
      return notifications;
    },
    getComments: async (
      _parent: unknown,
      args: { postId: string; pageNum: number },
      _context: string,
      _info: unknown
    ): Promise<IComment[]> => {
      const { postId, pageNum } = args;
      if (!postId) return null;
      return await GetComments(postId, pageNum);
    },

    getHashtags: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IHashtag[]> => {
      const { pageNum } = args;
      const hashtags: IHashtag[] = [];
      const authObj: false | IContext = await CheckAuth(context);
      if (authObj && authObj.username) {
        const hashtagRec = await HashtagRecomendation(
          authObj.username,
          pageNum
        );
        if (hashtagRec) {
          for (let i = 0; i < hashtagRec.length; i++) {
            hashtags.push({
              hashtag: hashtagRec[i],
              isPinned: false,
            });
          }
        }
      }
      if (hashtags.length < 5) {
        const mostFollowedHashtags: IDHashtag[] = await GetMostPinnedHashtags(
          pageNum,
          5 - hashtags.length
        );
        for (let i = 0; i < mostFollowedHashtags.length; i++) {
          hashtags.push({
            hashtag: mostFollowedHashtags[i].hashtag,
            isPinned: false,
          });
        }
      }
      return hashtags;
    },
    // this works
    getFriendSuggestions: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IMiniUser[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) {
        return await GetMostFollowedUser(null, pageNum);
      }
      const suggestedFriends = await FriendSuggestion(
        authObj.username,
        pageNum
      );
      if (suggestedFriends.length >= 5) return suggestedFriends;
      // create a hashset to ensure we do not return duplicates
      const suggestedFriendsSet = new Set<string>();
      for (let i = 0; i < suggestedFriends.length; i++) {
        suggestedFriendsSet.add(suggestedFriends[i].username);
      }

      const mostFollowedUsers = await GetMostFollowedUser(
        authObj ? authObj.username : null,
        pageNum,
        5 - suggestedFriends.length
      );
      for (let i = 0; i < mostFollowedUsers.length; i++) {
        // check if user is already in suggestedFriends
        if (!suggestedFriendsSet.has(mostFollowedUsers[i].username))
          suggestedFriends.push(mostFollowedUsers[i]);
      }

      return suggestedFriends;
    },
    getBlockedUsers: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<string[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return [];
      return await GetBlockedUsers(authObj.username, pageNum);
    },
    getFollowRequests: async (
      _parent: unknown,
      args: { pageNum: number },
      context: string,
      _info: unknown
    ): Promise<IMiniUser[]> => {
      const { pageNum } = args;
      const authObj: false | IContext = await CheckAuth(context);
      if (!authObj || !authObj.username) return [];
      return await [];
    },
  },
};

export default Queries;
