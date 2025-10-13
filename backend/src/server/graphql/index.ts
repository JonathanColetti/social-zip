import Queries from "./queries.js";
import Mutations from "./mutations.js";
import { ApolloServer } from "@apollo/server";
import TypeDefs from "../../server/graphql/typeDefs.js";
import depthLimit from "graphql-depth-limit";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import responseCachePlugin from "@apollo/server-plugin-response-cache";

const Resolvers = {
  Query: Queries.Query,
  Mutation: Mutations.Mutation,
};

const server: ApolloServer<string> = new ApolloServer({
  typeDefs: TypeDefs,
  resolvers: Resolvers,
  validationRules: [depthLimit(3)],
  // introspection: false,
  // ApolloServerPluginLandingPageDisabled(),
  plugins: [responseCachePlugin()],
});

async function startApollo() {
  await server.start();
}

export default startApollo;
export { server };
