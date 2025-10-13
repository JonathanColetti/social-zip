import { weaviateClient } from "../../app.js";
import {
    hashtagSchemaConfig,
    postSchemaConfig,
    userSchemaConfig,
} from "./schemaConfig.js";
/* 
    Weaviate schemas
    post schema
        - hashtag
        - username
        - location
    hashtag schema
        - hashtag
    user schema
        - username
        - name
        
*/
async function startWeaviate() {
    await weaviateClient.schema
        .classCreator()
        .withClass(postSchemaConfig)
        .do()
        .catch((err) => {});
    await weaviateClient.schema
        .classCreator()
        .withClass(hashtagSchemaConfig)
        .do()
        .catch((err) => {});
    await weaviateClient.schema
        .classCreator()
        .withClass(userSchemaConfig)
        .do()
        .catch((err) => {});
}

export default startWeaviate;
