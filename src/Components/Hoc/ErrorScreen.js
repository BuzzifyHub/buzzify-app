import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Typography from './Typography';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import {useSelector} from 'react-redux';
import localization from '../../Constants/localization';

const SCREEN_WIDTH = Dimensions.get('window').width;

function ErrorScreen({style = {}, styleChildren = {}, visible = false}) {
  const UserType = useSelector(store => store.isUserType);

  if (!visible) return null;

  return (
    <View style={[styles.toastWrapper, style]}>
      <View style={[styles.toastBox, styleChildren]}>
        <Typography
          style={styles.title}
          size={13}
          type={fonts?.Montserrat_Bold}
          textAlign="center">
          {UserType == 'guest'
            ? localization?.myRewards?.offline
            : localization?.myRewards?.noworr}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    bottom: hp(8),
    width: SCREEN_WIDTH,
    paddingHorizontal: wp(5),
    alignItems: 'center',
    zIndex: 999,
  },
  toastBox: {
    backgroundColor: '#FFE3E3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    color: colors.BLACK,
  },
});

export default ErrorScreen;
