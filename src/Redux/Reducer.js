import {
  AUTH,
  CATEGORY_LIST,
  LANG,
  LOG_OUT,
  SAVED_CATEGORY,
  SHOW_ABOUT_US,
  USER_DETAILS,
  USER_TYPE,
} from './Constant';

const initialState = {
  isAuth: false,
  isUserType: 'guest',
  showAboutUs: false,
  lang: 'en',
  user_details: {},
  category_list: [],
  saved_category: [],
};

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH: {
      const status = action.payload;
      return {
        ...state,
        isAuth: status.isAuth,
      };
    }
    case USER_TYPE: {
      const status = action.payload;
      return {
        ...state,
        isUserType: status.isUserType,
      };
    }
    case SHOW_ABOUT_US: {
      const status = action.payload;
      return {
        ...state,
        showAboutUs: status.showAboutUs,
      };
    }

    case LANG: {
      const status = action.payload;
      return {
        ...state,
        lang: status.lang,
      };
    }
    case USER_DETAILS: {
      const status = action.payload;
      return {
        ...state,
        user_details: status.user_details,
      };
    }
    case CATEGORY_LIST: {
      const status = action.payload;
      return {
        ...state,
        category_list: status.category_list,
      };
    }
    case SAVED_CATEGORY: {
      const status = action.payload;
      return {
        ...state,
        saved_category: status.saved_category,
      };
    }
    // case LOG_OUT: {
    //   return initialState;
    // }
    case LOG_OUT: {
      return {
        ...state,
        isAuth: false,
        user_details: {},
        isUserType: 'guest',
      };
    }

    default:
      return state;
  }
};

export default todoReducer;
