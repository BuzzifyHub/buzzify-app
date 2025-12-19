import {StyleSheet, Text} from 'react-native';
import React from 'react';
import fonts from '../../Constants/fonts';
import {darkTheme, lightTheme} from '../../Constants/Color';
import {useTheme} from './ThemeContext';
import {useFontSize} from './FontSizeContext';

export const Typography = ({
  numberOfLines,
  textDecorationLine,
  size = 14,
  type = fonts?.Montserrat_Medium,
  textAlign,
  color,
  lineHeight,
  style = {},
  children,
  ...props
}) => {
  const {resolvedTheme} = useTheme();
  const {getSizeMultiplier} = useFontSize();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const textColor = color ?? themeColors?.iconColor;
  const adjustedSize = size * getSizeMultiplier();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          textDecorationLine: textDecorationLine,
          fontSize: adjustedSize,
          fontFamily: type,
          textAlign: textAlign,
          color: textColor,
          textAlignVertical: 'center',
          lineHeight: lineHeight,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

export default Typography;

const getStyles = themeColors => StyleSheet.create({});
