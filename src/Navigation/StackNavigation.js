import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignUp from '../Screens/Auth/SignUp';
import DrawerNavigation from './DrawerNavigation';
import SignIn from '../Screens/Auth/SignIn';
import ThanksFor from '../Screens/Auth/ThanksFor';
import SubmitStory from '../Screens/Auth/SubmitStory';
import SaveInterests from '../Screens/Auth/SaveInterests';
import AboutUs from '../Screens/Main/Cms/AboutUs';
import ChooseLang from '../Screens/Main/ChooseLang';
import Notifications from '../Screens/Main/Notifications';
import ManageRequest from '../Screens/Main/DrawerScreens/ManageRequest';
import RedeemPoints from '../Screens/Main/DrawerScreens/RedeemPoints';
import SearchStories from '../Screens/Main/SearchStories';
import {useSelector} from 'react-redux';
import ForgotPassword from '../Screens/Auth/ForgotPassword';
import Otp from '../Screens/Auth/Otp';
import ResetPassword from '../Screens/Auth/ResetPassword';
import CmsPages from '../Screens/Main/Cms/CmsPages';
import ChangePassword from '../Screens/Main/ChangePassword';
import Settings from '../Screens/Main/DrawerScreens/Settings';
import MyProfile from '../Screens/Main/DrawerScreens/MyProfile';
import AddFeedback from '../Screens/Main/DrawerScreens/AddFeedback';
import MySavedStory from '../Screens/Main/DrawerScreens/MySavedStory';
import MyStories from '../Screens/Main/DrawerScreens/MyStories';
import MyRewards from '../Screens/Main/DrawerScreens/MyRewards';
import MyFeed from '../Screens/Main/DrawerScreens/MyFeed';
import {getVisitedMyFeed} from '../Backend/AsyncStorage';
import SaveInterestMain from '../Screens/Main/SaveInterestMain';
import WebViewScreen from '../Screens/Main/DrawerScreens/WebViewScreen';

const Stack = createNativeStackNavigator();

export const AuthStack = ({}) => {
  const showAboutUs = useSelector(store => store.showAboutUs);
  return (
    <Stack.Navigator
      initialRouteName={showAboutUs ? 'AboutUs' : 'SignIn'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="AboutUs" component={AboutUs} />
      <Stack.Screen name="SaveInterests" component={SaveInterests} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="CmsPages" component={CmsPages} />
    </Stack.Navigator>
  );
};
export const MainStack = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      const visited = await getVisitedMyFeed();
      setInitialRoute(visited === 'true' ? 'MyFeed' : 'DrawerNavigation');
    };
    checkInitialRoute();
  }, []);

  if (!initialRoute) return null;
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
      <Stack.Screen name="ChooseLang" component={ChooseLang} />
      <Stack.Screen name="SubmitStory" component={SubmitStory} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="ManageRequest" component={ManageRequest} />
      <Stack.Screen name="RedeemPoints" component={RedeemPoints} />
      <Stack.Screen name="SearchStories" component={SearchStories} />
      <Stack.Screen name="CmsPages" component={CmsPages} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="ThanksFor" component={ThanksFor} />

      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="AddFeedback" component={AddFeedback} />
      <Stack.Screen name="MySavedStory" component={MySavedStory} />
      <Stack.Screen name="MyStories" component={MyStories} />

      <Stack.Screen name="MyRewards" component={MyRewards} />
      <Stack.Screen name="MyFeed" component={MyFeed} />
      <Stack.Screen name="SaveInterestMain" component={SaveInterestMain} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
