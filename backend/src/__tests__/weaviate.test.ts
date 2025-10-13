import {
    DeletePostWeaviate,
    AddPostToWeaviate,
    addHashtagToWeaviate,
    SimilarPosts,
    SearchPosts,
    SearchHastags,
    SearchUser,
} from "../server/weaviate/actions";

describe("Weaviate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    // it("should add a post", async () => {
    //     const addedPost = await AddPostToWeaviate(
    //         "<h1>Test</h1>",
    //         "test_user",
    //         "test_hashtag",
    //         "toronto"
    //     );
    //     ;
    //     expect(addedPost).not.toBe(false);
    //     // const deletePostResult = await DeletePostWeaviate("test_post", "test_user");
    //     // expect(deletePostResult).toBe(true);
    // });
    // it("should add a hashtag", async () => {
    //     const addedHashtag = await addHashtagToWeaviate("test_hashtag");
    //     expect(addedHashtag).toBe(true);
    // });
    it("Calculate similar posts", async () => {
        const addPostOne = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "test_hashtag",
            "toronto"
        );
        expect(addPostOne).not.toBe(false);
        const postidone = addPostOne as string;
        const addPostTwo = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "test_hashtag",
            "montreal"
        );
        expect(addPostTwo).not.toBe(false);
        const postidtwo = addPostTwo as string;
        const addPostThree = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "random_hashtag",
            "montreal"
        );
        expect(addPostThree).not.toBe(false);
        const postidthree = addPostThree as string;
        const postsThatSimilar = await SimilarPosts(postidone, 0);
        expect(postsThatSimilar).not.toBe([]);
        expect(postsThatSimilar[0].postId).toBe(postidtwo);
    });
    it("Post search", async () => {
        const postOne = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "test_hashtag",
            "toronto"
        );
        const postOneId = postOne as string;
        expect(postOne).not.toBe(false);
        const postTwo = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "test_hashtag",
            "montreal"
        );
        const postTwoId = postTwo as string;
        expect(postTwo).not.toBe(false);
        const postThree = await AddPostToWeaviate(
            "<h1>Test</h1>",
            "test_user",
            "unrelated",
            "china"
        );
        const postThreeId = postThree as string;
        expect(postThree).not.toBe(false);
        // search for user
        const postSearch = (await SearchPosts("montreal", 0)) as any[];

        expect(postSearch).not.toBe(undefined);
        expect(postSearch).not.toBe([]);
    });
    it("Hashtag search", async () => {
        const hashtagSearch = (await SearchHastags("test", 0)) as any[];
        expect(hashtagSearch).not.toBe(undefined);
        expect(hashtagSearch).not.toBe([]);
    });
    it("User search", async () => {
        const userSearch = (await SearchUser("test", 0)) as any[];
        expect(userSearch).not.toBe(undefined);
        expect(userSearch).not.toBe([]);
    });
});
