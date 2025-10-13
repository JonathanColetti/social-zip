import { ApolloClient, DefaultOptions, InMemoryCache } from "@apollo/client";
import { BACKEND_URL } from "../../components/lib/constants";

// const defaultOptions: DefaultOptions = {
//   watchQuery: {
//     fetchPolicy: "no-cache",
//     errorPolicy: "ignore",
//   },
//   query: {
//     fetchPolicy: "no-cache",
//     errorPolicy: "all",
//   },
// };

export const apolloClient = new ApolloClient({
  uri: `${BACKEND_URL}/graphql`,
  cache: new InMemoryCache(),
});
