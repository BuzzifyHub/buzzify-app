import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {useNetInfo} from '@react-native-community/netinfo';
import {Easing} from 'react-native-reanimated';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import ErrorScreen from './ErrorScreen';

const NetAlert = () => {
  const height = new Animated.Value(0);
  const netInfo = useNetInfo();
  const [message, setMessage] = useState('No Internet');
  const [visible, setVisible] = useState(false);
  const {isConnected, isInternetReachable} = netInfo;

  useEffect(() => {
    if (
      isConnected == null ||
      isInternetReachable == null ||
      (isConnected && isInternetReachable)
    ) {
      setVisible(false);
      hideAlert();
      setMessage('');
    } else {
      showAlert();
      setVisible(true);
      setMessage('No Internet');
    }
  }, [isConnected, isInternetReachable]);

  const showAlert = () => {
    Animated.timing(height, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.bounce,
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(height, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.bounce,
    }).start();
  };

  return (
    <Animated.View style={styles.container(height)}>
      <Text style={styles.internetText}>{message}</Text>
      {!!visible && <ErrorScreen visible={visible} />}
    </Animated.View>
  );
};

export default NetAlert;

const styles = StyleSheet.create({
  container: ht => {
    return {
      height: ht.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        // extrapolate: 'clamp',
      }),
      backgroundColor: colors?.ORANGE,
    };
  },
  internetText: {
    fontSize: 14,
    fontFamily: fonts.Montserrat_Medium,
    color: colors.WHITE,
    textAlign: 'center',
    zIndex: 999,
  },
});
