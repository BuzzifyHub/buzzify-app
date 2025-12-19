import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Switch,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../Constants/colors';
import images from '../../Constants/images';
import Typography from '../../Components/Hoc/Typography';
import fonts from '../../Constants/fonts';
import SvgIcon from '../../Constants/svg';
import CommonModal from '../../Components/Hoc/CommonModal';
import {
  isAuth,
  isUserType,
  showAboutUs,
  user_details,
} from '../../Redux/Action';
import { useTheme } from '../../Components/Hoc/ThemeContext';
import { darkTheme, lightTheme } from '../../Constants/Color';
import localization from '../../Constants/localization';
import { POST_FORMDATA } from '../../Backend/Backend';
import {
  GET_PROFILE,
  LOGOUT,
  REMOVE_DEVICE_TOKEN,
} from '../../Backend/ApiRoutes';
import DeviceInfo from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomDrawer = ({ navigation }) => {
  const focus = useIsFocused();
  const { themeMode, resolvedTheme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const userDetails = useSelector(store => store.user_details);

  const langCode = useSelector(store => store.lang);

  const UserType = useSelector(store => store.isUserType);
  const [show, setShow] = useState(false);

  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const [data, setData] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const updatedData = [
      ...(UserType !== 'guest'
        ? [
            {
              key: '1',
              title: localization.customDrawer.dashbnoard,
              iconName: 'dashboard',
              navigation: 'Home',
            },
            {
              key: '2',
              title: localization.customDrawer.myProfile,
              iconName: 'profile',
              navigation: 'MyProfile',
            },
            {
              key: '4',
              title: localization.customDrawer.mySavedStory,
              iconName: 'savedStory',
              navigation: 'MySavedStory',
            },
            {
              key: '5',
              title: localization.customDrawer.myStory,
              iconName: 'myStory',
              navigation: 'MyStories',
            },
            {
              key: '6',
              title: localization.customDrawer.myRewards,
              iconName: 'myWallet',
              navigation: 'MyRewards',
            },
            {
              key: '7',
              title: localization.customDrawer.myFeed,
              iconName: 'dashboard',
              navigation: 'MyFeed',
            },
          ]
        : []),
      {
        key: '8',
        title: localization.customDrawer.settings,
        iconName: 'settings',
        navigation: 'Settings',
      },
      {
        key: '9',
        title: localization.customDrawer.feedback,
        iconName: 'feedback',
        navigation: 'AddFeedback',
      },
      ...(UserType !== 'guest'
        ? [
            {
              key: '10',
              title: localization.customDrawer.rateUs,
              iconName: 'rateUs',
              navigation: '',
            },
          ]
        : []),
      {
        key: '11',
        title: localization.customDrawer.shareApp,
        iconName: 'shareApp',
        navigation: 'ThanksFor',
      },
      ...(UserType !== 'guest'
        ? [
            {
              key: '12',
              title: localization.customDrawer.signOut,
              iconName: 'signOut',
              navigation: '',
            },
          ]
        : [
            {
              key: '13',
              title: localization.customDrawer.login,
              iconName: 'lock',
              navigation: '',
            },
          ]),
    ];

    setData(updatedData);
  }, [langCode, UserType]); // Dependency array

  useEffect(() => {
    if (UserType !== 'guest') {
      GetProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, langCode]);

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handlePress = item => {
    if (item.key === '12') {
      setShow(true);
    } else if (item.key === '13') {
      RemoveDeviceToken();
      dispatch(isAuth(false));
    } else if (item?.key === '10') {
      const url =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/' // Replace with actual App Store URL
          : 'https://play.google.com/'; // Replace with actual Play Store URL

      Linking.openURL(url).catch(err => {
        console.error('Failed to open store URL:', err);
      });
    } else if (item.key === '7') {
      navigation.navigate('MyFeed', { id: '', name: '', productId: null });
    } else if (item.navigation) {
      navigation.navigate(item.navigation);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: themeColors.drawerBorder,
      }}
      onPress={() => handlePress(item)}
    >
      <SvgIcon
        name={item.iconName}
        color={themeColors.iconColor}
        style={{ marginRight: 16 }}
      />
      <Typography
        size={16}
        type={fonts.Montserrat_Bold}
        style={{ marginLeft: 17 }}
      >
        {item?.title}
      </Typography>
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <View style={{ marginTop: 20 }}>
      <Typography size={16} type={fonts.Montserrat_Bold} textAlign="center">
        {localization.customDrawer.disPre}
      </Typography>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 20,
        }}
      >
        {['system', 'light', 'dark'].map(option => {
          const isActive = themeMode === option;
          const label = localization?.settings?.[option];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => toggleTheme(option)}
              style={{
                alignItems: 'center',
                backgroundColor: isActive
                  ? themeColors.primaryLight
                  : themeColors.surface,
                borderColor: isActive ? colors.ORANGE : themeColors.border,
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Typography
                size={15}
                type={fonts.Montserrat_SemiBold}
                style={{ color: themeColors.text, marginBottom: 6 }}
              >
                {label}
              </Typography>
              <Switch
                value={isActive}
                onValueChange={() => toggleTheme(option)}
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.border,
                }}
                thumbColor={isActive ? colors.ORANGE : '#f4f3f4'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const LogoutApi = async () => {
    const formdata = new FormData();
    formdata.append('user_id', userDetails?.id);

    POST_FORMDATA(
      LOGOUT,
      formdata,

      succes => {
        ToastMsg(succes?.message);
        // GoogleSignin.signOut(); //added for signout
        dispatch(isUserType(''));
        dispatch(user_details({}));
        dispatch(isAuth(false));
        dispatch(showAboutUs(false));
      },
      error => {
        ToastMsg(error?.message);
      },
      fail => {},
    );
  };
  const GetProfile = () => {
    const formdata = new FormData();
    formdata.append('id', userDetails?.id),
      POST_FORMDATA(
        GET_PROFILE,
        formdata,
        async success => {
          dispatch(user_details(success?.data));
        },
        error => {},
        fail => {},
      );
  };
  const RemoveDeviceToken = async () => {
    let deviceId = await DeviceInfo.getUniqueId();

    const formdata = new FormData();
    formdata.append('device_id', deviceId),
      POST_FORMDATA(
        REMOVE_DEVICE_TOKEN,
        formdata,
        async success => {
          console.log(success, 'Device token removed successfully');
        },
        error => {
          console.log(error, 'Error in removing device token');
        },
        fail => {
          console.log(fail, 'Failed to removing device token');
        },
      );
  };
  return (
    <View
      style={{ flexDirection: 'row', flex: 1, paddingBottom: insets?.bottom }}
    >
      <View style={styles.mainView}>
        <View style={{ backgroundColor: colors.ORANGE }}>
          <View
            style={{ paddingHorizontal: 16, marginTop: 45, marginBottom: 30 }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image
                source={
                  userDetails?.photo
                    ? { uri: userDetails?.photo }
                    : images.MainLogo
                }
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: userDetails?.photo ? 30 : 0,
                  resizeMode: 'cover',
                  marginRight: 15,
                }}
              />
              <View
                style={{
                  width: '70%',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  size={20}
                  type={fonts.Montserrat_SemiBold}
                  color={colors.WHITE}
                >
                  {UserType !== 'guest'
                    ? userDetails?.name
                    : localization.customDrawer.guestUser}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <FlatList
            data={data}
            removeClippedSubviews={false}
            keyExtractor={item => item.key}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <CommonModal
          visible={show}
          onClose={() => setShow(false)}
          onConfirm={LogoutApi}
        />
      </View>

      <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
    </View>
  );
};

export default CustomDrawer;

const getStyles = themeColors =>
  StyleSheet.create({
    mainView: {
      backgroundColor: themeColors.lighterGrey,
      width: '70%',
    },
  });
