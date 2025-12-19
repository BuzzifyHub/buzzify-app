import {StyleSheet} from 'react-native';
const GlobalStyles = StyleSheet.create({
  commonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  common: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgetView: {
    flex: 0.99,
    justifyContent: 'space-between',
  },
  mainView: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default GlobalStyles;
