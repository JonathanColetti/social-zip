import { DocumentNode, gql } from "@apollo/client";

export const ProfileByAuth = (): DocumentNode => gql`
  query Query {
    getUser {
      accent
      backgroundPicture
      rname
      profilePicture
      username
      followers
      isVerified
      following
    }
  }
`;
export const ProfileByUsername = (): DocumentNode => gql`
  query GetUser($username: String) {
    getUser(username: $username) {
      accent
      backgroundPicture
      followers
      following
      rname
      profilePicture
      username
      isVerified
      isFollowing
    }
  }
`;

export const GetProfileSuggestions = (): DocumentNode => gql`
  query Query($pageNum: Int) {
    getFriendSuggestions(pageNum: $pageNum) {
      rname
      username
      profilePicture
    }
  }
`;

export const GetCommentsWithNumberOfComments = (): DocumentNode => gql`
  query GetComments($postId: String) {
    getComments(postId: $postId) {
      comment
      likes
      commentId
      profilePicture
      timestamp
      username
    }
  }
`;

export const GetComments = (): DocumentNode => gql`
  query GetComments($postId: String, $pageNum: Int) {
    getComments(postId: $postId, pageNum: $pageNum) {
      comment
      commentId
      likes
      timestamp
      profilePicture
      username
    }
  }
`;

export const GetPostsByUsername = (): DocumentNode => gql`
  query GetUserPosts($username: String, $pageNum: Int) {
    getUserPosts(username: $username, pageNum: $pageNum) {
      postId
      comments
      likes
      timestamp
      uri
      views
    }
  }
`;

export const GetBlockedUsers = (): DocumentNode => gql`
  query Query($pageNum: Int) {
    getBlockedUsers(pageNum: $pageNum)
  }
`;

export const GetSimilarPosts = (): DocumentNode => gql`
  query Query($postId: String, $pageNum: Int) {
    similarPosts(postId: $postId, pageNum: $pageNum) {
      postId
      uri
    }
  }
`;

export const GetHashtags = (): DocumentNode => gql`
  query GetHashtags($pageNum: Int) {
    getHashtags(pageNum: $pageNum) {
      hashtag
    }
  }
`;

export const GetPost = (): DocumentNode => gql`
  query GetPost($postId: String) {
    getPost(postId: $postId) {
      timestamp
      uri
      postId
      rname
      profilePicture
      username
    }
  }
`;

export const GetPosts = (): DocumentNode => gql`
  query Query($pageNum: Int) {
    getPosts(pageNum: $pageNum) {
      timestamp
      comments
      uri
      postId
      likes
      rname
      profilePicture
      username
      views
    }
  }
`;

export const GetHashtagRecomendations = (): DocumentNode => gql`
  query Query($pageNum: Int) {
    getHashtags(pageNum: $pageNum) {
      hashtag
      isPinned
    }
  }
`;

export const GetProfilePicture = (): DocumentNode => gql`
  query Query {
    getUser {
      profilePicture
    }
  }
`;

export const PinHashtag = (): DocumentNode => gql`
  mutation Mutation($hashtag: String) {
    followHashtag(hashtag: $hashtag)
  }
`;

export const UnpinHashtag = (): DocumentNode => gql`
  mutation Mutation($hashtag: String) {
    unfollowHashtag(hashtag: $hashtag)
  }
`;

export const GetPinnedHashtags = (): DocumentNode => gql`
  query GetPinnedHashtags($pageNum: Int) {
    getPinnedHashtags(pageNum: $pageNum) {
      hashtag
      isPinned
    }
  }
`;

export const GetHistoryPosts = (): DocumentNode => gql`
  query GetHistoryPosts($pageNum: Int) {
    getHistoryPosts(pageNum: $pageNum) {
      postId
      uri
    }
  }
`;

export const GetLikedPosts = (): DocumentNode => gql`
  query GetLikedPosts($pageNum: Int) {
    getLikedPosts(pageNum: $pageNum) {
      postId
      uri
    }
  }
`;
export const GetNotifications = (): DocumentNode => gql`
  query GetNotifications($lastSortKey: String) {
    getNotifications(lastSortKey: $lastSortKey) {
      stimestamp
      message
      postId
      profilePicture
      username
    }
  }
`;

export const GetFollowingPosts = (): DocumentNode => gql`
  query Query($pageNum: Int) {
    getFollowingPosts(pageNum: $pageNum) {
      comments
      postId
      timestamp
      likes
      rname
      profilePicture
      username
      uri
      views
    }
  }
`;

export const GetPostById = (): DocumentNode => gql`
  query Query($postId: String) {
    getPost(postId: $postId) {
      uri
      comments
      timestamp
      postId
      likes
      rname
      profilePicture
      username
      views
      isLiked
    }
  }
`;

export const GetPopularPosts = (): DocumentNode => gql`
  query GetPopularPosts($pageNum: Int) {
    getPopularPosts(pageNum: $pageNum) {
      comments
      likes
      postId
      profilePicture
      rname
      uri
      timestamp
      username
      views
    }
  }
`;

export const GetPostsByHashtag = (): DocumentNode => gql`
  query GetPostsByHashtag($hashtag: String, $pageNum: Int) {
    getPostsByHashtag(hashtag: $hashtag, pageNum: $pageNum) {
      comments
      likes
      postId
      profilePicture
      rname
      timestamp
      uri
      username
      views
    }
  }
`;

export const GetPostsBySearch = (): DocumentNode => gql`
  query GetPostsBySearch($query: String, $pageNum: Int) {
    getPostsBySearch(query: $query, pageNum: $pageNum) {
      uri
      postId
    }
  }
`;
export const GetHastagsBySearch = (): DocumentNode => gql`
  query GetHashtagsBySearch($query: String, $pageNum: Int) {
    getHashtagsBySearch(query: $query, pageNum: $pageNum)
  }
`;
export const GetUsersBySearch = (): DocumentNode => gql`
  query GetUsersBySearch($query: String, $pageNum: Int) {
    getUsersBySearch(query: $query, pageNum: $pageNum) {
      isVerified
      profilePicture
      rname
      username
    }
  }
`;
