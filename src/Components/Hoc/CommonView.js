import {StyleSheet, View} from 'react-native';
import React from 'react';
import {FULL_WIDTH} from '../../Constants/Layout';
import {useTheme} from './ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const CommonView = ({children, customStyle}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);

  return (
    <SafeAreaView style={styles.mainView}>
      <View
        style={{
          alignSelf: 'center',
          flex: 1,
          width: FULL_WIDTH * 0.92,
          ...customStyle,
        }}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default CommonView;

const getStyles = themeColors =>
  StyleSheet.create({
    mainView: {
      alignSelf: 'center',
      width: FULL_WIDTH,
      backgroundColor: themeColors.background,
      flex: 1,
    },
  });
