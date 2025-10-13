import { ITiniUser } from "../../@types/user.js";
import { WeaviateHashtag } from "../../@types/hashtag.js";
import {
  IMiniPost,
  IPost,
  ITiniPost,
  PostWeaviate,
  SimilarPost,
} from "../../@types/post.js";
import { weaviateClient } from "../../app.js";

async function DeletePostWeaviate(
  postId: string,
  username: string
): Promise<boolean> {
  // check if user is the owner of the post
  try {
    const res = await weaviateClient.graphql
      .get()
      .withClassName("Posts")
      .withFields("username _additional{id}")
      .withWhere({
        operator: "Equal",
        path: ["id"],
        valueText: postId,
      })
      .withLimit(1)
      .do();

    if (
      res.data.Get.Posts.length <= 0 ||
      res.data.Get.Posts[0].username !== username
    ) {
      return false;
    }
    await weaviateClient.data
      .deleter()
      .withClassName("Posts")
      .withId(postId)
      .do();
    return true;
  } catch (err) {
    return false;
  }
}

async function AddPostToWeaviate(
  uri: string,
  username: string,
  hashtag: string
): Promise<false | string> {
  // check if hashtag exists if not add it as a new topic
  try {
    await addHashtagToWeaviate(hashtag);
    const weaviateResponse = await weaviateClient.data
      .creator()
      .withClassName("Posts")
      .withProperties({
        uri: uri,
        username: username,
        hashtag: hashtag,
      })
      .do();
    return weaviateResponse.id;
  } catch (err) {
    return false;
  }
}

async function GetUserId(username: string): Promise<string | undefined> {
  try {
    const res = await weaviateClient.graphql
      .get()
      .withClassName("Users")
      .withFields("username _additional{id}")
      .withWhere({
        operator: "Equal",
        path: ["username"],
        valueText: username,
      })
      .withLimit(1)
      .do();
    if (res.data.Get.Users.length <= 0) return undefined;
    return res.data.Get.Users[0]._additional.id;
  } catch (err) {
    return undefined;
  }
}

async function DeleteWeaviateUser(username: string): Promise<boolean> {
  try {
    const id = await GetUserId(username);
    if (id === undefined) return false;
    await weaviateClient.data.deleter().withClassName("Users").withId(id).do();
    // delete all posts of the user
    const posts = await weaviateClient.graphql
      .get()
      .withClassName("Posts")
      .withFields("username _additional{id}")
      .withWhere({
        operator: "Equal",
        path: ["username"],
        valueText: username,
      })
      .do();
    for (let post of posts.data.Get.Posts) {
      await weaviateClient.data
        .deleter()
        .withClassName("Posts")
        .withId(post._additional.id)
        .do();
    }
    return true;
  } catch (err) {
    return false;
  }
}

async function addHashtagToWeaviate(hashtag: string) {
  // check if hashtag exists if not add it as a new topic
  const doesHashtagExist = await weaviateClient.graphql
    .get()
    .withClassName("Hashtags")
    .withFields("hashtag")
    .withWhere({
      operator: "Equal",
      path: ["hashtag"],
      valueString: hashtag,
    })
    .do();
  if (
    doesHashtagExist.data.Get.Hashtags !== undefined &&
    doesHashtagExist.data.Get.Hashtags.length !== 0
  )
    return false;
  await weaviateClient.data
    .creator()
    .withClassName("Hashtags")
    .withProperties({
      hashtag: hashtag,
    })
    .do();
  return true;
}

async function SimilarPosts(
  postId: string,
  pageNum: number,
  limit: number = 5
): Promise<SimilarPost[]> {
  // I'd suggest the more widely used offset instead of from. So (offset: 100, limit: 10) would retrieve results from 101-110 (Example)
  try {
    const res = await weaviateClient.graphql
      .get()
      .withClassName("Posts")
      .withFields("_additional{id} uri")
      .withNearText({
        concepts: [postId],
      })
      .withLimit(limit)
      .withOffset(pageNum * limit)
      .do();
    return res.data.Get.Posts;
  } catch (err) {
    return [];
  }
}

// O(1)
async function getPost(postId: string): Promise<PostWeaviate | undefined> {
  if (postId === undefined) return undefined;
  const res = await weaviateClient.graphql
    .get()
    .withClassName("Posts")
    .withFields("uri username hashtag timestamp _additional{id}")
    .withWhere({
      operator: "Equal",
      path: ["id"],
      valueText: postId,
    })
    .withLimit(1)
    .do();

  return res.data.Get.Posts[0];
}

async function AddUser(
  name: string,
  username: string,
  ip: string
): Promise<boolean> {
  try {
    await weaviateClient.data
      .creator()
      .withClassName("Users")
      .withProperties({
        name: name,
        username: username,
        ip: ip,
      })
      .do();
    return true;
  } catch (err) {
    return false;
  }
}

async function ChangeName(name: string, username: string): Promise<boolean> {
  try {
    const id = await GetUserId(username);
    await weaviateClient.data
      .merger()
      .withClassName("Users")
      .withId(id)
      .withProperties({
        name: name,
      })
      .do();
    return true;
  } catch (err) {
    return false;
  }
}

async function SearchUser(
  username: string,
  pageNum: number,
  pageSize: number = 5
): Promise<ITiniUser[]> {
  try {
    const vectorRes = await weaviateClient.graphql
      .get()
      .withClassName("Users")
      .withFields("username name")
      .withNearText({
        concepts: [username],
      })
      .withLimit(pageSize)
      .withOffset(pageNum * pageSize)
      .do();

    return vectorRes.data.Get.Users as ITiniUser[];
  } catch (err) {
    return [];
  }
}

async function SearchHastags(
  hashtag: string,
  pageNum: number,
  pageSize: number = 5
): Promise<string[]> {
  try {
    const vectorRes = await weaviateClient.graphql
      .get()
      .withClassName("Hashtags")
      .withFields("hashtag")
      .withNearText({
        concepts: [hashtag.toLowerCase()],
      })
      .withLimit(pageSize)
      .withOffset(pageNum * pageSize)
      .do();
    const hashtags: WeaviateHashtag[] = vectorRes.data.Get.Hashtags;
    // get the hashtag property from the object
    const returnHashtags: string[] = hashtags.map(
      (hashtag: WeaviateHashtag) => hashtag.hashtag
    );
    return returnHashtags;
  } catch (err) {}
  return [];
}

async function SearchPosts(
  post: string,
  pageNum: number,
  pageSize: number = 5
): Promise<ITiniPost[]> {
  try {
    // vector search
    const vectorRes = await weaviateClient.graphql
      .get()
      .withClassName("Posts")
      .withFields("_additional {id} uri")
      .withNearText({
        concepts: [post],
      })
      .withLimit(pageSize)
      .withOffset(pageNum * pageSize)
      .do();
    const miniPost: ITiniPost[] = [];
    for (let post of vectorRes.data.Get.Posts) {
      miniPost.push({
        postId: post._additional.id,
        uri: post.uri,
      });
    }
    return miniPost;
  } catch (err) {}
  return [];
}

export {
  SimilarPosts,
  AddPostToWeaviate,
  DeletePostWeaviate,
  getPost,
  addHashtagToWeaviate,
  AddUser,
  SearchHastags,
  SearchUser,
  SearchPosts,
  DeleteWeaviateUser,
  ChangeName,
};
