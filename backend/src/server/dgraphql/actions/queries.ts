import { dgraphClient } from "../../../app.js";
import {
  CollaborativeFilteringQuery,
  DidLikePostQuery,
  FriendSuggestionQuery,
  GetBlockedUsersQuery,
  GetCommentQuery,
  GetCommentUidQuery,
  GetCommentsQuery,
  GetFollowRequestsQuery,
  GetFollowingPostsQuery,
  GetHashtagPostsFilterViewedQuery,
  GetHashtagPostsQuery,
  GetHashtagUidQuery,
  GetMostFollowedWithLoginQuery,
  GetMostPinnedHashtagsQuery,
  GetNewestHashtagPostsQuery,
  GetPinnedHashtagsQuery,
  GetPopularPostsFilterUserViewedQuery,
  GetPopularPostsQuery,
  GetPostUidQuery,
  GetUserLikedPostsQuery,
  GetUserPostsQuery,
  GetUserQuery,
  GetUserUidQuery,
  GetUserViewedPostsQuery,
  HashtagRecomendationPinsQuery,
  IsBlockedQuery,
  IsFollowingQuery,
  MostFollowedUsersQuery,
} from "../constants.js";
import { PostNeo } from "../../../@types/post.js";
import { IMiniUser, IUser } from "../../../@types/user.js";
import dgraph from "dgraph-js";
import { CommentNeo, IComment } from "../../../@types/comment.js";
import { IDHashtag } from "../../../@types/hashtag.js";

/*
 */
