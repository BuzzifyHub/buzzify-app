import {
  Alert,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../Hoc/ThemeContext';
import { FULL_HEIGHT, FULL_WIDTH } from '../../Constants/Layout';
import images from '../../Constants/images';
import Typography from '../Hoc/Typography';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import { darkTheme, lightTheme } from '../../Constants/Color';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import Tts from 'react-native-tts';
import FastImage from 'react-native-fast-image';
import localization from '../../Constants/localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ShowPostCard = ({
  item,
  onPressSave,
  saveIcon = images?.SaveImg,
  isAd = false,
  adData,
  adType,
  disabled = false,
  isSearching = false,
}) => {
  const currentTextRef = useRef('');
  const { resolvedTheme } = useTheme();
  const styles = getStyles(themeColors);
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const insets = useSafeAreaInsets();
  const fontSize = Math.max(14, Math.min(15, FULL_WIDTH * 0.045)); // keeps within reasonable bounds

  useEffect(() => {
    const handleStart = () => setIsSpeaking(true);
    const handleFinish = () => setIsSpeaking(false);
    const handleCancel = () => setIsSpeaking(false);

    Tts.addEventListener('tts-start', handleStart);
    Tts.addEventListener('tts-finish', handleFinish);
    Tts.addEventListener('tts-cancel', handleCancel);

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, []);

  useEffect(() => {
    if (item?.banner_image && item?.banner_image[0]) {
      FastImage.preload([{ uri: item?.banner_image[0] }]);
    }
  }, [item?.banner_image]);

  const cleanHTML = html => {
    return html?.replace(/<[^>]+>/g, '')?.replace(/&[^;]+;/g, '');
  };

  const speakText = (title, subtitle) => {
    const text = `${title}. ${cleanHTML(subtitle)}`;
    if (isSpeaking && currentTextRef.current === text) {
      Tts.stop();
      setIsSpeaking(false);
    } else {
      currentTextRef.current = text;
      Tts.stop();
      setIsSpeaking(true);
      Tts.speak(text);
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dx = gestureState.dx;
        const touchX = evt.nativeEvent.pageX;
        Tts.stop();

        if (dx > 20 && touchX < 350) {
          navigation?.navigate('DrawerNavigation');
        } else if (dx < -20) {
          if (item?.url) {
            navigation?.navigate('WebViewScreen', { url: item?.url });
          } else {
            Alert.alert(localization?.AddStory?.noLinks);
          }
        }
      },
    }),
  ).current;

  if (adType === 'full' && adData) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation?.navigate('WebViewScreen', { url: adData?.url });
        }}
        style={{
          height: FULL_HEIGHT,
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: adData?.media[0]?.file }}
          style={{
            width: FULL_WIDTH * 0.99,
            height: FULL_HEIGHT * 0.9 - insets.bottom,
            resizeMode: 'stretch',
          }}
        />
      </TouchableOpacity>
    );
  }
  const timeAgo = dateString => {
    if (!dateString) return ''; // Prevent showing "NaN seconds ago"
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    if (diffMs < 0) return 'Just now'; // future date fallback

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return years + (years === 1 ? ' year ago' : ' years ago');
    if (months > 0)
      return months + (months === 1 ? ' month ago' : ' months ago');
    if (days > 0) return days + (days === 1 ? ' day ago' : ' days ago');
    if (hours > 0) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    if (minutes > 0)
      return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
    return seconds + (seconds === 1 ? ' second ago' : ' seconds ago');
  };
  // if (!item || !item.title) return null;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        height: FULL_HEIGHT,
        // paddingBottom: insets.bottom,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          if (item?.video_url) {
            Linking.openURL(item?.video_url);
            // navigation?.navigate('WebViewScreen', {url: item?.video_url});
          } else {
            setSelectedImage(item?.banner_image[0]);
            setSelectedTitle(item?.title);
            setModalVisible(true);
          }
        }}
      >
        <FastImage
          style={{
            height: FULL_HEIGHT * 0.27,
            width: FULL_WIDTH,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          source={{
            uri: item?.banner_image[0],
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item?.video_url && (
          <View style={{ position: 'absolute' }}>
            <Image
              source={images?.Youtube}
              style={{ height: 75, width: 75 }}
            ></Image>
          </View>
        )}
      </TouchableOpacity>

      <View
        style={{
          justifyContent: 'space-between',
          // flex: 0.84, //added
          flex: Platform.OS == 'ios' ? 0.78 : 0.82, //added
          width: FULL_WIDTH * 0.92,
          alignSelf: 'center',
        }}
      >
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              position: 'absolute',
              width: FULL_WIDTH * 0.92,
              top: -25,
            }}
          >
            <TouchableOpacity
              disabled={disabled}
              onPress={() => {
                navigation?.navigate('SaveInterestMain');
              }}
              style={{
                flexDirection: 'row',
                backgroundColor: themeColors?.background,
                borderRadius: 25,
                alignItems: 'center',
                padding: 7,
                paddingHorizontal: 10,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors?.WHITE,
                maxWidth: '60%',
              }}
            >
              <Image
                source={images?.Dot}
                style={{
                  height: 18,
                  width: 18,
                  tintColor: 'red',
                  marginRight: 5,
                }}
              />
              <Typography
                color={themeColors?.iconColor}
                size={12}
                style={{ marginRight: 5 }}
              >
                {/* {Array.isArray(item?.blog_category)
                  ? item.blog_category
                      .map(i => i?.category?.name)
                      .filter(Boolean)
                      .join(' - ')
                  : item?.category_name || ''} */}
                {Array.isArray(item?.blog_category)
                  ? item.blog_category[0]?.category?.name || ''
                  : item?.category_name || ''}
              </Typography>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: themeColors?.background,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <TouchableOpacity style={styles?.imgBg} onPress={onPressSave}>
                <Image source={saveIcon} style={styles?.iconStyle} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles?.imgBg}
                onPress={() => {
                  speakText(item?.title, item?.description);
                }}
              >
                <Image
                  source={isSpeaking ? images?.Speaker : images?.Voice}
                  style={styles?.iconStyle}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles?.imgBg}
                onPress={() => {
                  const deepLink = `https://buzzify.24livehost.com/public/blog-details/${item?.id}`;

                  Share.share({
                    message: `Check out this news on Buzzify: ${deepLink}`,
                    url: deepLink,
                    title: 'Share Product',
                  }).catch(error => {
                    // Ignore error silently — optionally track it in crash tool if needed
                  });
                }}
              >
                <Image source={images?.Share} style={styles?.iconStyle} />
              </TouchableOpacity>
            </View>
          </View>
          <Typography
            size={18}
            type={fonts?.Montserrat_SemiBold}
            style={{ marginTop: 30, marginBottom: 5 }}
            lineHeight={27}
          >
            {item?.title}
          </Typography>
          <View style={{}}>
            <RenderHTML
              contentWidth={FULL_WIDTH}
              source={{ html: item?.description }}
              defaultTextProps={{
                style: {
                  // fontSize: 16,
                  // lineHeight: 23,
                  fontSize: fontSize,
                  lineHeight: fontSize * 1.43,
                  color: themeColors?.iconColor,
                  textAlign: 'justify',
                },
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginTop: 5,
            }}
          >
            <Typography size={12} color={themeColors?.lightGrey}>
              {timeAgo(item?.schedule_date)}
            </Typography>
            {item?.author_name && (
              <Typography size={12} color={themeColors?.lightGrey}>
                {' -'}
              </Typography>
            )}

            {item?.author_name && (
              <Typography size={12} color={themeColors?.lightGrey}>
                {' '}
                {item?.author_name}{' '}
              </Typography>
            )}
            {item?.source_name && (
              <Typography size={12} color={themeColors?.lightGrey}>
                {'-'}
              </Typography>
            )}
            {item?.source_name && (
              <Typography size={12} color={themeColors?.lightGrey}>
                {''} {item?.source_name}{' '}
              </Typography>
            )}
          </View>
        </View>
        {isAd && adData && (
          <View
            style={{
              paddingHorizontal: 16,
              alignItems: 'center',
              marginTop: 10,
              // marginBottom: Platform.OS == 'ios' ? heightPercentageToDP(5) : 5,
              paddingBottom: insets.bottom || 10, // ensures the ad is above nav bar/gestures
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                navigation?.navigate('WebViewScreen', { url: adData?.url });
              }}
            >
              <Image
                source={{ uri: adData?.image }}
                style={{
                  width: FULL_WIDTH * 0.9,
                  height: 60,
                  borderRadius: 12,
                  resizeMode: 'stretch',
                }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        animationType="none"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles?.container}>
          <TouchableOpacity
            style={styles?.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles?.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <FastImage
              style={styles.image}
              source={{ uri: selectedImage }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          <View style={styles.bottomBar}>
            <Typography color={colors?.WHITE}>{selectedTitle}</Typography>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ShowPostCard;

const getStyles = themeColors =>
  StyleSheet.create({
    imgBg: {
      backgroundColor: themeColors?.background,
      borderWidth: 1,
      borderColor: colors?.ORANGE,
      padding: 2,
      height: 30,
      width: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 3,
    },
    iconStyle: { height: 13, width: 13, tintColor: colors?.ORANGE },

    container: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: FULL_WIDTH,
      height: FULL_HEIGHT * 0.9,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      paddingHorizontal: 20,
      alignItems: 'center',
    },

    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 1,
    },
    closeText: {
      color: 'white',
      fontSize: 25,
    },
    linearGradient: {
      paddingLeft: 15,
      paddingRight: 15,
    },
  });
