import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Typography from './Typography';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import localization from '../../Constants/localization';

export const Button = ({
  onPress = () => {},
  btnTitle = localization?.addFeedback?.submit,
  btnWidth = '50%',
  borderRadius = 100,
  loading = false,
  disabled = false,
  customStyle,
  txtSize = 16,
  txtColor = colors?.WHITE,
  btnHeight = 60,
}) => {
  const onBtnPress = () => {
    if (loading || disabled) {
    } else {
      Keyboard.dismiss();
      onPress();
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || disabled}
      style={[
        styles?.mainStyle,
        {
          width: btnWidth,
          borderRadius: borderRadius,
          height: btnHeight,
          ...customStyle,
        },
      ]}
      onPress={onBtnPress}>
      {loading ? (
        <ActivityIndicator size={'small'} color={colors?.WHITE} />
      ) : (
        <Typography
          size={txtSize}
          color={txtColor}
          type={fonts?.Montserrat_Bold}>
          {btnTitle}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  mainStyle: {
    backgroundColor: colors?.ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
