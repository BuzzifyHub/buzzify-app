import SimpleToast from 'react-native-simple-toast';
import { createRef } from 'react';
import axios from 'axios';
import localization from '../Constants/localization';
import { Platform } from 'react-native';

axios.defaults.timeout = 45000;

const errorHandling = {
  validateStatus: function (status) {
    return status >= 200 && status < 501; // default
  },
};

export const BASE_URL = 'https://buzzify.24livehost.com/api/'; //local
export const API = `${BASE_URL}`;

export const statusMessage = {
  400: 'Invalid request format.',
  401: 'Invalid API Key.',
  403: 'The request is forbidden.',
  404: 'The specified resource could not be found.',
  405: 'You tried to access the resource with an invalid method.',
  500: 'We had a problem with our server. Try again later.',
  503: "We're temporarily offline for maintenance. Please try again later.",
};
export const toastRef = createRef();

export const Toast = (
  message = '',
  type = 'normal',
  config = {},
  hidePrevious = false,
) => {
  if (hidePrevious) {
    toastRef.current?.hideAll();
  }
  toastRef.current?.show(message, {
    type,
    duration: 1500,
    placement: 'bottom',
    ...config,
  });
};
export const POST_FORMDATA = async (
  route,
  body,
  onSuccess = () => {},
  onError = () => {},
  onFail = () => {
    SimpleToast.show('Check Network, Try Again.', SimpleToast.SHORT);
  },
) => {
  const lang = localization.getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'Accept-Language': lang,
      },
      ...errorHandling,
    })
      .then(res => {
        if (res?.status === 200) {
          onSuccess(res?.data);
        } else if (res?.status === 401) {
          checkInvalidOrDeletedAccount();
          onError(res?.data);
        } else {
          onError(res?.data);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
export const POST = async (
  route,
  body = {},
  onSuccess = () => {},
  onError = () => {},
  onFail = () => {
    SimpleToast.show('Check Network, Try Again.', SimpleToast.SHORT);
  },
) => {
  const lang = localization.getLanguage();

  try {
    axios({
      method: 'post',
      url: `${API}${route}`,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        'lang-Code': lang,
        'Device-Name': Platform.OS == 'android' ? 'android' : 'ios',
      },
      validateStatus: function (status) {
        return status >= 200 && status < 501;
      },
    })
      .then(res => {
        if (res?.status == 200) {
          onSuccess(res?.data);
        } else {
          if (res?.status == 401) {
            checkInvalidOrDeletedAccount();
          }
          onError(res);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });

    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
export const GET = async (
  route,
  onSuccess = () => {},
  headers = {},
  onError = () => {},
  onFail = () => {
    SimpleToast.show('Check Network, Try Again.', SimpleToast.SHORT);
  },
) => {
  const lang = localization.getLanguage();

  try {
    await axios({
      method: 'get',
      url: `${API}${route}`,
      headers: {
        'Content-Type': 'application/json',

        'lang-Code': lang,

        ...headers,
      },
      ...errorHandling,
    })
      .then(res => {
        if (res?.status == 200) {
          onSuccess(res?.data);
        } else {
          if (res?.status == 401) {
            checkInvalidOrDeletedAccount();
          }
          onError(res);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};

export const GETWithFormData = async (
  route,
  formValues = {},
  onSuccess = () => {},
  headers = {},
  onError = () => {},
  onFail = () => {
    SimpleToast.show('Check Network, Try Again.', SimpleToast.SHORT);
  },
) => {
  const lang = localization.getLanguage();

  // Prepare FormData
  const formData = new FormData();
  Object.entries(formValues).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Combine lang and extra headers
  const requestHeaders = {
    'Content-Type': 'multipart/form-data',
    'lang-Code': lang,
    ...headers,
  };

  try {
    await axios({
      method: 'get',
      url: `${API}${route}`,
      data: formData, // Attach formData to body
      headers: requestHeaders,
      ...errorHandling,
    })
      .then(res => {
        if (res?.status == 200) {
          onSuccess(res?.data);
        } else {
          if (res?.status == 401) {
            checkInvalidOrDeletedAccount();
          }
          onError(res);
        }
      })
      .catch(err => {
        onError(err);
      });
  } catch (error) {
    onFail({ data: null, msg: 'Network Error', status: 'error' });
    return { data: null, msg: 'Network Error', status: 'error' };
  }
};
