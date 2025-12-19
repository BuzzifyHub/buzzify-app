import {View, FlatList, StyleSheet, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header from '../../../Components/Hoc/Header';
import Button from '../../../Components/Hoc/Button';
import Typography from '../../../Components/Hoc/Typography';
import fonts from '../../../Constants/fonts';
import localization from '../../../Constants/localization';
import {LIST_WALLET_HISTORY, USER_WALLET} from '../../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {GET} from '../../../Backend/Backend';
import moment from 'moment';
import colors from '../../../Constants/colors';
import Loader, {NoData} from '../../../Components/Hoc/Loader';
import {useTheme} from '../../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../../Constants/Color';
import GlobalStyles from '../../../Constants/GlobalStyles';

const MyRewards = ({navigation}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const [walletData, setWalletData] = useState([]);
  const [walletHistory, setWalletHistory] = useState();
  const focus = useIsFocused();
  const userDetails = useSelector(store => store.user_details);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    UserWallet();
    UserWalletHistory();
  }, [focus]);
  const UserWallet = () => {
    GET(
      USER_WALLET + '?user_id=' + userDetails?.id,
      async success => {
        setLoader(false);
        setWalletData(success?.data);
      },
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };

  const UserWalletHistory = () => {
    setLoader(true);
    GET(
      LIST_WALLET_HISTORY + '?user_id=' + userDetails?.id,
      async success => {
        setLoader(false);
        setWalletHistory(success?.data?.data);
      },
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };
  const stripHtml = html => {
    return html?.replace(/<[^>]*>?/gm, '') || '';
  };
  return (
    <CommonView customStyle={{}}>
      <Header
        title={localization?.customDrawer?.myRewards}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View style={GlobalStyles?.commonStyle}>
        <Button
          btnTitle={localization?.myRewards?.redeem}
          borderRadius={10}
          btnWidth="47%"
          btnHeight={50}
          onPress={() => {
            navigation?.navigate('RedeemPoints');
          }}
        />
        <Button
          btnTitle={localization?.myRewards?.manageReq}
          borderRadius={10}
          btnWidth="47%"
          btnHeight={50}
          onPress={() => {
            navigation?.navigate('ManageRequest');
          }}
        />
      </View>
      <Button
        btnTitle={`${localization?.myRewards?.avail}: ₹${
          walletData?.user_points || '0'
        }`}
        borderRadius={10}
        btnWidth="100%"
        btnHeight={50}
        customStyle={{marginVertical: 20}}
        disabled={true}
      />
      <Typography
        size={18}
        type={fonts?.Montserrat_Bold}
        style={{marginBottom: 5}}>
        {localization?.myRewards?.tranHis}
      </Typography>
      <Loader loading={loader} />

      <View style={{flex: 1}}>
        <FlatList
          data={walletHistory}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          renderItem={({item}) => {
            return (
              <View style={styles.itemContainer}>
                <View style={{flex: 1}}>
                  <Typography
                    color={colors?.ORANGE}
                    type={fonts?.Montserrat_SemiBold}>
                    {localization?.myRewards?.points}: {item?.point}
                  </Typography>

                  <Typography color={colors?.BLACK}>
                    {localization?.myRewards?.craeted}:{' '}
                    {moment(item?.created_at).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                  {item?.story ? (
                    <View style={[GlobalStyles?.common, {marginTop: 10}]}>
                      <Image
                        source={{uri: item?.story?.file}}
                        style={styles?.storyImage}
                      />
                      <View style={{flex: 1, marginHorizontal: 10}}>
                        <Typography
                          style={styles.storyTitle}
                          color={colors?.BLACK}>
                          {item?.story?.name}
                        </Typography>
                        <Typography
                          numberOfLines={2}
                          color={colors?.BLACK}
                          size={12}
                          type={fonts?.Montserrat_Medium}
                          style={styles.storyDescription}>
                          {stripHtml(item?.story?.story)}
                        </Typography>
                      </View>
                    </View>
                  ) : (
                    <Typography>{localization?.myRewards?.noStory}</Typography>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={() => {
            return !loader && <NoData />;
          }}
        />
      </View>
    </CommonView>
  );
};
export default MyRewards;

const getStyles = themeColors =>
  StyleSheet.create({
    itemContainer: {
      backgroundColor: '#fff',
      padding: 15,
      marginVertical: 8,
      marginHorizontal: 10,
      borderRadius: 10,
      elevation: 3, // shadow for android
      shadowColor: '#000', // shadow for ios
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    storyImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    storyTitle: {
      fontWeight: '600',
      fontSize: 14,
      color: '#222',
    },
  });
