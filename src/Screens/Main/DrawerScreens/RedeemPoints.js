import {FlatList, Image, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header from '../../../Components/Hoc/Header';
import Button from '../../../Components/Hoc/Button';
import Typography from '../../../Components/Hoc/Typography';
import fonts from '../../../Constants/fonts';
import colors from '../../../Constants/colors';
import {PRODUCT_LIST, PRODUCT_REQUEST} from '../../../Backend/ApiRoutes';
import {GET, POST_FORMDATA} from '../../../Backend/Backend';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import Loading from '../../../Components/Hoc/Loading';
import localization from '../../../Constants/localization';

const RedeemPoints = ({navigation}) => {
  const focus = useIsFocused();
  const userDetails = useSelector(store => store.user_details);
  const [loader, setLoader] = useState(false);
  const [reactRewards, setReactRewards] = useState([]);
  const [loadingItemId, setLoadingItemId] = useState(null);

  useEffect(() => {
    GetRedeem();
  }, [focus]);

  const GetRedeem = () => {
    GET(
      PRODUCT_LIST,
      async success => {
        setLoader(false);
        setReactRewards(success?.data?.data);
      },
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };

  const RedeemPoints = id => {
    setLoadingItemId(id);
    const formdata = new FormData();
    formdata.append('user_id', userDetails?.id),
      formdata.append('product_id', id),
      POST_FORMDATA(
        PRODUCT_REQUEST,
        formdata,
        async success => {
          setLoadingItemId(null);
          ToastMsg(success?.message);
        },
        error => {
          setLoadingItemId(null);
        },
        fail => {
          setLoadingItemId(null);
        },
      );
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <Image source={{uri: item?.img}} style={styles?.img} />
        <Typography type={fonts?.Montserrat_Bold} color={colors?.LIGHT_GREY}>
          {item?.name}
        </Typography>
        <Typography
          type={fonts?.Montserrat_Bold}
          size={12}
          color={colors?.LIGHT_GREY}>
          {localization?.myRewards?.pointsReq}: {item.point}
        </Typography>

        <Button
          btnWidth="100%"
          btnHeight={40}
          btnTitle={localization?.myRewards?.reddem}
          customStyle={{marginVertical: 10, marginTop: 15}}
          borderRadius={15}
          onPress={() => {
            RedeemPoints(item?.id);
          }}
          loading={loadingItemId === item?.id}
        />
      </View>
    );
  };
  return (
    <CommonView>
      <Loading loading={loader} />
      <Header
        title={localization?.myRewards?.redeem}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />
      <FlatList
        data={reactRewards}
        removeClippedSubviews={false}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
      />
    </CommonView>
  );
};

export default RedeemPoints;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    width: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  img: {
    height: 60,
    width: 60,
    backgroundColor: 'lightgray',
    marginBottom: 10,
  },
});
