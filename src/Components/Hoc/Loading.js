import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import colors from '../../Constants/colors';

const Loading = ({visible}) => {
  return (
    <View
      style={[styles.overlay, {opacity: visible ? 1 : 0}]}
      pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.ORANGE} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});

export default Loading;
