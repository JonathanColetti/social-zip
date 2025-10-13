export const postSchemaConfig = {
  class: "Posts",
  vectorizer: "text2vec-cohere",
  vectorIndexConfig: {
    distance: "dot",
  },
  moduleConfig: {
    "text2vec-cohere": {
      model: "multilingual-22-12",
      truncate: "RIGHT",
    },
  },
  properties: [
    {
      name: "postId",
      description: "The ID of the post",
      dataType: ["string"],
      moduleConfig: {
        "text2vec-cohere": {
          skip: true,
          vectorizePropertyName: false,
        },
      },
    },
    {
      name: "uri",
      description: "The HTML of the post",
      dataType: ["string"],
      moduleConfig: {
        "text2vec-cohere": {
          skip: false,
          vectorizePropertyName: false,
        },
      },
    },
    {
      name: "username",
      description: "The username of the user who posted the post",
      dataType: ["string"],
    },
    {
      name: "location",
      description: "The location of the user who posted the post",
      dataType: ["string"],
    },
    {
      name: "hashtag",
      description: "The hashtag of the post",
      dataType: ["string"],
    },
    {
      name: "timestamp",
      description: "The timestamp of the post",
      dataType: ["date"],
    },
  ],
};

export const hashtagSchemaConfig = {
  class: "Hashtags",
  vectorizer: "text2vec-cohere",
  vectorIndexType: "hnsw",
  moduleConfig: {
    "text2vec-cohere": {
      vectorizePropertyName: true,
    },
  },
  properties: [
    {
      name: "hashtag",
      description: "The hashtag",
      dataType: ["string"],
    },
  ],
};

export const userSchemaConfig = {
  class: "Users",
  vectorizer: "text2vec-cohere",
  vectorIndexType: "hnsw",
  moduleConfig: {
    "text2vec-cohere": {
      vectorizePropertyName: true,
    },
  },
  properties: [
    {
      name: "username",
      description: "The username",
      dataType: ["string"],
    },
    {
      name: "name",
      description: "The name of the user",
      dataType: ["string"],
    },
    {
      name: "ip",
      description: "The ip of the user",
      dataType: ["string"],
    },
  ],
};
