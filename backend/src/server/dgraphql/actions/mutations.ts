import { dgraphClient, dgraphStub } from "../../../app.js";
import dgraph from "dgraph-js";
import {
  GetCommentUid,
  GetHashtagUid,
  GetPostUid,
  GetProfileUid,
  GetUserPosts,
} from "./queries.js";
import { v4 as uuidv4 } from "uuid";
import { PostNeo } from "../../../@types/post.js";
import { GetPostQuery } from "../constants.js";

/*
    Create a clicked on edge between a user and a post `Profile.clickedOn` & `Post.clickedOn`
    @param username: string
    @param postId: string
*/
async function CreateClickedOn(username: string, postId: string) {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const postUid = await GetPostUid(postId);
    if (!postUid) return false;
    const mutation = new dgraph.Mutation();
    mutation.setSetNquads(
      `<${uid}> <Profile.clickedOn> <${postUid}> .
            <${postUid}> <Post.clickedOn> <${uid}> .`
    );
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Create a view edge between a user and a post `Profile.viewed` & `Post.viewed`
    @param username: string
    @param postId: string
*/
async function CreateViewed(
  username: string,
  postId: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const postUid = await GetPostUid(postId);
    if (!postUid) return false;

    const mutation = new dgraph.Mutation();
    mutation.setSetNquads(
      `<${uid}> <Profile.viewed> <${postUid}> .
      <${postUid}> <Post.views> <${uid}> .`
    );
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get a post from dgraph with the `Post` type by using the postId
    @param postId: string
    @returns PostNeo | false
*/
async function GetPostD(postId: string): Promise<PostNeo | false> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const vars = { $a: postId };
    const postGetResponse = await txn.queryWithVars(GetPostQuery, vars);
    if (
      !postGetResponse.getJson().findPost ||
      postGetResponse.getJson().findPost.length <= 0
    )
      return false;

    return postGetResponse.getJson().findPost[0] || false;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Create a user in dgraph with the `Profile` type
    @param username: string
    @param rname: string
    @param profilePicture: string
    @param backgroundPicture: string
    @param accent: string
*/
async function CreateUserD(
  username: string,
  rname: string,
  profilePicture: string,
  backgroundPicture: string,
  accent: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    // mutate with variables
    const p = {
      "Profile.username": username,
      "Profile.rname": rname,
      "Profile.profilePicture": profilePicture,
      "Profile.backgroundPicture": backgroundPicture,
      "Profile.accent": accent,
      "Profile.isVerified": false,
      "Profile.isBanned": false,
      "dgraph.type": "Profile",
    };
    const mu = new dgraph.Mutation();
    mu.setSetJson(p);
    await txn.mutate(mu);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Follow or unfollow a hashtag by adding or removing the `Profile.pinnedHashtags` & `Hashtag.pins` edges plus if the hashtag does not exist create it
    @param username: string
    @param hashtag: string
    @param follow: boolean = true
*/
async function FollowOrUnFollowHashtag(
  username: string,
  hashtag: string,
  follow: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const hashtagUid = await GetHashtagUid(hashtag);
    if (!hashtagUid) return false;

    const mutation = new dgraph.Mutation();
    if (follow) {
      mutation.setSetNquads(
        `<${uid}> <Profile.pinnedHashtags> <${hashtagUid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.pinnedHashtags> <${hashtagUid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}
/*
    Follow or unfollow a user by adding or removing the `Profile.following` & `Profile.followers` edges
    @param username: string
    @param followingUsername: string
    @param follow: boolean = true
*/
async function FollowOrUnFollowUser(
  username: string,
  followingUsername: string,
  follow: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  const followingUid = await GetProfileUid(followingUsername);
  if (!followingUid) return false;
  const uid = await GetProfileUid(username);
  if (!uid) return false;
  try {
    const mutation = new dgraph.Mutation();
    if (follow) {
      mutation.setSetNquads(
        `<${uid}> <Profile.following> <${followingUid}> .
                <${followingUid}> <Profile.followers> <${uid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.following> <${followingUid}> .
                <${followingUid}> <Profile.followers> <${uid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Delete a comment in dgraph with the `Comment` type
    @param username: string
    @param commentId: string
*/
async function DeleteComment(
  username: string,
  commentId: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const commentUid = await GetCommentUid(commentId);
    if (!commentUid) return false;
    const mutation = new dgraph.Mutation();
    const p = {
      uid: commentUid,
    };
    mutation.setDeleteJson(p);
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Create a post in dgraph with the `Post` type and add the `Profile.posts` & `Hashtag.posts` & `Post.hashtag` edges
    @param username: string
    @param postId: string
    @param hashtag: string
*/
async function CreatePostD(
  username: string,
  postId: string,
  hashtag: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  const mu = new dgraph.Mutation();
  const tmu = new dgraph.Mutation();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    // get hashtag
    const post = {
      "Post.postId": postId,
      "Post.timestamp": Date.now(),
      "dgraph.type": "Post",
    };
    mu.setSetJson(post);
    // get the post uid
    const postUid: string | false =
      (await txn.mutate(mu))?.getUidsMap().arr_[0][1] || false;
    if (!postUid) return false;

    const hashtagUid = await GetHashtagUid(hashtag);
    if (!hashtagUid) return false;
    tmu.setSetNquads(
      `<${uid}> <Profile.posts> <${postUid}> . 
            <${postUid}> <Post.hashtag> <${hashtagUid}> . 
            <${hashtagUid}> <Hashtag.posts> <${postUid}> .
            <${postUid}> <Post.username> <${uid}> .`
    );
    await txn.mutate(tmu);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Like or unlike a post by adding or removing the `Post.likes` edge and incrementing the `Post.likesCount`
    @param username: string
    @param postId: string
    @param like: boolean = true
*/
async function LikeOrUnLikePost(
  username: string,
  postId: string,
  like: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const postUid = await GetPostUid(postId);
    if (!postUid) return false;
    const mutation = new dgraph.Mutation();
    if (like) {
      mutation.setSetNquads(
        `<${uid}> <Profile.likes> <${postUid}> . 
                <${postUid}> <Post.likes> <${uid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.likes> <${postUid}> . 
                <${postUid}> <Post.likes> <${uid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

async function VerifyUser(username: string, unverify = false) {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const mutation = new dgraph.Mutation();
    if (unverify) {
      mutation.setDelNquads(`<${uid}> <Profile.isVerified> "true" .`);
    } else {
      mutation.setSetNquads(`<${uid}> <Profile.isVerified> "true" .`);
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Comment on a post by adding the `Comment` type and the `Post.comments` edge
    @param username: string
    @param postId: string
    @param comment: string
*/
async function CommentOnPost(
  username: string,
  postId: string,
  comment: string
): Promise<string | false> {
  const uid = await GetProfileUid(username);

  if (!uid) return false;
  const postUid = await GetPostUid(postId);

  if (!postUid) return false;
  const txn = dgraphClient.newTxn();
  const mutation = new dgraph.Mutation();
  const tmutation = new dgraph.Mutation();
  const commentId = uuidv4();
  try {
    const p = {
      "Comment.commentId": commentId,
      "Comment.comment": comment,
      "Comment.timestamp": Date.now(),
      "dgraph.type": "Comment",
    };
    mutation.setSetJson(p);
    const resp = await txn.mutate(mutation);
    const commentUid: string | false = resp.getUidsMap().arr_[0][1] || false;

    if (!commentUid) return false;

    tmutation.setSetNquads(
      `<${postUid}> <Post.comments> <${commentUid}> .
            <${commentUid}> <Comment.username> <${uid}> .
            <${commentUid}> <Comment.post> <${postUid}> .`
    );
    await txn.mutate(tmutation);
    await txn.commit();
    return commentId;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Block or unblock a user by adding or removing the `Profile.blockedUsers` edge
    @param username: string
    @param toUsername: string
    @param block: boolean = true
*/
async function BlockOrUnBlockUser(
  username: string,
  toUsername: string,
  unblock: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  const uid = await GetProfileUid(username);
  if (!uid) return false;
  const tuid = await GetProfileUid(toUsername);
  if (!tuid) return false;
  const mutation = new dgraph.Mutation();
  try {
    if (unblock) {
      mutation.setDelNquads(`<${uid}> <Profile.blockedUsers> <${tuid}> .`);
    } else {
      mutation.setSetNquads(`<${uid}> <Profile.blockedUsers> <${tuid}> .`);
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Like or unlike a comment by incr/decr the `Comment.likesCount` and `Profile.likedComments`
    @param username: string
    @param commentId: string
    @param like: boolean = true
*/
async function LikeOrUnLikeComment(
  username: string,
  commentId: string,
  like: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);

    if (!uid) return false;
    const commentUid = await GetCommentUid(commentId);

    if (!commentUid) return false;
    const mutation = new dgraph.Mutation();
    if (like) {
      mutation.setSetNquads(
        `<${uid}> <Profile.likes> <${commentUid}> .
                <${commentUid}> <Comment.likes> <${uid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.likes> <${commentUid}> .
                <${commentUid}> <Comment.likes> <${uid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  }
}

/*
    Delete a post in dgraph with the `Post` type
    @param username: string
    @param postId: string
*/
async function DeletePostD(username: string, postId: string): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const postData = await GetPostD(postId);
    if (!postData || postData.user.username === username) return false;
    const postUid = await GetPostUid(postId);
    if (!postUid) return false;
    // works
    const mutation = new dgraph.Mutation();
    const p = {
      uid: postUid,
    };
    mutation.setDeleteJson(p);
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Add or remove a like on a post by incr/derc the `Post.likesCount` and `Profile.likedPosts`
    @param username: string
    @param postId: string
    @param like: boolean = true
*/
async function AddOrRmLikeOnPost(
  username: string,
  postId: string,
  like: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const postUid = await GetPostUid(postId);
    if (!postUid) return false;
    const mutation = new dgraph.Mutation();
    if (like) {
      mutation.setSetNquads(
        `<${uid}> <Profile.likes> <${postUid}> .
                <${postUid}> <Post.likes> <${uid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.likes> <${postUid}> .
                <${postUid}> <Post.likes> <${uid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  }
}

/*
    Add or remove a like on a comment by incr/derc the `Comment.likesCount` and `Profile.likedComments`
    @param username: string
    @param commentId: string
*/
async function AddOrRmLikeOnComment(
  username: string,
  commentId: string,
  like: boolean = true
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const commentUid = await GetCommentUid(commentId);
    if (!commentUid) return false;
    const mutation = new dgraph.Mutation();
    if (like) {
      mutation.setSetNquads(
        `<${uid}> <Profile.likedComments> <${commentUid}> .
                <${commentUid}> <Comment.likes> <${uid}> .`
      );
    } else {
      mutation.setDelNquads(
        `<${uid}> <Profile.likedComments> <${commentUid}> .
                <${commentUid}> <Comment.likes> <${uid}> .`
      );
    }
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

async function MakeAccountPrivate(username: string, makePrivate: boolean) {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;
    const mutation = new dgraph.Mutation();
    if (makePrivate)
      mutation.setDelNquads(`<${uid}> <Profile.isPrivate> "true" .`);
    else mutation.setSetNquads(`<${uid}> <Profile.isPrivate> "true" .`);
    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  }
}

/*
    Edit user in dgraph with the `Profile` type
    @param username: string
    @param rname: string
    @param profilePicture: string
    @param backgroundPicture: string
    @param accent: string
*/
async function EditUser(
  username: string,
  rname: string,
  profilePicture: string,
  backgroundPicture: string,
  accent: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);

    if (!uid) return false;
    const mutation = new dgraph.Mutation();
    let mutationString = ``;
    if (rname || rname.length > 0)
      mutationString += `<${uid}> <Profile.rname> "${rname}" .`;
    if (profilePicture || profilePicture.length > 0)
      mutationString += `<${uid}> <Profile.profilePicture> "${profilePicture}" .`;
    if (backgroundPicture || backgroundPicture.length > 0)
      mutationString += `<${uid}> <Profile.backgroundPicture> "${backgroundPicture}" .`;
    if (accent || accent.length > 0)
      mutationString += `<${uid}> <Profile.accent> "${accent}" .`;
    if (mutationString.length <= 0) return false;
    mutation.setSetNquads(mutationString);

    await txn.mutate(mutation);
    await txn.commit();
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Delete user in dgraph with the `Profile` type
    @param username: string
*/
async function DeleteUserD(username: string): Promise<boolean> {
  const txn = dgraphClient.newTxn();
  try {
    const uid = await GetProfileUid(username);
    if (!uid) return false;

    // get created posts
    // const getUserPosts = await GetUserPosts(
    //   username,
    //   0,
    //   Integer.MAX_VALUE.toNumber()
    // );
    // if (!getUserPosts) return false;
    // const postUids = getUserPosts.map((post) => post.postId);
    // // delete all posts
    // for (let postId of postUids) {
    //   await DeletePostD(username, postId);
    // }
    // delete all follows

    // delete all
    // const mutation = new dgraph.Mutation();
    // mutation.setDeleteJson({
    //   uid: uid,
    // });
    // const didDelete = await txn.mutate(mutation);
    // console.log(!didDelete, "did delete");
    // if (!didDelete) return false;
    const deleteSetMutation = new dgraph.Mutation();
    // deleteSetMutation.setSetNquads(
    //   `
    //   <${uid}> <Profile.posts> * .
    //   <${uid}> <Profile.following> * .
    //   <${uid}> <Profile.isVerified> * .
    //   <${uid}> <Profile.isPrivate> * .
    //   <${uid}> <Profile.rname> * .
    //   <${uid}> <Profile.profilePicture> * .
    //   <${uid}> <Profile.backgroundPicture> * .
    //   <${uid}> <Profile.accent> * .
    //   <${uid}> <Profile.following> * .
    //   <${uid}> <Profile.username> * .
    //   <${uid}> <Profile.followers> * .
    //   <${uid}> <Profile.blockedUsers> * .
    //   <${uid}> <Profile.pinnedHashtags> * .
    //   <${uid}> <Profile.likes> * .
    //   <${uid}> <Profile.likedComments> * .
    //   <${uid}> <Profile.viewed> * .
    //   <${uid}> <Profile.clickedOn> * .
    //   `
    // );
    deleteSetMutation.setDelNquads(
      `
      <${uid}> * * .
      `
    );
    await txn.mutate(deleteSetMutation);
    await txn.commit();

    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

export {
  CreateClickedOn,
  FollowOrUnFollowUser,
  FollowOrUnFollowHashtag,
  BlockOrUnBlockUser,
  LikeOrUnLikePost,
  LikeOrUnLikeComment,
  CommentOnPost,
  CreatePostD,
  DeletePostD,
  EditUser,
  AddOrRmLikeOnComment,
  AddOrRmLikeOnPost,
  DeleteComment,
  DeleteUserD,
  CreateUserD,
  CreateViewed,
  GetPostD,
  VerifyUser,
  MakeAccountPrivate,
};
