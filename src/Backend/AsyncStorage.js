import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';
const ABOUT_US_KEY = 'ABOUT_US_SEEN';

export const setAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    // Error saving data
  }
};

export const setUserData = async userData => {
  if (!userData) return;

  try {
    await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
  } catch {
    // Optionally track or silently ignore
  }
};

export const setToken = async userToken => {
  try {
    await AsyncStorage.setItem('TOKEN', userToken);
  } catch {
    // silently ignore or optionally report/log
  }
};

export const setFcmToken = async userFcmToken => {
  try {
    await AsyncStorage.setItem('FCMTOKEN', userFcmToken);
    return true;
  } catch (e) {
    return false;
  }
};

export const setLanguage = async useLANG => {
  try {
    await AsyncStorage.setItem('LANG', JSON.stringify(useLANG));
  } catch {
    // silently fail or optionally log/report
  }
};

export const getUserData = async () => {
  const userData = await AsyncStorage.getItem('USER_DATA');
  const JsonData = JSON.parse(userData);
  return JsonData;
};

export const getAsyncStorage = async key => {
  let data = null;
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      data = value;
    }
  } catch (error) {
    // Error retrieving data
  }
  return data;
};

export const getLanguage = async () => {
  const language = await AsyncStorage.getItem('LANG');
  const jSONDATA = JSON.parse(language);
  return jSONDATA;
};
export const getToken = async () => {
  const token = await AsyncStorage.getItem('TOKEN');

  return token;
};
export const getSavedFcmToken = async () => {
  try {
    const token = await AsyncStorage.getItem('FCMTOKEN');
    return token;
  } catch (e) {
    return null;
  }
};

export const getAboutUsSeen = async () => {
  try {
    const value = await AsyncStorage.getItem(ABOUT_US_KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setAboutUsSeen = async () => {
  try {
    await AsyncStorage.setItem(ABOUT_US_KEY, 'true');
  } catch (e) {
    // Error retrieving data
  }
};

export const setVisitedMyFeed = async () => {
  try {
    await AsyncStorage.setItem('hasVisitedMyFeed', 'true');
  } catch (e) {
    // Error retrieving data
  }
};

export const getVisitedMyFeed = async () => {
  try {
    return await AsyncStorage.getItem('hasVisitedMyFeed');
  } catch (e) {
    return null;
  }
};

export const saveToStorage = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    // Error retrieving data
  }
};

export const loadFromStorage = async key => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return null;
  }
};

export const removeFromStorage = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    // Error retrieving data
  }
};

export const logout = navigation => {
  AsyncStorage.clear().then(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'SignIn'}],
      }),
    );
  });
};

export const setOfflineFeed = async (data, categoryId = 'all') => {
  try {
    await AsyncStorage.setItem(
      `offline_feed_${categoryId}`,
      JSON.stringify(data),
    );
  } catch (e) {
    // Error retrieving data
  }
};

export const getOfflineFeed = async (categoryId = 'all') => {
  try {
    const jsonValue = await AsyncStorage.getItem(`offline_feed_${categoryId}`);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // Error retrieving data
    return [];
  }
};
