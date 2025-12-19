import {Image, StatusBar, StyleSheet, View} from 'react-native';
import React from 'react';
import images from '../../Constants/images';
import {FULL_HEIGHT, FULL_WIDTH} from '../../Constants/Layout';
import {useTheme} from '../../Components/Hoc/ThemeContext';

const LaunchScreen = () => {
  const {resolvedTheme} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={'black'}
      />
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={images?.Splash_Screen}
          style={{height: FULL_HEIGHT, width: FULL_WIDTH}}></Image>
      </View>
    </>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({});
