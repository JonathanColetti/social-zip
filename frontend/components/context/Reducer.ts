export interface IGlobalState {
  profilePicture: string;
  id: string | null;
  authType: string | null;
  accentColor: string;
}

export interface IAction {
  type: string;
  payload: any;
}

export default function Reducer(state: IGlobalState, action: IAction): any {
  switch (action.type) {
    case "SET_ID_AND_AUTH_TYPE":
      return {
        ...state,
        id: action.payload.id,
        authType: action.payload.authType,
      };
    case "SET_USERAUTH":
      return {
        ...state,
        authUsername: action.payload.authUsername,
        id: action.payload.id,
        authType: action.payload.authType,
        profilePicture: action.payload.profilePicture,
      };
    case "SET_LOCALE":
      return {
        ...state,
        locale: action.payload,
      };

    case "SET_PROFILE_PICTURE":
      return {
        ...state,
        profilePicture: action.payload,
      };
    case "SET_ACCENT_COLOR":
      return {
        ...state,
        accentColor: action.payload,
      };
    case "SET_BTM_HEIGHT":
      return {
        ...state,
        btmHeight: action.payload,
      };
    case "SET_THEME":
      return {
        ...state,
        isDarkTheme: action.payload,
      };
    case "LOG_IN":
      return {
        ...state,
        isLoggedIn: true,
      };
    case "LOG_OUT":
      return {
        ...state,
        isLoggedIn: false,
      };

    default:
      return state;
  }
}
