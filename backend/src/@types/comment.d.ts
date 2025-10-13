export interface IComment {
    commentId: string;
    comment: string;
    rname: string;
    username: string;
    profilePicture: string;
    isVerified: boolean;
    timestamp: string;
    likes: number;
}

export interface CommentNeo {
    commentId: string;
    comment: string;
    user: {
        username: string;
        profilePicture: string;
        rname: string;
        isVerified: boolean;
    };
    timestamp: string;
    likes: number;
}

export interface ICommentNeo {
    commentId: string;
    comment: string;
    username: string;
    likes: number;
    timestamp: string;
}
