import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import { FULL_HEIGHT, FULL_WIDTH } from '../../../Constants/Layout';
import images from '../../../Constants/images';
import Typography from '../../../Components/Hoc/Typography';
import fonts from '../../../Constants/fonts';
import colors from '../../../Constants/colors';
import localization from '../../../Constants/localization';
import { MYSTORIES } from '../../../Backend/ApiRoutes';
import { useIsFocused } from '@react-navigation/native';
import { GET } from '../../../Backend/Backend';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Loading from '../../../Components/Hoc/Loading';
import { useTheme } from '../../../Components/Hoc/ThemeContext';
import { darkTheme, lightTheme } from '../../../Constants/Color';
import { NoData } from '../../../Components/Hoc/Loader';

const MyStories = ({ navigation }) => {
  const userDetails = useSelector(store => store.user_details);
  const focus = useIsFocused();
  const [data, setData] = useState([]);

  const [loader, setLoader] = useState(false);
  const { resolvedTheme } = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    MyStorie({ path: 'page=1' });
    setLoader(true);
  }, [focus]);
  // const stripHtml = html => {
  //   return html?.replace(/<[^>]*>?/gm, '') || '';
  // };
  function stripHtml(html) {
    if (!html) return '';
    // Remove all HTML tags
    let stripped = html.replace(/<[^>]+>/g, '');
    // Replace common HTML entities with their values
    stripped = stripped
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
    // Optionally remove extra whitespace
    return stripped.replace(/\s+/g, ' ').trim();
  }

  const MyStorie = item => {
    GET(
      MYSTORIES + `?user_id=${userDetails?.id}&${item?.path}`,
      async success => {
        setLoader(false);

        if (item?.path === 'page=1') {
          setData(success?.data?.data);
        } else {
          setData(prev => [...prev, ...success?.data?.data]);
        }
      },
      error => {
        setLoader(false);
      },
      fail => {
        setLoader(false);
      },
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <CommonView>
        <View
          style={{
            marginTop:
              Platform.OS == 'ios' ? FULL_HEIGHT * 0.012 : FULL_HEIGHT * 0.02,
            flexDirection: 'row',
            alignItems: 'center',
            width: FULL_WIDTH * 0.9,
            justifyContent: 'space-between',
            marginBottom: 17,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={images?.Arrow}
              style={{ height: 44, width: 44 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Typography
            size={24}
            textAlign={'center'}
            type={fonts?.Montserrat_Bold}
            color={colors?.ORANGE}
          >
            {localization?.customDrawer?.myStory}
          </Typography>

          <TouchableOpacity
            style={styles?.subview}
            onPress={() => {
              navigation?.navigate('SubmitStory');
            }}
          >
            <Typography color={colors?.WHITE} textAlign={'center'}>
              {localization?.AddStory?.add}
            </Typography>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          removeClippedSubviews={false}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 70 }}
          ListEmptyComponent={() => {
            return !loader && <NoData />;
          }}
          renderItem={({ item, index }) => {
            console.log(item?.story, 'item?.story');

            return (
              <View
                style={[
                  styles?.mainView,
                  {
                    backgroundColor: themeColors?.background,
                  },
                ]}
              >
                <Image
                  source={{ uri: item?.file }}
                  style={styles?.imgStyle}
                  resizeMode="stretch"
                />

                <Typography
                  size={14}
                  // textAlign={'right'}
                  type={fonts?.Montserrat_Medium}
                  style={{}}
                >
                  {localization?.AddStory?.date +
                    ' ' +
                    moment(item?.created_at).format('DD-MMM-YYYY')}
                </Typography>
                <Typography
                  size={14}
                  // textAlign={'right'}
                  type={fonts?.Montserrat_Medium}
                  style={{ marginBottom: 10 }}
                >
                  {localization?.AddStory?.time +
                    ' ' +
                    moment(item?.created_at).format('hh:mm A')}
                </Typography>

                <View style={{}}>
                  <Text
                    numberOfLines={5}
                    ellipsizeMode="tail"
                    style={{
                      fontSize: 14,
                      lineHeight: 23,
                      color: themeColors?.iconColor,
                      textAlign: 'justify',
                    }}
                  >
                    {stripHtml(item?.story)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </CommonView>
      <Loading visible={loader} />
    </View>
  );
};

export default MyStories;

const styles = StyleSheet.create({
  subview: {
    backgroundColor: colors?.ORANGE,
    padding: 10,
    borderRadius: 120,
    width: 60,
    height: 42,
    justifyContent: 'center',
  },
  mainView: {
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: 'lightgray',
    paddingVertical: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 3,
    paddingBottom: 20,
  },
  imgStyle: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    backgroundColor: 'lightgray',
    borderRadius: 10,
  },
});
