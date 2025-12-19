import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonView from '../../Components/Hoc/CommonView';
import Header from '../../Components/Hoc/Header';
import Typography from '../../Components/Hoc/Typography';
import images from '../../Constants/images';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import {useTheme} from '../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import localization from '../../Constants/localization';
import {NOTIFICATION} from '../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import {GET} from '../../Backend/Backend';
import moment from 'moment';
import Loading from '../../Components/Hoc/Loading';
import GlobalStyles from '../../Constants/GlobalStyles';

const Notifications = ({navigation}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);

  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const focus = useIsFocused();
  useEffect(() => {
    GetNotification({path: 'page=1'});
    setLoader(true);
    setCurrentPage(1);
  }, [focus]);

  const GetNotification = item => {
    GET(
      `${NOTIFICATION}?${item?.path}`,
      async success => {
        setLoader(false);
        setScreenLoading(false);
        setRefresh(false);
        setTotalPages(success?.data?.last_page);
        if (item?.path === 'page=1') {
          setData(success?.data?.data);
        } else {
          setData(prev => [...prev, ...success?.data?.data]);
        }
      },
      error => {
        setLoader(false);
        setScreenLoading(false);
        setRefresh(false);
      },
      fail => {
        setRefresh(false);
        setScreenLoading(false);
        setLoader(false);
      },
    );
  };
  const loadMoreData = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      GetNotification({
        path: `page=${nextPage}`,
      });
      setScreenLoading(true);
    }
  };

  const NotificationItem = ({item}) => (
    <TouchableOpacity
      disabled={item?.post_id ? false : true}
      style={styles?.mainContainer}
      onPress={() => {
        navigation?.navigate('MyFeed', {featureId: item?.post_id});
      }}>
      <Typography textAlign={'right'}>
        {moment(item?.created_at).format('DD-MM-YYYY')}
      </Typography>

      <View style={[GlobalStyles?.common, {marginTop: 10}]}>
        <Image
          source={images?.MainLogo}
          style={{height: 40, width: 40, marginRight: 5}}
        />
        <View style={{width: '85%'}}>
          <Typography type={fonts?.Montserrat_SemiBold}>
            {item?.title}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={{flex: 1}}>
      <CommonView customStyle={{}}>
        <Header
          title={localization?.settings?.notifi}
          onPressBack={() => {
            navigation.navigate('DrawerNavigation');
          }}
        />
        <FlatList
          data={data}
          removeClippedSubviews={false}
          keyExtractor={item => item.id}
          renderItem={NotificationItem}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          pagingEnabled
          contentContainerStyle={{gap: 10, margmarnTop: 40, paddingBottom: 20}}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              enabled={true}
              colors={[colors?.ORANGE]}
              onRefresh={() => {
                setRefresh(true);
                GetNotification({
                  path: 'page=1',
                });
              }}
            />
          }
        />
        {screenLoading && (
          <ActivityIndicator
            size={'small'}
            color={colors?.ORANGE}
            style={{justifyContent: 'center', alignItems: 'center', height: 75}}
          />
        )}
      </CommonView>

      <Loading visible={loader} />
    </View>
  );
};

export default Notifications;

const getStyles = themeColors =>
  StyleSheet.create({
    mainContainer: {
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 10,
      shadowColor: themeColors?.background,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginHorizontal: 3,
      paddingBottom: 20,
      borderColor: themeColors?.card,
      borderWidth: 1,
      backgroundColor: themeColors?.background,
      marginBottom: 5,
    },
  });
