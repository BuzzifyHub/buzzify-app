import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import React from 'react';
import colors from '../../Constants/colors';
import {FULL_HEIGHT} from '../../Constants/Layout';
import Typography from './Typography';
import fonts from '../../Constants/fonts';
import localization from '../../Constants/localization';

const Loader = ({
  message = 'Loading...',
  size = 'large',
  color = colors.ORANGE,
  loading = false,
}) => {
  return (
    <>
      {loading && (
        <View style={styles.container}>
          <ActivityIndicator size={size} color={color} />
          {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
      )}
    </>
  );
};

export default Loader;
export const NoData = ({customHeight = FULL_HEIGHT * 0.9}) => {
  return (
    <View style={[styles?.container, {height: customHeight}]}>
      <Typography
        color={colors?.ORANGE}
        size={18}
        type={fonts?.Montserrat_Medium}>
        {localization?.addFeedback?.noDataFound}{' '}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: FULL_HEIGHT * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: colors.DARK_GREY,
  },
});
