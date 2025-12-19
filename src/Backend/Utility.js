import {PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, RESULTS} from 'react-native-permissions';
import {POST} from './Backend';
import {ALL_BOOKMARKED_POSTS} from './ApiRoutes';
import {loadFromStorage, saveToStorage} from './AsyncStorage';
import NetInfo from '@react-native-community/netinfo';

export const regex = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  phoneNumber: /^(0|[1-9][0-9]*)$/,
};
export const DefaultToast = title => {
  return Toast.show(title, Toast.SHORT);
};
export const formatError = obj => {
  let errorsData = {};
  for (const field in obj) {
    if (Object.hasOwnProperty.call(obj, field)) {
      errorsData[field] = '';
    }
  }
  return errorsData;
};
export const parseValues = data => {
  let parsedData = {};
  for (const field in data) {
    if (Object.hasOwnProperty.call(data, field)) {
      const value = data[field].value;
      parsedData[field] = value;
    }
  }
  return parsedData;
};
export const isValidEmail = email => regex.email.test(email);
export const isValidPassword = email => regex.email.test(email);
export const isValidPhone = phone => regex.phoneNumber.test(phone);

export const isValidValue = ({
  value = '',
  required = true,
  type = '',
  minimum = 0,
  maximum = 1000,
}) => {
  if (required) {
    if (!value) {
      return 'Please Enter Some Value';
    } else if (type === 'email') {
      return !isValidEmail(value) ? 'Please Enter Valid Email!' : '';
    } else if (type === 'phone') {
      return !isValidPhone(value) ? 'Please Enter Valid Phone Number!' : '';
    } else if (value.length < minimum) {
      return `Minimum length should be ${minimum}`;
    } else if (value.length > maximum) {
      return `Maximum length should be ${maximum}`;
    } else {
      return '';
    }
  } else {
    return '';
  }
};

////////////
export const isValidForm = (form = {}) => {
  let valid = true;
  for (const field in form) {
    if (Object.hasOwnProperty.call(form, field)) {
      const error = form[field];
      valid = valid && !error;
    }
  }
  return valid;
};
/////////////

export const isIos = Platform.OS === 'ios';

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const res = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return res === RESULTS.GRANTED;
    } else {
      const granted = await PermissionsAndroid.request(
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    return false;
  }
};
export const LOCAL_STORAGE_KEY = 'BOOKMARKED_STORIES';

export const Get_All_Saved_Stories = async (userId, setData, setLoading) => {
  setLoading(true);
  const netState = await NetInfo.fetch();

  if (netState.isConnected) {
    POST(
      ALL_BOOKMARKED_POSTS + `?user_id=${userId}`,
      {},
      async success => {
        setLoading(false);
        if (success?.data) {
          setData(success.data);
          await saveToStorage(LOCAL_STORAGE_KEY, success.data);
        }
      },
      error => setLoading(false),
      fail => setLoading(false),
    );
  } else {
    setLoading(false);
    const localData = await loadFromStorage(LOCAL_STORAGE_KEY);
    setData(localData || []);
  }
};

// export const RequestLocationPermission = async () => {
//   if (Platform.OS === 'android') {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//     );
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   }
//   return true; // iOS handled via Info.plist
// };
