import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import images from '../../Constants/images';
import {FULL_HEIGHT, FULL_WIDTH} from '../../Constants/Layout';
import Typography from './Typography';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import SvgIcon from '../../Constants/svg';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from './ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';

const Header = ({
  title,
  downTitle = false,
  backArrow = true,
  subTitle = false,
  subTitleText = '',
  customMargin = Platform.OS == 'ios'
    ? FULL_HEIGHT * 0.012
    : FULL_HEIGHT * 0.02,
  backArrowName = images?.Arrow,
  arrowStyle,
  txtSize = 26,
  onPressBack = () => {},
  titleColor = colors?.ORANGE,
  titleWidth = '60%',
  marginBottom = 17,
  rightImg = false,
  onPressRightImg = () => {},
  style,
}) => {
  const navigation = useNavigation();
  const {themeMode, resolvedTheme, toggleTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  return (
    <>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.background}
      />
      <View
        style={{
          marginTop: customMargin,
          flexDirection: downTitle ? 'column' : 'row',
          alignItems: downTitle ? 'flex-start' : 'center',
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: marginBottom,
          ...style,
        }}>
        {backArrow && (
          <TouchableOpacity onPress={onPressBack} style={{}}>
            <Image
              source={backArrowName}
              style={{height: 44, width: 44, ...arrowStyle}}
            />
          </TouchableOpacity>
        )}
        <View
          style={{
            alignSelf: 'center',
            width: titleWidth,
            alignItems: 'center',
          }}>
          <Typography
            size={txtSize}
            textAlign={'center'}
            type={fonts?.Montserrat_Bold}
            color={titleColor}>
            {title}
          </Typography>
          {subTitle && (
            <Typography
              size={16}
              textAlign={'center'}
              type={fonts?.Montserrat_SemiBold}
              color={colors?.ORANGE}>
              {subTitleText}
            </Typography>
          )}
        </View>

        {rightImg && (
          <TouchableOpacity onPress={onPressRightImg}>
            <Image
              source={images?.AddBtn}
              style={{height: 44, width: 65}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {!rightImg && <View style={{width: 44}}></View>}
      </View>
    </>
  );
};

export default Header;

export const Happiness = ({style}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View
      style={{
        alignSelf: 'center',
        ...style,
      }}>
      <Image
        source={images?.Happiness}
        style={{
          resizeMode: 'contain',
          height: FULL_HEIGHT * 0.06,
          width: FULL_WIDTH * 0.4,
        }}
        tintColor={themeColors?.text}
      />
    </View>
  );
};
export const DashboardHeader = ({
  onPressNotification = () => {},
  onPressMenu = () => {},
  onPressSearch = () => {},
  onPressProfile = () => {},
  tintColor,
  isUser = true,
  customWidth = FULL_WIDTH * 0.28,
}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const textColor = tintColor ?? themeColors?.iconColor;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
      }}>
      <View
        style={[
          styles?.commonStyle,
          {
            width: FULL_WIDTH * 0.38,
          },
        ]}>
        <Image
          source={images?.LogoBanner}
          style={{
            height: 32,
            width: FULL_WIDTH * 0.3,
            resizeMode: 'contain',
          }}
        />
        <TouchableOpacity onPress={onPressMenu}>
          <Image source={images?.Menu} style={styles?.imgStyle} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles?.commonStyle,
          {
            width: customWidth,
          },
        ]}>
        {isUser && (
          <TouchableOpacity onPress={onPressNotification}>
            <SvgIcon name="notification" color={textColor} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPressSearch}>
          <Image source={images?.Search} style={styles?.imgStyle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressProfile}>
          <Image
            source={images?.RoundLogo}
            style={{
              height: 32,
              width: 32,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = themeColors =>
  StyleSheet.create({
    commonStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    imgStyle: {
      height: 25,
      width: 25,
      resizeMode: 'contain',
      tintColor: themeColors?.iconColor,
    },
  });
