import AWS from "aws-sdk";
import startServices from "./server/startServers.js";
import mixpanel from "mixpanel";
import { RedisClientType, createClient } from "redis";
import weaviate from "weaviate-ts-client";
import "dotenv/config";
import dgraph from "dgraph-js";

export const redisClient: RedisClientType<any> = createClient({
  url: process.env.REDIS_URL!,
  socket: {
    keepAlive: 120,
  },
});

export const dgraphStub = dgraph.clientStubFromCloudEndpoint(
  process.env.DGRAPH_URI!,
  process.env.DGRAPH_KEY!
);

export const dgraphClient = new dgraph.DgraphClient(dgraphStub);
dgraphClient.setDebugMode(false);

redisClient.on("error", (err: unknown) => {});

export const dynamodb: AWS.DynamoDB.DocumentClient =
  new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  });

export const mixpanelTracker: mixpanel.Mixpanel = mixpanel.init(
  process.env.MIXPANEL_TOKEN!
);

export const weaviateClient = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_HOST!,
  headers: {
    "X-Cohere-Api-Key": process.env.COHERE_KEY!,
    Authorization: `Bearer ${process.env.WEAVIATE_KEY!}`,
  },
});

startServices();
