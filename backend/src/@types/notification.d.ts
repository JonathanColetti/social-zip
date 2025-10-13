export interface INotification {
    username: string;
    name: string;
    profilePicture: string;
    message: string;
    postId: string | null;
    commentId: string | null;
    stimestamp: string;
}

export interface ISmallNotification {
    username: string;
    message: string;
    postId: string | null;
    commentId: string | null;
    stimestamp: string;
}
