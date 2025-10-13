import {
  DocumentNode,
  TypedDocumentNode,
  ApolloError,
  ApolloQueryResult,
  FetchResult,
} from "@apollo/client";
import { apolloClient } from "./GraphqlWrapper";
import translator from "../../components/translations/translator";
import { Toast } from "toastify-react-native";

async function FormatQuery<T = any>(
  query: DocumentNode | TypedDocumentNode<any, any>,
  variables: any = {},
  idAndAuthType?: string,
  fetchPolicy: "cache" | undefined = "cache"
): Promise<void | ApolloQueryResult<T>> {
  if (idAndAuthType) {
    const queryResultNoAuth = await apolloClient
      .query({
        query: query,
        variables,
        fetchPolicy: fetchPolicy ? "cache-first" : "network-only",
        context: {
          headers: {
            authorization: idAndAuthType,
          },
        },
      })
      .catch((err) => {
        return;
      });

    return queryResultNoAuth;
  }
  const queryResult = await apolloClient
    .query({
      query: query,
      variables,
    })
    .catch((err: ApolloError) => {
      if (err.message === "Network request failed") {
        Toast.error(translator(locale).t("networkError"));
      }
    });
  return queryResult;
}

async function FormatMutation<T = any>(
  mutation: DocumentNode | TypedDocumentNode<any, any>,
  variables: any,
  idAndAuthType?: string
): Promise<void | FetchResult<T>> {
  if (!idAndAuthType) {
    Toast.error(translator(locale).t("notLoggedIn"));
    return;
  }
  const mutationResult = await apolloClient
    .mutate({
      mutation: mutation,
      variables,
      context: {
        headers: {
          authorization: idAndAuthType,
        },
      },
    })
    .catch((err: ApolloError) => {});
  return mutationResult;
}

export { FormatQuery, FormatMutation };
