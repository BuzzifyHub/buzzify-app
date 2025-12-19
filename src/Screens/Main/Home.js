import {
  BackHandler,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Typography from '../../Components/Hoc/Typography';
import { DashboardHeader } from '../../Components/Hoc/Header';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import images from '../../Constants/images';
import { darkTheme, lightTheme } from '../../Constants/Color';
import { useTheme } from '../../Components/Hoc/ThemeContext';
import { FULL_WIDTH } from '../../Constants/Layout';
import localization from '../../Constants/localization';
import { useDispatch, useSelector } from 'react-redux';
import {
  ADD_DEVICE_TOKEN,
  ALL_CATEGORY,
  GET_PROFILE,
  UPDATE_TOKEN,
} from '../../Backend/ApiRoutes';
import {
  GET,
  GETWithFormData,
  GETWithParams,
  POST_FORMDATA,
} from '../../Backend/Backend';
import { isAuth, user_details } from '../../Redux/Action';
import { useIsFocused } from '@react-navigation/native';
import {
  Get_All_Saved_Stories,
  RequestLocationPermission,
} from '../../Backend/Utility';
import Geolocation from '@react-native-community/geolocation';
import Loading from '../../Components/Hoc/Loading';
import {
  getOfflineFeed,
  getSavedFcmToken,
  setOfflineFeed,
} from '../../Backend/AsyncStorage';
import GlobalStyles from '../../Constants/GlobalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const focus = useIsFocused();
  const { resolvedTheme } = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const insets = useSafeAreaInsets();

  //REDUX
  const userDetails = useSelector(store => store.user_details);
  const UserType = useSelector(store => store.isUserType);
  const langCode = useSelector(store => store.lang);

  //STATE_MANAGEMENT
  const [backPressCount, setBackPressCount] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [slider, setSlider] = useState([]);

  const [loader, setLoader] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      const { latitude, longitude } = info?.coords || {};
      if (latitude && longitude) {
        setCurrentPosition({ lat: latitude, long: longitude });
      }
    });
  }, [focus]);

  useEffect(() => {
    loadCachedData();
  }, [focus, userDetails]);

  useEffect(() => {
    GetAllCategory({ load: true });

    if (UserType !== 'guest') {
      GetProfile();
      UpdateToken();
    }
  }, [focus, langCode]);

  useEffect(() => {
    if (UserType == 'guest') {
      AddDeviceToken();
    }
  }, [focus]);

  useEffect(() => {
    if (userDetails?.id) {
      Get_All_Saved_Stories(userDetails?.id, setSavedStories, setLoader);
    }
  }, [userDetails]);

  const AddDeviceToken = async () => {
    let deviceId = await DeviceInfo.getUniqueId();

    const fcmToken = await getSavedFcmToken();
    const formdata = new FormData();
    formdata.append('device_id', deviceId),
      formdata.append('player_id', fcmToken);

    console.log(formdata, 'Form data to be sent for device token');

    POST_FORMDATA(
      ADD_DEVICE_TOKEN,
      formdata,
      async success => {
        console.log(success, 'Device token added successfully');
      },
      error => {
        console.log(error, 'Error in adding device token');
      },
      fail => {
        console.log(fail, 'Failed to add device token');
      },
    );
  };

  //Update Token
  const UpdateToken = async () => {
    const fcmToken = await getSavedFcmToken();
    const formdata = new FormData();
    formdata.append('id', userDetails?.id),
      formdata.append('player_id', fcmToken);

    POST_FORMDATA(
      UPDATE_TOKEN,
      formdata,
      async success => {},
      error => {},
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

  const GetAllCategory = async item => {
    let deviceId = await DeviceInfo.getUniqueId();

    setLoader(item?.load || false);
    GET(
      `${ALL_CATEGORY}?device_id=${deviceId}`,
      async success => {
        setLoader(false);

        let fetchedCategories = success?.data?.category || [];

        const hasLocalNews = fetchedCategories.some(
          cat => cat?.name?.toLowerCase() === 'local news',
        );

        if (!hasLocalNews) {
          fetchedCategories.unshift({
            id: 'local-news',
            name: localization?.home?.localNews,
            image: images?.LocalNews,
          });
        }
        setCategoryList(fetchedCategories);
        setSlider(success?.data?.slider);

        // Save categories & slider to offline storage/cache for offline use
        await setOfflineFeed(fetchedCategories, 'categories');
        await setOfflineFeed(success?.data?.slider, 'slider');
      },
      {
        userData: userDetails?.id || '',
      }, //added
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBackPress();
      return true;
    };

    let subscription;
    if (focus) {
      subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [focus, backPressCount]);

  const handleBackPress = () => {
    if (backPressCount === 1) {
      BackHandler.exitApp();
    } else {
      ToastMsg(localization?.home?.pressAgain);
      setBackPressCount(1);
      setTimeout(() => {
        setBackPressCount(0);
      }, 2000);
    }
  };

  const renderTopic = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation?.navigate('MyFeed', {
            featureId: null,
            id: item?.id === 'local-news' ? null : item?.id,
            name: item?.name,
            currentPosition: item?.id === 'local-news' ? currentPosition : {},
            productId: null,
            type: item?.id === 'local-news' ? 'local' : 'not',
          });
          // }
        }}
        style={{
          width: '33.33%',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            height: 90,
            width: '90%',
            // width: 105,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: colors?.BORDER_LIGHT,
          }}
        >
          <Image
            source={
              item?.id !== 'local-news' ? { uri: item?.image } : item?.image
            }
            style={{
              height: item?.id !== 'local-news' ? 50 : 40,
              width: item?.id !== 'local-news' ? 50 : 40,
              tintColor: item?.id !== 'local-news' ? null : '#305185',
            }}
          />
        </View>
        <Typography
          textAlign={'center'}
          size={15}
          type={fonts?.Montserrat_SemiBold}
          color={themeColors?.txtBlack}
          style={{ marginTop: 12 }}
        >
          {item?.name}
        </Typography>
      </TouchableOpacity>
    );
  };
  const onRefresh = async () => {
    setRefreshing(true);

    // Make actual API calls now
    await GetAllCategory({ load: false });
    if (userDetails?.id) {
      await Get_All_Saved_Stories(userDetails.id, setSavedStories, setLoader);
    }

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const loadCachedData = async () => {
    // Fetch cached categories and slider from AsyncStorage or your cache
    const cachedCategories = await getOfflineFeed('categories'); // example key
    const cachedSlider = await getOfflineFeed('slider'); // example key
    if (cachedCategories?.length) setCategoryList(cachedCategories);
    if (cachedSlider?.length) setSlider(cachedSlider);

    if (userDetails?.id) {
      // Also load saved stories from cache or offline storage if applicable
      const cachedSavedStories = await getOfflineFeed('savedStories');
      if (cachedSavedStories) setSavedStories(cachedSavedStories);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors?.background,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.background}
      />
      <View
        style={[
          styles.innerView,
          {
            marginTop: Platform.OS == 'ios' ? 50 : 40, //50
          },
        ]}
      >
        <DashboardHeader
          customWidth={
            UserType == 'guest' ? FULL_WIDTH * 0.2 : FULL_WIDTH * 0.28
          }
          isUser={UserType == 'guest' ? false : true}
          onPressMenu={() => {
            navigation.openDrawer();
          }}
          onPressNotification={() => {
            navigation?.navigate('Notifications');
          }}
          onPressSearch={() => {
            navigation?.navigate('SearchStories');
          }}
          onPressProfile={() => {
            UserType !== 'guest'
              ? navigation.navigate('MyProfile')
              : dispatch(isAuth(false));
          }}
        />

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors?.ORANGE]} // Works on Android
              tintColor={colors?.ORANGE} // For iOS
            />
          }
        >
          <View
            style={[
              GlobalStyles?.commonStyle,
              {
                alignItems: 'center',
                paddingHorizontal: 5,
              },
            ]}
          >
            <View style={{ width: '55%' }}>
              <Typography
                size={16}
                color={themeColors?.txtBlack}
                type={fonts?.Montserrat_Bold}
              >
                {localization?.home?.welcome}{' '}
                {UserType !== 'guest'
                  ? userDetails?.name
                  : localization?.customDrawer?.guestUser}
                ,
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation?.navigate('MyFeed', {
                  featureId: null,
                  id: '',
                  name: '',
                  productId: null,
                  currentPosition: {},
                  type: 'not',
                });
              }}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderColor: themeColors?.iconColor,
              }}
            >
              <Typography
                type={fonts?.Montserrat_Bold}
                color={themeColors?.iconColor}
              >
                {localization?.customDrawer?.myFeed}
              </Typography>
            </TouchableOpacity>
          </View>
          <Typography
            size={18}
            lineHeight={40}
            color={themeColors?.txtBlack}
            type={fonts?.Montserrat_Bold}
            style={{ marginBottom: 20 }}
          >
            {localization?.home?.featSto}
          </Typography>
          <FlatList
            data={slider}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View
                  style={{
                    width: FULL_WIDTH * 0.69,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.featuredContainer}
                    onPress={() => {
                      navigation?.navigate('MyFeed', {
                        featureId: item?.id,
                        id: '',
                        name: '',
                        productId: null,
                        currentPosition: {},
                        type: 'not',
                      });
                    }}
                  >
                    <Image
                      source={{ uri: item?.banner_image[0] }}
                      style={styles?.featuredBox}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <Typography
                    size={18}
                    type={fonts?.Montserrat_SemiBold}
                    style={{
                      marginTop: 8,
                      // marginRight: 10,
                      width: FULL_WIDTH * 0.55,
                    }}
                    numberOfLines={1}
                    lineHeight={30}
                  >
                    {item?.title}
                  </Typography>
                </View>
              );
            }}
          ></FlatList>

          <Typography
            style={{ marginTop: 16, marginBottom: 8 }}
            size={18}
            type={fonts?.Montserrat_Bold}
          >
            {localization?.home?.filterby}
          </Typography>

          <FlatList
            data={categoryList}
            renderItem={renderTopic}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            columnWrapperStyle={({ index }) => {
              const itemsPerRow = 3;
              const rowIndex = Math.floor(index / itemsPerRow);
              const totalRows = Math.ceil(categoryList?.length / itemsPerRow);
              const isLastRow = rowIndex === totalRows - 1;

              const itemsInLastRow =
                categoryList?.length % itemsPerRow || itemsPerRow;

              return {
                justifyContent:
                  isLastRow && itemsInLastRow < itemsPerRow
                    ? 'flex-start'
                    : 'space-between',
                marginBottom: 16,
              };
            }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />

          <Typography
            style={{ marginBottom: 20 }}
            size={16}
            type={fonts?.Montserrat_SemiBold}
            color={themeColors?.iconColor}
            textAlign={'center'}
          >
            {localization?.home?.stayBlessed}
          </Typography>
        </ScrollView>
      </View>
      {loader && <Loading visible={loader} />}
    </View>
  );
};
export default Home;

const styles = StyleSheet.create({});

const getStyles = themeColors =>
  StyleSheet.create({
    container: {
      backgroundColor: themeColors?.background,
    },

    featuredContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: FULL_WIDTH * 0.65,
    },
    featuredBox: {
      backgroundColor: '#E5E7EB',
      width: FULL_WIDTH * 0.65,
      height: 200,
      borderRadius: 12,
      marginRight: 20,
    },
    row: {
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    mainView: {
      flex: 1,
      width: FULL_WIDTH,
    },
    innerView: {
      flex: 1,
      width: FULL_WIDTH * 0.92,
      alignSelf: 'center',
    },
  });
