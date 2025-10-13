import { DocumentNode, gql } from "@apollo/client";

export const CreateComments = (): DocumentNode => gql`
  mutation Mutation($postId: String, $comment: String) {
    createComment(postId: $postId, comment: $comment)
  }
`;

export const LikePost = (): DocumentNode => gql`
  mutation LikePost($postId: String) {
    likePost(postId: $postId)
  }
`;

export const DeletePost = gql`
  mutation Mutation($postId: String) {
    deletePost(postId: $postId)
  }
`;

export const DeleteUser = gql`
  mutation Mutation {
    deleteUser
  }
`;

export const UnLikePost = (): DocumentNode => gql`
  mutation UnlikePost($postId: String) {
    unlikePost(postId: $postId)
  }
`;

export const LikeComment = (): DocumentNode => gql`
  mutation LikeComment($commentId: String) {
    likeComment(commentId: $commentId)
  }
`;

export const UnLikeComment = (): DocumentNode => gql`
  mutation Mutation($commentId: String) {
    unlikeComment(commentId: $commentId)
  }
`;

export const FollowUser = (): DocumentNode => gql`
  mutation Mutation($toFollow: String) {
    followUser(toFollow: $toFollow)
  }
`;

export const UnFollowUser = (): DocumentNode => gql`
  mutation Mutation($toUnFollow: String) {
    unfollowUser(toUnFollow: $toUnFollow)
  }
`;

export const BlockUser = (): DocumentNode => gql`
  mutation Mutation($username: String, $unblock: Boolean) {
    blockUser(username: $username, unblock: $unblock)
  }
`;

export const ChangeAccountStatus = (): DocumentNode => gql`
  mutation Mutation($makePrivate: Boolean) {
    makePrivate(makePrivate: $makePrivate)
  }
`;

export const CreatePost = (): DocumentNode => gql`
  mutation Mutation($uri: String, $hashtag: String) {
    createPost(uri: $uri, hashtag: $hashtag)
  }
`;

export const EditProfile = (): DocumentNode => gql`
  mutation Mutation(
    $profilePicture: String
    $rname: String
    $backgroundPicture: String
    $accent: String
  ) {
    editUser(
      profilePicture: $profilePicture
      rname: $rname
      backgroundPicture: $backgroundPicture
      accent: $accent
    )
  }
`;
