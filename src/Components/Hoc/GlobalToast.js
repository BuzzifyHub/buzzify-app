import {Animated, Easing, StyleSheet, View} from 'react-native';
import React, {useRef, useState} from 'react';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import Typography from './Typography';

const GlobalToast = () => {
  const animated = useRef(new Animated.Value(0)).current;
  const [toastMessage, setMessage] = useState('');
  const [show, setShow] = useState(false);
  global.ToastMsg = (message = '', type = '') => {
    try {
      message && setMessage(message);
      setShow(true);
    } catch (error) {
      // Ignore error silently — optionally track it in crash tool if needed
    }

    Animated.timing(animated, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.ease,
    }).start();

    setTimeout(() => {
      setMessage('');
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start();
      setShow(false);
    }, 2500);
  };

  return (
    <>
      {show && (
        <Animated.View style={styles?.container(animated)}>
          <View>
            <Typography
              color={colors?.WHITE}
              type={fonts?.Montserrat_Bold}
              size={14}>
              {toastMessage}
            </Typography>
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default GlobalToast;
const styles = StyleSheet.create({
  container: animated => ({
    top: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 45],
    }),
    opacity: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    backgroundColor: colors?.ORANGE,
    elevation: 1,
    marginHorizontal: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    borderRadius: 20,
    paddingVertical: 15,
    shadowColor: colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 100,
    position: 'absolute',
    top: '89%',
  }),
  icon: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
});
