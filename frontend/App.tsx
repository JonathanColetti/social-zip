import { NavigationContainer } from "@react-navigation/native";
import BottomNavigation from "./components/navigation/BottomNavigator";
import { SheetProvider } from "react-native-actions-sheet";
import "./components/sheets/sheets";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootSiblingParent } from "react-native-root-siblings";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./api/graphql/GraphqlWrapper";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { GlobalProvider } from "./components/context/Global";

export default function App() {
  return (
    <>
      <GlobalProvider>
        <ApolloProvider client={apolloClient}>
          <ActionSheetProvider>
            <RootSiblingParent>
              <SafeAreaProvider>
                <SheetProvider>
                  <NavigationContainer
                    linking={{
                      prefixes: ["https://socialzip.net", "socialzip://"],
                      config: {
                        screens: {
                          ViewPost: "post/:postId",
                          Home: "home/:postId",
                          Profile: "p/:username",
                          Search: "search/:query",
                          Login: "login/:id/:authType",
                        },
                      },
                    }}
                  >
                    <BottomNavigation />
                  </NavigationContainer>
                </SheetProvider>
              </SafeAreaProvider>
            </RootSiblingParent>
          </ActionSheetProvider>
        </ApolloProvider>
      </GlobalProvider>
    </>
  );
}
