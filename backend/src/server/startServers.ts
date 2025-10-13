import { createExpressApp } from "../server/expressServer.js";
import startWeaviate from "../server/weaviate/startWeaviate.js";
import { dgraphStub, redisClient } from "../app.js";
import { CloseHttpsServer, RunHttpsServer } from "../util.js";
import startApollo, { server } from "./graphql/index.js";
import SetupDgraph from "./dgraphql/index.js";
import fs from "fs";
async function startServers() {
  try {
    await redisClient.connect();
    await startApollo();
    await createExpressApp();
    await SetupDgraph();
    await RunHttpsServer();
    await startWeaviate();
  } catch (error) {
    return;
  }
}

async function closeServers() {
  try {
    // close express
    await CloseHttpsServer();
    // close apollo
    await server.stop();
    // close the dgraph stub
    dgraphStub.close();
    // close redis
    await redisClient.disconnect();
  } catch (error) {
    return;
  }
}

export default startServers;
export { closeServers };
