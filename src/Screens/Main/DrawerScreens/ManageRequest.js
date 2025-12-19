import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header from '../../../Components/Hoc/Header';
import {MANAGE_REQUEST} from '../../../Backend/ApiRoutes';
import {GET} from '../../../Backend/Backend';
import colors from '../../../Constants/colors';
import fonts from '../../../Constants/fonts';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import Button from '../../../Components/Hoc/Button';
import TypographY from '../../../Components/Hoc/Typography';
import localization from '../../../Constants/localization';
import {NoData} from '../../../Components/Hoc/Loader';
import images from '../../../Constants/images';
import Clipboard from '@react-native-clipboard/clipboard';
import GlobalStyles from '../../../Constants/GlobalStyles';

const ManageRequest = ({navigation}) => {
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const focus = useIsFocused();
  const userDetails = useSelector(store => store.user_details);
  useEffect(() => {
    GetListRequest();
  }, [focus]);

  const GetListRequest = () => {
    setLoader(true);
    GET(
      MANAGE_REQUEST + '?user_id=' + userDetails?.id,
      async success => {
        setLoader(false);
        setData(success?.data?.data);
      },
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image source={{uri: item?.product?.img}} style={styles?.mainImg} />
      <TypographY
        type={fonts?.Montserrat_Bold}
        color={colors?.LIGHT_GREY}
        numberOfLines={1}>
        {item?.product?.name}
      </TypographY>
      {item?.status == '1' && (
        <View style={GlobalStyles?.common}>
          <TypographY
            type={fonts?.Montserrat_Bold}
            size={12}
            color={colors?.LIGHT_GREY}
            textAlign={'center'}>
            {localization?.AddStory?.voucher} {item?.product_code}
          </TypographY>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(item?.product_code);
              ToastMsg(localization?.AddStory?.copyTo);
            }}>
            <Image source={images?.Copy} style={styles?.copyImg} />
          </TouchableOpacity>
        </View>
      )}
      <TypographY
        type={fonts?.Montserrat_Bold}
        size={12}
        textAlign={'center'}
        color={colors?.LIGHT_GREY}>
        {localization?.myRewards?.pointsRed}: {item?.product?.point}
      </TypographY>

      <Button
        btnWidth="100%"
        btnHeight={40}
        disabled={true}
        btnTitle={
          item?.status == '0'
            ? localization?.myRewards?.pending
            : item?.status == '1'
            ? localization?.myRewards?.accept
            : localization?.myRewards?.rejected
        }
        customStyle={{
          marginVertical: 10,
          marginTop: 10,
          backgroundColor:
            item?.status == '0'
              ? '#dd99ff'
              : item?.status == '1'
              ? 'green'
              : 'red',
        }}
        borderRadius={15}
      />
    </View>
  );
  return (
    <CommonView>
      <Header
        title={localization?.myRewards?.manageReq}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => {
          return !loader && <NoData />;
        }}
      />
    </CommonView>
  );
};

export default ManageRequest;

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
  mainImg: {
    height: 60,
    width: 60,
    backgroundColor: 'lightgray',
    marginBottom: 10,
  },
  copyImg: {
    height: 18,
    width: 20,
    resizeMode: 'contain',
    tintColor: colors?.ORANGE,
    marginRight: 5,
  },
});
