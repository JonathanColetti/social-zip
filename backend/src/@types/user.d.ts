import { IPost } from "./post";

export interface IUser {
  isVerified: boolean;
  isFollowing?: boolean;
  isBanned: boolean;
  username: string;
  rname: string;
  profilePicture: string;
  accent: string;
  backgroundPicture: string;
  followers: number;
  following: number;
}

export interface IUserOauth {
  id: string;
  authType: string;
  email: any;
}

export interface IUserAuth {
  id: string;
  authType: string;
  birthday: string;
  email: string;
  isBanned: boolean;
  username: string;
}

export interface IMiniUser {
  profilePicture: string;
  username: string;
  rname: string;
  isVerified: boolean;
}

export interface ITiniUser {
  username: string;
  rname: string;
}

export interface IContext {
  id: string;
  authType: string;
  username: string;
}

export interface IFriendNeo {
  username: string;
  following: number;
  followers: number;
}
