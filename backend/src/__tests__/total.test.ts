import {
    CommentOnPost,
    CreateClickedOn,
    CreatePostD,
    CreateViewed,
    DeleteUserD,
    FollowOrUnFollowUser,
    LikeOrUnLikeComment,
    LikeOrUnLikePost,
} from "../server/dgraphql/actions/mutations";
import { GetUserD } from "../server/dgraphql/actions/queries";
import { CreateUser } from "../server/dynamodb/index";
import { AddPostToWeaviate, DeleteWeaviateUser } from "../server/weaviate";

describe("Make sure everything works in harmony", () => {
    beforeAll(async () => {
        // Create the users
        const userOne = "test1";
        const userTwo = "test2";
        const userThree = "test3";
        const userFour = "test4";
        const userFive = "test5";
        await CreateUser(userOne, "1", "1", "test1", "2003-12-15");
        await CreateUser(userTwo, "2", "2", "test2", "2003-12-15");
        await CreateUser(userThree, "3", "3", "test3", "2003-12-15");
        await CreateUser(userFour, "4", "4", "test4", "2003-12-15");
        await CreateUser(userFive, "5", "5", "test5", "2003-12-15");
        const hashtagOne = "italy";
        const hashtagTwo = "france";
        const hashtagThree = "spain";

        // Create the posts & hashtags
        const postId1 = await AddPostToWeaviate(
            "<h1>test1</h1>",
            userOne,
            hashtagOne
        );
        if (!postId1) throw new Error("postId1 is false");
        const postId2 = await AddPostToWeaviate(
            "<h1>test2</h1>",
            userTwo,
            hashtagTwo
        );
        if (!postId2) throw new Error("postId2 is false");
        const postId3 = await AddPostToWeaviate(
            "<h1>test3</h1>",
            userThree,
            hashtagThree
        );
        if (!postId3) throw new Error("postId3 is false");
        const postId4 = await AddPostToWeaviate(
            "<h1>test4</h1>",
            userFour,
            hashtagOne
        );
        if (!postId4) throw new Error("postId4 is false");
        const postId5 = await AddPostToWeaviate(
            "<h1>test5</h1>",
            userFive,
            hashtagThree
        );
        if (!postId5) throw new Error("postId5 is false");
        const postId6 = await AddPostToWeaviate(
            "<h1>test6</h1>",
            userThree,
            hashtagOne
        );
        if (!postId6) throw new Error("postId6 is false");
        const postId7 = await AddPostToWeaviate(
            "<h1>test7</h1>",
            userThree,
            hashtagThree
        );
        if (!postId7) throw new Error("postId7 is false");
        const d1 = await CreatePostD(userOne, postId1, hashtagOne);
        if (!d1) throw new Error("d1 is false");
        const d2 = await CreatePostD(userTwo, postId2, hashtagTwo);
        if (!d2) throw new Error("d2 is false");
        const d3 = await CreatePostD(userThree, postId3, hashtagThree);
        if (!d3) throw new Error("d3 is false");
        const d4 = await CreatePostD(userFour, postId4, hashtagOne);
        if (!d4) throw new Error("d4 is false");
        const d5 = await CreatePostD(userFive, postId5, hashtagThree);
        if (!d5) throw new Error("d5 is false");
        const d6 = await CreatePostD(userThree, postId6, hashtagOne);
        if (!d6) throw new Error("d6 is false");
        const d7 = await CreatePostD(userThree, postId7, hashtagThree);
        if (!d7) throw new Error("d7 is false");

        // Likes
        const didLike = await LikeOrUnLikePost(userOne, postId2);
        if (!didLike) throw new Error("didLike is false");
        const didLike2 = await LikeOrUnLikePost(userOne, postId3);
        if (!didLike2) throw new Error("didLike2 is false");
        const didLike3 = await LikeOrUnLikePost(userOne, postId4);
        if (!didLike3) throw new Error("didLike3 is false");

        // Comments
        const commentPost = await CommentOnPost(userOne, postId5, "test");
        if (!commentPost) throw new Error("commentPost is false");
        const commentPost2 = await CommentOnPost(userOne, postId6, "test");
        if (!commentPost2) throw new Error("commentPost2 is false");
        const commentPost3 = await CommentOnPost(userOne, postId7, "test");
        if (!commentPost3) throw new Error("commentPost3 is false");
        const commentPost4 = await CommentOnPost(userOne, postId1, "test");
        if (!commentPost4) throw new Error("commentPost4 is false");

        // Comment likes
        const commentLike = await LikeOrUnLikeComment(userOne, commentPost);
        if (!commentLike) throw new Error("commentLike is false");
        const commentLike2 = await LikeOrUnLikeComment(userOne, commentPost2);
        if (!commentLike2) throw new Error("commentLike2 is false");
        const commentLike3 = await LikeOrUnLikeComment(userTwo, commentPost);
        if (!commentLike3) throw new Error("commentLike3 is false");
        const commentLike4 = await LikeOrUnLikeComment(userTwo, commentPost2);
        if (!commentLike4) throw new Error("commentLike4 is false");

        // Follows
        const follow = await FollowOrUnFollowUser(userOne, userTwo);
        if (!follow) throw new Error("follow is false");
        const follow2 = await FollowOrUnFollowUser(userOne, userThree);
        if (!follow2) throw new Error("follow2 is false");
        const follow3 = await FollowOrUnFollowUser(userFive, userOne);
        if (!follow3) throw new Error("follow3 is false");
        const follow4 = await FollowOrUnFollowUser(userFour, userTwo);
        if (!follow4) throw new Error("follow4 is false");
        const follow5 = await FollowOrUnFollowUser(userThree, userTwo);
        if (!follow5) throw new Error("follow5 is false");

        // viewed
        const postViewed1 = await CreateViewed(userOne, postId1);
        if (!postViewed1) throw new Error("postViewed1 is false");
        const postViewed2 = await CreateViewed(userOne, postId2);
        if (!postViewed2) throw new Error("postViewed2 is false");
        const postViewed3 = await CreateViewed(userOne, postId3);
        if (!postViewed3) throw new Error("postViewed3 is false");
        const postViewed4 = await CreateViewed(userOne, postId4);
        if (!postViewed4) throw new Error("postViewed4 is false");
        const postViewed5 = await CreateViewed(userOne, postId5);
        if (!postViewed5) throw new Error("postViewed5 is false");

        // post A is clicked on by users 1, 2, 3, 4, 5
        // post B is clicked on by users 1, 2, 3, 4
        // post C is clicked on by users 1, 2, 3
        // post D is clicked on by users 1, 2
        // post E is clicked on by users 1
        // clicked
        const clickedOn = await CreateClickedOn(userOne, postId1);
        if (!clickedOn) throw new Error("clickedOn is false");
        const clickedOn2 = await CreateClickedOn(userTwo, postId1);
        if (!clickedOn2) throw new Error("clickedOn2 is false");
        const clickedOn3 = await CreateClickedOn(userThree, postId1);
        if (!clickedOn3) throw new Error("clickedOn3 is false");
        const clickedOn4 = await CreateClickedOn(userFour, postId1);
        if (!clickedOn4) throw new Error("clickedOn4 is false");
        const clickedOn5 = await CreateClickedOn(userFive, postId1);
        if (!clickedOn5) throw new Error("clickedOn5 is false");
        const clickedOn6 = await CreateClickedOn(userOne, postId2);
        if (!clickedOn6) throw new Error("clickedOn6 is false");
        const clickedOn7 = await CreateClickedOn(userTwo, postId2);
        if (!clickedOn7) throw new Error("clickedOn7 is false");
        const clickedOn8 = await CreateClickedOn(userThree, postId2);
        if (!clickedOn8) throw new Error("clickedOn8 is false");
        const clickedOn9 = await CreateClickedOn(userFour, postId2);
        if (!clickedOn9) throw new Error("clickedOn9 is false");
        const clickedOn10 = await CreateClickedOn(userOne, postId3);
        if (!clickedOn10) throw new Error("clickedOn10 is false");
        const clickedOn11 = await CreateClickedOn(userTwo, postId3);
        if (!clickedOn11) throw new Error("clickedOn11 is false");
        const clickedOn12 = await CreateClickedOn(userThree, postId3);
        if (!clickedOn12) throw new Error("clickedOn12 is false");
        const clickedOn13 = await CreateClickedOn(userOne, postId4);
        if (!clickedOn13) throw new Error("clickedOn13 is false");
        const clickedOn14 = await CreateClickedOn(userTwo, postId4);
        if (!clickedOn14) throw new Error("clickedOn14 is false");
        const clickedOn15 = await CreateClickedOn(userOne, postId5);
        if (!clickedOn15) throw new Error("clickedOn15 is false");
    });
    afterAll(async () => {
        const deleteUser = await DeleteWeaviateUser("test1");
        if (!deleteUser) throw new Error("deleteUser is false");
        const deleteUser2 = await DeleteWeaviateUser("test2");
        if (!deleteUser2) throw new Error("deleteUser2 is false");
        const deleteUser3 = await DeleteWeaviateUser("test3");
        if (!deleteUser3) throw new Error("deleteUser3 is false");
        const deleteUser4 = await DeleteWeaviateUser("test4");
        if (!deleteUser4) throw new Error("deleteUser4 is false");
        const deleteUser5 = await DeleteWeaviateUser("test5");
        if (!deleteUser5) throw new Error("deleteUser5 is false");
        const deleteUserD = await DeleteUserD("test1");
        if (!deleteUserD) throw new Error("deleteUserD is false");
        const deleteUserD2 = await DeleteUserD("test2");
        if (!deleteUserD2) throw new Error("deleteUserD2 is false");
        const deleteUserD3 = await DeleteUserD("test3");
        if (!deleteUserD3) throw new Error("deleteUserD3 is false");
        const deleteUserD4 = await DeleteUserD("test4");
        if (!deleteUserD4) throw new Error("deleteUserD4 is false");
        const deleteUserD5 = await DeleteUserD("test5");
        if (!deleteUserD5) throw new Error("deleteUserD5 is false");
    });

    it("a user", async () => {
        // Get user
        const theUser = await GetUserD("test1");
        // ensure type is correct

        expect(typeof theUser).toBe("IUser");
    });
    it("a post", async () => {});
    it("a hashtag", async () => {});
    it("a like relationship", async () => {});
    it("a following relationship", async () => {});
    it("a comment", async () => {});
    it("reccomendations", async () => {});
});
