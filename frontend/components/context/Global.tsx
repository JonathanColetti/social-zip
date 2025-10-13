import { createContext, useEffect, useReducer, useState } from "react";
import Reducer, { IAction, IGlobalState } from "./Reducer";
import * as Localize from "expo-localization";

export const GlobalContext = createContext<any | {}>({});

export interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [IsLoaded, setIsLoaded] = useState<boolean>(true);

  const [authState, authDispatch] = useReducer<
    (state: IGlobalState, action: IAction) => any
  >(Reducer, {
    accentColor: "#0071fa",
    id: null,
    authType: null,
    authUsername: null,
    profilePicture: null,
    isDarkTheme: true,
    btmHeight: 0,
    isLoggedIn: false,
    locale: Localize.locale,
  });

  useEffect(() => {
    // (async () => {
    //   if (authState.id && authState.authType && authDispatch)
    //   setIsLoaded(true);
    // })();
  }, []);

  return (
    <>
      {!IsLoaded ? (
        <></>
      ) : (
        <GlobalContext.Provider value={{ authState, authDispatch }}>
          {children}
        </GlobalContext.Provider>
      )}
    </>
  );
};
