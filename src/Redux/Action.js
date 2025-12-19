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

export const isAuth = status => ({
  type: AUTH,
  payload: {
    isAuth: status,
  },
});
export const isUserType = status => ({
  type: USER_TYPE,
  payload: {
    isUserType: status,
  },
});
export const showAboutUs = status => ({
  type: SHOW_ABOUT_US,
  payload: {
    showAboutUs: status,
  },
});
export const lang = status => ({
  type: LANG,
  payload: {
    lang: status,
  },
});
export const user_details = status => ({
  type: USER_DETAILS,
  payload: {
    user_details: status,
  },
});
export const category_list = status => ({
  type: CATEGORY_LIST,
  payload: {
    category_list: status,
  },
});
export const saved_category = status => ({
  type: SAVED_CATEGORY,
  payload: {
    saved_category: status,
  },
});
export const logOut = status => ({
  type: LOG_OUT,
  payload: {
    isAuth: false,
  },
});
