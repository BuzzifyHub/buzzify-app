import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  BackHandler,
  PanResponder,
  SafeAreaView,
  Animated,
  Share,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Header from '../../../Components/Hoc/Header';
import localization from '../../../Constants/localization';
import {GET, POST_FORMDATA} from '../../../Backend/Backend';
import {
  ADD_DEVICE_TOKEN,
  ADVERTISEMENT_BANNER,
  BLOG_CATEGORY,
  BLOG_VIEW_COUNT,
  DELETE_BOOKMARK,
  FULL_PAGE_ADS,
  GET_ALL_FEED,
  SAVE_BOOKMARK,
  SETTING_LIST,
} from '../../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import {FULL_HEIGHT, FULL_WIDTH} from '../../../Constants/Layout';
import colors from '../../../Constants/colors';
import {useTheme} from '../../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../../Constants/Color';
import {NoData} from '../../../Components/Hoc/Loader';
import {useDispatch, useSelector} from 'react-redux';
import ShowPostCard from '../../../Components/UI/ShowPostCard';
import Loading from '../../../Components/Hoc/Loading';
import images from '../../../Constants/images';
import Button from '../../../Components/Hoc/Button';
import fonts from '../../../Constants/fonts';
import Typography from '../../../Components/Hoc/Typography';
import {
  getOfflineFeed,
  getSavedFcmToken,
  getVisitedMyFeed,
  setOfflineFeed,
  setVisitedMyFeed,
} from '../../../Backend/AsyncStorage';
import Tts from 'react-native-tts';
import DeviceInfo from 'react-native-device-info';
import {useNetInfo} from '@react-native-community/netinfo';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const MyFeed = ({navigation, route}) => {
  const {id, name, type, currentPosition, featureId} = route.params || {};
  const netInfo = useNetInfo();
  const dispatch = useDispatch();
  const viewTimerRef = React.useRef(null);
  const lastViewedIdRef = React.useRef(null);

  const saved_category = useSelector(store => store.saved_category);
  const UserType = useSelector(store => store.isUserType);

  const focus = useIsFocused();
  const {themeMode, resolvedTheme, toggleTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const userDetails = useSelector(store => store.user_details);

  const [data, setData] = useState([]);
  const [screenLoading, setScreenLoading] = useState(false);
  const [loadData, setloadData] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [advertisementData, setAdvertisementData] = useState([]);
  const [fullPageAds, setFullpageAds] = useState([]);
  const [isEndReached, setIsEndReached] = useState(false);

  const [settingData, setSettingData] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);
  const [step, setStep] = useState(0);
  const handAnim = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const insets = useSafeAreaInsets(); // <-- Add this

  useEffect(() => {
    setIsEndReached(false);

    const checkFirstVisit = async () => {
      const visited = await getVisitedMyFeed();

      if (visited !== 'true') {
        setShowTutorial(true);
        await setVisitedMyFeed();
      }
    };

    checkFirstVisit();
  }, []);
  useEffect(() => {
    setVisitedMyFeed();
    setIsEndReached(false);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Tts.stop();
        navigation.navigate('DrawerNavigation'); //prev replace
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);
  useEffect(() => {
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!focus) return;
      setScreenLoading(true); // Start loader here
      // Load offline data immediately (show cached instantly)
      const offlineData = await getOfflineFeed();
      if (offlineData?.length) {
        setData(offlineData);
      }

      // If network available, fetch fresh data from API
      if (netInfo.isConnected) {
        if (id) {
          GetCategory({path: '', loader: true});
        } else {
          GetAllFeed({
            path:
              type == 'local'
                ? `&lat=${currentPosition?.lat || null}&long=${
                    currentPosition?.long || null
                  }`
                : '',
            loader: true,
            perPage: 50, //added
          });
        }
      } else {
        // If offline, maybe stop loader, just keep offline data
        setScreenLoading(false);
        setloadData(false);
      }
    };

    loadData();
  }, [focus, id, type, featureId, currentPosition, netInfo.isConnected]);

  useEffect(() => {
    Setting_list();
    Advertisement();
    Full_Page_Ads();
  }, [focus]);

  useEffect(() => {
    if (UserType == 'guest') {
      AddDeviceToken();
    }
  }, [focus]);

  const GetCategory = async item => {
    let deviceId = await DeviceInfo.getUniqueId();

    setScreenLoading(item?.loader ? true : false);
    setloadData(item?.loadData === true ? true : false);

    GET(
      `${BLOG_CATEGORY}/${id}?device_id=${deviceId}${item?.path}`,

      async success => {
        const filterData = success?.data?.find(item => item.id === id);
        const newData = filterData?.blog?.data || [];

        setData(prevData =>
          item?.page === true ? [...prevData, ...newData] : newData,
        );

        setTotalPages(filterData?.blog?.last_page || 1);
        setRefresh(false);
        setScreenLoading(false);
        setloadData(false);
      },
      {
        userData: userDetails?.id || '',
      },
      error => {
        setScreenLoading(false);
        setloadData(false);
      },
      fail => {
        setScreenLoading(false);
        setloadData(false);
      },
    );
  };

  const saveInt = saved_category.map(i => {
    return i?.id;
  });
  const GetAllFeed = async item => {
    let deviceId = await DeviceInfo.getUniqueId();

    setScreenLoading(item?.loader ? true : false);
    setloadData(item?.loadData === true ? true : false);

    const perPage = item?.perPage || 10; // default = 10 unless caller overrides

    GET(
      type == 'local'
        ? `${GET_ALL_FEED}?device_id=${deviceId}${item?.path}&per_page=${perPage}`
        : `${GET_ALL_FEED}?category_ids=${saveInt}&feature_news_id=${featureId}&device_id=${deviceId}${item?.path}&per_page=${perPage}`,
      async success => {
        setScreenLoading(false);
        setData(prevData =>
          item?.page === true
            ? [...prevData, ...success?.data?.data]
            : success?.data?.data,
        );
        const fetchedData = success?.data?.data || [];

        if (!item?.page && fetchedData?.length) {
          await setOfflineFeed(fetchedData.slice(0, 50));
        }

        setTotalPages(success?.data?.last_page);
        setloadData(false);
        setRefresh(false);
      },
      {
        userData: userDetails?.id || '',
      },
      error => {
        setloadData(false);
        setScreenLoading(false);

        (async () => {
          // Load from offline storage
          const offlineData = await getOfflineFeed();
          setData(offlineData);
        })();
      },
      fail => {
        setloadData(false);
        setScreenLoading(false);

        (async () => {
          // Load from offline storage
          const offlineData = await getOfflineFeed();
          setData(offlineData);
        })();
      },
    );
  };
  const savePost = (onId, is_bookmark) => {
    const formdata = new FormData();
    formdata.append('blog_id', onId),
      formdata.append('user_id', userDetails?.id),
      POST_FORMDATA(
        is_bookmark == 1 ? DELETE_BOOKMARK : SAVE_BOOKMARK,
        formdata,
        async success => {
          if (success?.status == true) {
            setData(prevData =>
              prevData.map(item =>
                item.id === onId
                  ? {...item, is_bookmark: is_bookmark == 1 ? 0 : 1}
                  : item,
              ),
            );

            ToastMsg(success?.message);
          } else {
            ToastMsg(success?.message);
          }
        },
        {
          userData: userDetails?.id || '',
        }, //added
        error => {
          ToastMsg(error?.message);
        },
        fail => {},
      );
  };
  const Advertisement = () => {
    GET(
      ADVERTISEMENT_BANNER,
      async success => {
        setAdvertisementData(success?.data);
      },
      {
        userData: userDetails?.id,
      }, //added
      error => {},
      fail => {},
    );
  };
  const Full_Page_Ads = () => {
    GET(
      FULL_PAGE_ADS,
      async success => {
        setFullpageAds(success?.data);
      },
      {
        userData: userDetails?.id || '',
      }, //added
      error => {},
      fail => {},
    );
  };

  const Setting_list = () => {
    GET(
      SETTING_LIST,
      async success => {
        setSettingData(success?.data);
      },

      error => {},
      fail => {},
    );
  };

  const loadMoreData = () => {
    if (totalPages === 0) return;

    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setIsEndReached(false);

      const params = {
        path: `&page=${nextPage}`,
        page: true,
        loadData: true,
        perPage: 10, // ✅ always use 10 for subsequent pages
      };

      if (id) {
        GetCategory(params);
      } else {
        GetAllFeed(params);
      }
    } else {
      setIsEndReached(true);
    }
  };
  //using this ads are repeating
  // const mergedList = () => {
  //   const merged = [];
  //   const feeds = data || [];
  //   const smallAds = advertisementData || [];
  //   const fullAds = fullPageAds || [];

  //   const smallAdCount = smallAds.length;
  //   const fullAdCount = fullAds.length;

  //   let smallAdIndex = 0;
  //   let fullAdIndex = 0;

  //   const showAdAfter = Number(settingData?.ads_show_after_news) || Infinity;
  //   let nextFullAdAfter = fullAds[0]?.frequency || Infinity;

  //   let feedSinceSmallAd = 0;
  //   let feedSinceFullAd = 0;

  //   for (let i = 0; i < feeds.length; i++) {
  //     const feedItem = feeds[i];

  //     merged.push({
  //       type: 'feed',
  //       data: feedItem,
  //       adData: null,
  //     });

  //     feedSinceSmallAd++;
  //     feedSinceFullAd++;

  //     // Full-page ads
  //     if (feedSinceFullAd >= nextFullAdAfter && fullAdCount > 0) {
  //       merged.push({
  //         type: 'full',
  //         data: null,
  //         adData: fullAds[fullAdIndex],
  //       });

  //       feedSinceFullAd = 0;
  //       fullAdIndex = (fullAdIndex + 1) % fullAdCount;
  //       nextFullAdAfter = fullAds[fullAdIndex]?.frequency || Infinity;
  //     }

  //     // Small ads
  //     if (feedSinceSmallAd >= showAdAfter && smallAdCount > 0) {
  //       merged.push({
  //         type: 'ad',
  //         data: feedItem, // attach last feed for context (fixes blank screen)
  //         adData: smallAds[smallAdIndex],
  //       });

  //       feedSinceSmallAd = 0;
  //       smallAdIndex = (smallAdIndex + 1) % smallAdCount;
  //     }
  //   }

  //   return merged;
  // };

  const mergedList = () => {
    const merged = [];
    const feeds = data || [];
    const smallAds = advertisementData || [];
    const fullAds = fullPageAds || [];

    const smallAdCount = smallAds.length;
    const fullAdCount = fullAds.length;

    let smallAdIndex = 0;
    let fullAdIndex = 0;

    const showAdAfter = Number(settingData?.ads_show_after_news) || Infinity;
    let nextFullAdAfter = fullAds[0]?.frequency || Infinity;

    let feedSinceSmallAd = 0;
    let feedSinceFullAd = 0;

    let lastFeedItem = null;

    for (let i = 0; i < feeds.length; i++) {
      const feedItem = feeds[i];

      // Push the feed item
      merged.push({
        type: 'feed',
        data: feedItem,
        adData: null,
      });

      lastFeedItem = feedItem;

      feedSinceSmallAd++;
      feedSinceFullAd++;

      // Full-page ads
      if (feedSinceFullAd >= nextFullAdAfter && fullAdCount > 0) {
        merged.push({
          type: 'full',
          data: null,
          adData: fullAds[fullAdIndex],
        });

        feedSinceFullAd = 0;
        fullAdIndex = (fullAdIndex + 1) % fullAdCount;
        nextFullAdAfter = fullAds[fullAdIndex]?.frequency || Infinity;
      }

      // Small ads
      if (feedSinceSmallAd >= showAdAfter && smallAdCount > 0) {
        merged.push({
          type: 'ad',
          data: lastFeedItem, // Attach the last feed item
          adData: smallAds[smallAdIndex],
        });

        feedSinceSmallAd = 0;
        smallAdIndex = (smallAdIndex + 1) % smallAdCount;
      }
    }

    return merged;
  };

  const BlogViewCount = async blogId => {
    let deviceId = await DeviceInfo.getUniqueId();

    const formdata = new FormData();
    formdata.append('blog_id', blogId);
    formdata.append('action', 'view');
    formdata.append('user_id', UserType !== 'guest' ? userDetails?.id : '');
    formdata.append('device_id', deviceId);

    POST_FORMDATA(
      BLOG_VIEW_COUNT,
      formdata,
      async success => {},
      error => {},
      fail => {},
    );
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -20) {
          setIsEndReached(false);
          navigation?.navigate('DrawerNavigation');
        }
      },
    }),
  ).current;

  const stepRef = useRef(0);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const flatListRef = useRef(null);
  const currentVisibleItemRef = useRef(null);

  const pan_Responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 20 || Math.abs(gestureState.dx) > 20,

      onPanResponderRelease: (_, gestureState) => {
        const {dx, dy} = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const currentStep = stepRef.current;

        // Step 0 → Swipe Up
        if (currentStep === 0 && dy < -20 && absDy > absDx) {
          flatListRef.current?.scrollToOffset({
            offset: FULL_HEIGHT,
            animated: true,
          });
          setStep(1);
          stepRef.current = 1;
        }

        // Step 1 → Swipe Down
        else if (currentStep === 1 && dy > 20 && absDy > absDx) {
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
          setStep(2);
          stepRef.current = 2;
        }

        // Step 2 → Swipe Right (new functionality)
        else if (currentStep === 2 && dx < -20 && absDx > absDy) {
          // 💡 Replace this with whatever new action you want
          const currentVisibleItem = currentVisibleItemRef.current;
          if (currentVisibleItem?.url) {
            navigation?.navigate('WebViewScreen', {
              url: currentVisibleItem.url,
            });
          }
          setStep(3);
          stepRef.current = 3;
        }

        // Step 3 → Swipe Left → always last
        else if (currentStep === 3 && dx > 20 && absDx > absDy) {
          navigation?.navigate('DrawerNavigation');
          setStep(4);
          stepRef.current = 4;

          setTimeout(() => setShowTutorial(false), 800);
        }
      },
    }),
  ).current;

  const onViewRef = React.useRef(({viewableItems}) => {
    if (viewableItems?.length > 0) {
      const firstVisibleItem = viewableItems[0]?.item;
      const blogId = firstVisibleItem?.data?.id;

      Tts.stop();

      if (!blogId || firstVisibleItem?.type !== 'feed') return;

      // Store for swipe-right WebView navigation
      currentVisibleItemRef.current = firstVisibleItem?.data;

      if (lastViewedIdRef.current === blogId) return;

      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }

      const delay = Number(settingData?.news_view_time) * 1000;

      viewTimerRef.current = setTimeout(() => {
        // Run BlogViewCount only if route.params.id !== 12
        if (id !== 12) {
          BlogViewCount(blogId);
          lastViewedIdRef.current = blogId;
        }
      }, delay || 5000);
    }
  });

  const viewConfigRef = React.useRef({
    itemVisiblePercentThreshold: 60,
  });

  const getPositionStyle = step => {
    switch (step) {
      case 0:
        return {
          bottom: -100,
        };
      case 1:
        return {
          top: -100,
        };
      case 2:
        return {
          bottom: '90%',
          right: -30,
        };
      case 3:
        return {
          bottom: '90%',
          left: -30,
        };
      case 4:
        return {
          top: '90%',
          left: '80%',
        };
      default:
        return {};
    }
  };

  const translateYAnim = useRef(new Animated.Value(0)).current;

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set direction movement
    let toValue = {x: 0, y: 0};
    let rotationDeg = 0;

    switch (step) {
      case 0: // Swipe Up
        toValue = {x: 0, y: -20};
        rotationDeg = -90;
        break;
      case 1: // Swipe Down
        toValue = {x: 0, y: 20};
        rotationDeg = 90;
        break;
      case 2: // Swipe Left
        toValue = {x: -20, y: 0};
        rotationDeg = 0;
        break;
      case 3: // Swipe Right
        toValue = {x: 20, y: 0};
        rotationDeg = 180;
        break;
      default:
        toValue = {x: 0, y: 0};
        rotationDeg = 30;
    }

    // Reset movement position
    handAnim.setValue({x: 0, y: 0});

    // Animate movement
    const moveAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(handAnim, {
          toValue,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(handAnim, {
          toValue: {x: 0, y: 0},
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    // Animate rotation (once)
    const rotateTo = Animated.timing(rotateAnim, {
      toValue: rotationDeg,
      duration: 300,
      useNativeDriver: true,
    });

    rotateTo.start();
    moveAnim.start();

    return () => {
      moveAnim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Hey! I'm working on buzzify app. I'll share the download link with you soon. Stay tuned!",
      });
    } catch (error) {
      // Ignore error silently — optionally track it in crash tool if needed
    }
  };

  //for thankyou and congrats
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateYAnim, {
          toValue: -20,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const AddDeviceToken = async () => {
    let deviceId = await DeviceInfo.getUniqueId();

    const fcmToken = await getSavedFcmToken();
    const formdata = new FormData();
    formdata.append('device_id', deviceId),
      formdata.append('player_id', fcmToken);

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

  return (
    <SafeAreaView style={[styles?.topView, {paddingBottom: insets.bottom}]}>
      <Header
        title={name ? name : localization?.customDrawer?.myFeed}
        onPressBack={() => {
          Tts.stop();
          setIsEndReached(false);
          navigation.navigate('DrawerNavigation');
        }}
        style={{
          marginHorizontal: 20,
          width: FULL_WIDTH * 0.9,
          marginTop:
            Platform.OS == 'ios' ? FULL_HEIGHT * 0.012 : FULL_HEIGHT * 0.05,
        }}
      />
      <View style={{flex: 1}}>
        <FlatList
          data={mergedList()}
          keyExtractor={(item, index) =>
            `item_${item?.data?.id || 'ad'}_${index}`
          }
          ref={flatListRef}
          {...(showTutorial ? pan_Responder.panHandlers : {})}
          scrollEnabled={!showTutorial || step === 0 || step === 1}
          renderItem={({item}) => {
            return (
              <View>
                <ShowPostCard
                  item={item?.data}
                  adData={item?.adData}
                  isAd={!!item?.adData}
                  adType={item?.type}
                  saveIcon={
                    item?.data?.is_bookmark == 0
                      ? images?.SaveImg
                      : images?.SaveFilled
                  }
                  onPressSave={() => {
                    if (UserType === 'guest') {
                      ToastMsg(localization?.addFeedback?.savestor);
                    } else {
                      savePost(item?.data?.id, item?.data?.is_bookmark);
                    }
                  }}
                  // disabled={name ? true : false}
                  disabled={!(!name && UserType !== 'guest')}
                />
              </View>
            );
          }}
          contentContainerStyle={{}}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          decelerationRate="normal"
          snapToInterval={FULL_HEIGHT}
          snapToAlignment="start"
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          disableIntervalMomentum={true}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              enabled={true}
              colors={[colors?.ORANGE]}
              onRefresh={() => {
                setRefresh(true);

                if (id) {
                  GetCategory({
                    path: '',
                    loader: false,
                  });
                } else {
                  GetAllFeed({
                    // path: '',
                    path:
                      type == 'local'
                        ? `&lat=${
                            currentPosition?.lat ? currentPosition?.lat : null
                          }&long=${
                            currentPosition?.long ? currentPosition?.long : null
                          }`
                        : '',
                    loader: false,
                    perPage: 50,
                  });
                }
              }}
            />
          }
          ListEmptyComponent={() => {
            return !screenLoading && <NoData />;
          }}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
        {isEndReached &&
          (UserType === 'guest' ? (
            <View
              style={{
                alignItems: 'center',
                height: FULL_HEIGHT * 0.93,
                justifyContent: 'center',
              }}>
              <View style={{alignItems: 'center'}}>
                <Animated.Image
                  source={images?.Thumb}
                  style={{
                    height: 70,
                    width: 70,
                    transform: [{translateY: translateYAnim}],
                  }}
                />
                <Typography
                  size={30}
                  textAlign={'center'}
                  type={fonts?.Montserrat_Bold}
                  style={{
                    maxWidth: FULL_WIDTH * 0.7,
                  }}>
                  {localization?.Thanks?.title}
                </Typography>
                <Typography
                  size={18}
                  textAlign={'center'}
                  type={fonts?.Montserrat_LightItalic}
                  style={{
                    marginTop: 20,
                    maxWidth: FULL_WIDTH * 0.6,
                  }}>
                  {localization?.Thanks?.love}
                </Typography>
                <Typography
                  size={18}
                  textAlign={'center'}
                  type={fonts?.Montserrat_LightItalic}
                  color={'#DAA520'}
                  style={{
                    marginBottom: FULL_HEIGHT * 0.04,
                    maxWidth: FULL_WIDTH * 0.6,
                  }}>
                  {localization?.Thanks?.share}
                </Typography>
              </View>
              <Button
                btnTitle={localization?.Thanks?.btnTitle}
                borderRadius={10}
                btnWidth="55%"
                onPress={() => {
                  handleShare();
                }}
              />
            </View>
          ) : (
            <View
              {...panResponder.panHandlers}
              style={{
                alignItems: 'center',
                height: FULL_HEIGHT * 0.93,
                justifyContent: 'center',
              }}>
              <Animated.Image
                source={images?.Thumb}
                style={{
                  height: 70,
                  width: 70,
                  transform: [{translateY: translateYAnim}],
                }}
              />
              <Typography
                size={30}
                type={fonts?.Montserrat_Bold}
                style={{marginVertical: 20}}>
                {localization?.Congo?.cong}
              </Typography>
              <Typography
                size={18}
                lineHeight={26}
                style={{width: '40%'}}
                textAlign={'center'}>
                {localization?.Congo?.youHave}
              </Typography>

              <Animated.Image
                source={images?.RedArrow}
                style={{
                  height: 100,
                  width: 100,
                  marginTop: 30,
                  marginBottom: 20,
                  transform: [{translateY: translateYAnim}],
                }}
              />
              <Typography
                size={20}
                type={fonts?.Montserrat_SemiBold}
                textAlign={'center'}
                style={{width: '70%'}}>
                {localization?.Congo?.swipeup}
              </Typography>
            </View>
          ))}

        {loadData && (
          <ActivityIndicator
            size={'small'}
            color={colors?.ORANGE}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 75,
            }}
          />
        )}
      </View>
      {showTutorial && (
        <View style={styles.overlay} {...pan_Responder.panHandlers}>
          {step < 5 && (
            <View>
              <View style={{padding: 5, marginVertical: 10}}>
                <Typography
                  textAlign={'center'}
                  color={colors?.WHITE}
                  size={16}>
                  {step === 0 && localization?.Tutorial?.up}
                  {step === 1 && localization?.Tutorial?.down}
                  {step === 2 && localization?.Tutorial?.right}
                  {step === 3 && localization?.Tutorial?.left}
                  {step === 4 && localization?.Tutorial?.done}
                </Typography>
              </View>

              <Animated.Image
                source={require('../../../Assets/Icons/Swipe.png')}
                style={[
                  styles.hand,
                  getPositionStyle(step),
                  {
                    tintColor: 'rgba(255,255,255,0.3)',
                    transform: [
                      {translateX: handAnim.x},
                      {translateY: handAnim.y},
                      {rotate: rotateInterpolate},
                    ],
                  },
                ]}
                resizeMode="contain"
              />
              {/* Skip Button */}
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              setShowTutorial(false);
            }}
            style={{
              width: FULL_WIDTH * 0.5,
              position: 'absolute',
              bottom: 50,
              alignSelf: 'center',
            }}>
            <Button
              btnTitle={localization?.Tutorial?.skipTutorial}
              btnWidth="100%"
              onPress={() => {
                setShowTutorial(false);
              }}
            />
          </TouchableOpacity>
        </View>
      )}

      <Loading visible={screenLoading} />
    </SafeAreaView>
  );
};

export default MyFeed;
const getStyles = themeColors =>
  StyleSheet.create({
    topView: {
      flex: 1,
      backgroundColor: themeColors?.background,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    hand: {
      width: 75,
      height: 75,
      alignSelf: 'center',
      position: 'absolute',
    },
  });
