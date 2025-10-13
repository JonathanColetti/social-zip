export interface IPost {
  _id?: string;
  postId: string;
  uri: string;
  rname: string;
  username: string;
  hashtag: string;
  isVerified: boolean;
  profilePicture: string;
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface PostNeo {
  postId: string;
  timestamp: number;
  clicks: number;
  comments: number;
  likes: number;
  views: number;
  user: {
    username: string;
    profilePicture: string;
    rname: string;
    isVerified: boolean;
  };
}

export interface PostWeaviate {
  hashtag: string;
  uri: string;
  timestamp: number;
  username: string;
}

export interface IPostStats {
  views: number;
  likes: number;
  comments: number;
}

export interface SimilarPost {
  _additional: {
    id: string;
  };
  uri: string;
}

export interface IMiniPost {
  postId: string;
  uri: string;
  rname: string;
  username: string;
  timestamp: number;
  hashtag: string;
}

export interface UserPosts {
  comments: number;
  likes: number;
  timestamp: number;
  uri: string;
  views: number;
  postId: string;
}

export interface ITiniPost {
  postId: string;
  uri: string;
}