async function CollaborativeFiltering(
  username: string,
  pageSize: number = 5
): Promise<PostNeo[]> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  const vars = { $a: username, $f: String(pageSize) };
  try {
    const res = await txn.queryWithVars(CollaborativeFilteringQuery, vars);

    const posts: PostNeo[] = res.getJson().recommendation;
    return posts;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get posts with a certain hashtag if username is null then it will not filter out posts that the user has already viewed
    @param username: string | null
    @param hashtag: string
    @param pageNum: number
    @param pageSize: number
    @return PostNeo[]
*/
async function GetHashtagPosts(
  username: string | null,
  hashtag: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const params = {
      $h: hashtag,
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    };
    let query: string;
    if (username) {
      params["$a"] = username;
      query = GetHashtagPostsFilterViewedQuery;
    } else {
      query = GetHashtagPostsQuery;
    }
    const hPosts = await txn.queryWithVars(query, params);

    return hPosts.getJson().getPosts;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}
/*
    Get hashtag recomendations for a user
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return string[] hashtag names
*/
async function HashtagRecomendation(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<string[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const vars = {
      $a: username,
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    };
    const hashtags = await txn.queryWithVars(
      HashtagRecomendationPinsQuery,
      vars
    );
    if (hashtags.getJson().findProfile[0].hashtags.length <= 0) {
      return [];
      const otherHashtags = await txn.queryWithVars(
        HashtagRecomendationPinsQuery,
        {
          $a: username,
          $o: String(pageNum * pageSize),
          $f: String(pageSize),
        }
      );
      if (otherHashtags.getJson().findProfile.length <= 0) return [];
      return otherHashtags.getJson().findProfile[0].hashtags as string[];
    }
    return hashtags.getJson().findProfile[0].hashtags || ([] as string[]);
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

async function GetNewestHashtagPosts(
  hashtag: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const params = {
      $a: hashtag,
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    };
    const hPosts = await txn.queryWithVars(GetNewestHashtagPostsQuery, params);
    return hPosts.getJson().findPosts[0].getPosts;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get a specific comment by commentId
    @param commentId: string
    @return IComment
*/
async function GetComment(commentId: string): Promise<IComment> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const comment = await txn.queryWithVars(GetCommentQuery, {
      $a: commentId,
    });
    return comment.getJson().findComment[0] as IComment;
  } catch (err) {
    return;
  } finally {
    await txn.discard();
  }
}

/*
    Get friend suggestions for a user by 
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return IMiniUser[]
*/
async function FriendSuggestion(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<IMiniUser[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $a: username,
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const res = await txn.queryWithVars(FriendSuggestionQuery, vars);

    if (res.getJson().TopRecommendations.length <= 0) return [];
    return res.getJson().TopRecommendations as IMiniUser[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get top posts if username is null then it will not filter out posts that the user has already viewed
    @param username: string | null
    @param pageNum: number
    @param pageSize: number = 5
    @return PostNeo[]
*/
async function GetTopPosts(
  username: string | null,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    let query = GetPopularPostsQuery;
    if (username) {
      vars["$a"] = username;
      query = GetPopularPostsFilterUserViewedQuery;
    }
    const posts = await txn.queryWithVars(query, vars);
    return posts.getJson().findPost as PostNeo[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

async function DidLikePost(username: string, postId: string): Promise<boolean> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const user = await txn.queryWithVars(DidLikePostQuery, {
      $a: username,
      $b: postId,
    });
    if (user.getJson().findProfile.length <= 0) return false;
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

async function IsBlocked(
  username: string,
  blockedUsername: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const isBlocked = await txn.queryWithVars(IsBlockedQuery, {
      $a: username,
      $b: blockedUsername,
    });
    if (isBlocked.getJson().findProfile.length <= 0) return false;
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get the uid of a post
    @param postId: string
    @return string | false
*/
async function GetPostUid(postId: string): Promise<string | false> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const postUid = await txn.queryWithVars(GetPostUidQuery, {
      $a: postId,
    });
    if (postUid.getJson().findPost.length <= 0) return false;
    return postUid.getJson().findPost[0].uid as string;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get liked posts by a user
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return PostNeo[]
*/
async function GetLikedPosts(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $a: username,
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const res = await txn.queryWithVars(GetUserLikedPostsQuery, vars);
    if (res.getJson().findProfile.length <= 0) return [];
    return res.getJson().findProfile[0].liked as PostNeo[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get recently viewed posts by a user
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return PostNeo[]
*/
async function GetHistoryPosts(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $a: username,
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const res = await txn.queryWithVars(GetUserViewedPostsQuery, vars);
    return res.getJson().findProfile[0].viewed as PostNeo[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}
/*
    Get posts from users that a user is following
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return PostNeo[]
*/
async function GetFollowingPosts(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $a: username,
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const res = await txn.queryWithVars(GetFollowingPostsQuery, vars);
    return res.getJson().posts as PostNeo[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get posts from a user
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return PostNeo[]
*/
async function GetUserPosts(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<PostNeo[]> {
  pageSize = Math.min(pageSize, 50);
  const vars = {
    $a: username,
    $o: String(pageNum * pageSize),
    $f: String(pageSize),
  };
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const res = await txn.queryWithVars(GetUserPostsQuery, vars);
    if (res.getJson().findProfile.length <= 0) return [];
    return res.getJson().findProfile[0]["Profile.posts"] as PostNeo[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get a user by username
    @param username: string
    @return IUser
*/
async function GetUserD(username: string): Promise<IUser> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const user = await txn.queryWithVars(GetUserQuery, {
      $a: username,
    });
    if (user.getJson().findProfile.length <= 0) return null;
    return user.getJson().findProfile[0] as IUser;
  } catch (err) {
    return;
  } finally {
    await txn.discard();
  }
}

async function IsFollowingUser(
  username: string,
  followingUsername: string
): Promise<boolean> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const user = await txn.queryWithVars(IsFollowingQuery, {
      $a: username,
      $b: followingUsername,
    });
    if (user.getJson().findProfile.length <= 0) return false;
    return true;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get the uid of a user
    @param username: string
    @return string | false
*/
async function GetProfileUid(username: string): Promise<string | false> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const vars = { $a: username };
    const uidGetResponse = await txn.queryWithVars(GetUserUidQuery, vars);
    if (
      !uidGetResponse.getJson().findProfile ||
      uidGetResponse.getJson().length <= 0
    )
      return false;

    const uid = uidGetResponse.getJson().findProfile[0].uid;
    if (uid) {
      return uid;
    }
    return false;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get the uid of a hashtag 
    @param hashtag: string
    @return string | false
*/
async function GetHashtagUid(hashtag: string): Promise<string | false> {
  const txn = dgraphClient.newTxn({});
  try {
    const hashtagUid = await txn.queryWithVars(GetHashtagUidQuery, {
      $a: hashtag,
    });
    if (hashtagUid.getJson().findHashtag.length <= 0) {
      const mu = new dgraph.Mutation();
      mu.setSetJson({
        "Hashtag.hashtag": hashtag,
        "dgraph.type": "Hashtag",
      });
      const nhashtagUid: string | false =
        (await txn.mutate(mu)).getUidsMap().arr_[0][1] || false;
      if (!nhashtagUid) return false;
      await txn.commit();
      return nhashtagUid;
    }
    return hashtagUid.getJson().findHashtag[0].uid;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

/*
    Get the hashtags that a user has pinned `Profile.pinnedHashtags`
    @param username: string
    @param pageNum: number
    @param pageSize: number = 5
    @return string[] pinned hashtag names
*/
async function GetPinnedHashtags(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<string[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const hashtags = await txn.queryWithVars(GetPinnedHashtagsQuery, {
      $a: username,
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    });
    if (hashtags.getJson().findProfile.length <= 0) return [];
    // this returns an array of objects with the key hashtag
    // I need to change it to return an array of strings
    const hashtagArr: string[] = [];
    for (const hashtag of hashtags.getJson().findProfile[0].phashtags) {
      hashtagArr.push(hashtag.hashtag);
    }
    return hashtagArr;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get the most pinned hashtags
    @param pageNum: number
    @param pageSize: number = 5
    @return string[] pinned hashtag names
*/
async function GetMostPinnedHashtags(
  pageNum: number,
  pageSize: number = 5
): Promise<IDHashtag[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const hashtags = await txn.queryWithVars(GetMostPinnedHashtagsQuery, {
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    });

    return hashtags.getJson().topHashtags as IDHashtag[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get the most followed users
    @param pageNum: number
    @param pageSize: number = 5
    @return IMiniUser[] most followed users
*/
async function GetMostFollowedUser(
  username: string | null = null,
  pageNum: number,
  pageSize: number = 5
): Promise<IMiniUser[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    let query = MostFollowedUsersQuery;
    const vars = {
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    };
    if (username) {
      vars["$a"] = username;
      query = GetMostFollowedWithLoginQuery;
    }
    const users = await txn.queryWithVars(query, vars);
    return users.getJson().findUser as IMiniUser[];
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get comments sort by highest likes
    @param postId: string
    @param pageNum: number
    @param pageSize: number = 5
*/
async function GetComments(
  postId: string,
  pageNum: number,
  pageSize: number = 5
): Promise<IComment[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const comments = await txn.queryWithVars(GetCommentsQuery, {
      $a: postId,
      $o: String(pageNum * pageSize),
      $f: String(pageSize),
    });

    const commentArr: CommentNeo[] = comments.getJson().getComments;
    const returnComments: IComment[] = [];
    for (const comment of commentArr) {
      if (comment && comment.commentId) {
        returnComments.push({
          commentId: comment.commentId,
          comment: comment.comment,
          rname: comment.user.rname,
          username: comment.user.username,
          profilePicture: comment.user.profilePicture,
          isVerified: comment.user.isVerified,
          timestamp: comment.timestamp,
          likes: comment.likes,
        });
      }
    }
    return returnComments;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

/*
    Get the uid of a comment
    @param commentId: string
    @return string | false
*/
async function GetCommentUid(commentId: string): Promise<string | false> {
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const commentUid = await txn.queryWithVars(GetCommentUidQuery, {
      $a: commentId,
    });
    if (
      commentUid.getJson() &&
      commentUid.getJson().findComment &&
      commentUid.getJson().findComment.length <= 0
    )
      return false;

    return commentUid.getJson().findComment[0].uid as string;
  } catch (err) {
    return false;
  } finally {
    await txn.discard();
  }
}

async function GetBlockedUsers(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<string[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const blockedUsers = await txn.queryWithVars(GetBlockedUsersQuery, {
      $a: username,
      $o: String(pageNum),
      $f: String(pageSize),
    });
    if (blockedUsers.getJson().findProfile.length <= 0) return [];
    const blockedUsersArr: string[] = [];
    for (const user of blockedUsers.getJson().findProfile[0].blocked) {
      blockedUsersArr.push(user.username);
    }
    return blockedUsersArr;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

async function GetFollowRequests(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<IMiniUser[]> {
  pageSize = Math.min(pageSize, 50);
  const txn = dgraphClient.newTxn({ readOnly: true });
  try {
    const followRequests = await txn.queryWithVars(GetFollowRequestsQuery, {
      $a: username,
      $o: String(pageNum),
      $f: String(pageSize),
    });
    if (followRequests.getJson().findProfile.length <= 0) return [];
    const followRequestsArr: IMiniUser[] = [];
    for (const user of followRequests.getJson().findProfile[0].followRequests) {
      followRequestsArr.push({
        username: user.username,
        profilePicture: user.profilePicture,
        rname: user.rname,
        isVerified: user.isVerified,
      });
    }
    return followRequestsArr;
  } catch (err) {
    return [];
  } finally {
    await txn.discard();
  }
}

export {
  GetComments,
  CollaborativeFiltering,
  FriendSuggestion,
  GetTopPosts,
  GetFollowingPosts,
  GetHistoryPosts,
  GetLikedPosts,
  GetUserPosts,
  GetUserD,
  GetMostPinnedHashtags,
  GetMostFollowedUser,
  GetPinnedHashtags,
  GetHashtagUid,
  GetPostUid,
  GetCommentUid,
  GetComment,
  GetProfileUid,
  HashtagRecomendation,
  GetHashtagPosts,
  IsFollowingUser,
  IsBlocked,
  GetNewestHashtagPosts,
  DidLikePost,
  GetBlockedUsers,
  GetFollowRequests,
};
