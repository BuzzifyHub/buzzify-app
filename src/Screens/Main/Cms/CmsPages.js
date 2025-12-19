import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {GET} from '../../../Backend/Backend';
import {CMS_PAGES} from '../../../Backend/ApiRoutes';
import {useSelector} from 'react-redux';
import RenderHTML from 'react-native-render-html';
import {FULL_HEIGHT, FULL_WIDTH} from '../../../Constants/Layout';
import CommonView from '../../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../../Components/Hoc/Header';
import images from '../../../Constants/images';
import Button from '../../../Components/Hoc/Button';
import {useTheme} from '../../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../../Constants/Color';
import Loader from '../../../Components/Hoc/Loader';
import localization from '../../../Constants/localization';

const CmsPages = ({route, navigation}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const focus = useIsFocused();
  const {cmsId} = route.params;
  const langCode = useSelector(store => store.lang);
  const UserType = useSelector(store => store.isUserType);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    CmsApi();
  }, [focus]);

  const CmsApi = () => {
    setLoading(true);
    GET(
      CMS_PAGES + `${langCode}`,

      async success => {
        setLoading(false);
        const list = success.data?.list || [];
        const selectedItem = list.find(item => item?.cms_id === cmsId);
        setData(selectedItem);
      },
      error => {
        setLoading(false);
      },
      fail => {
        setLoading(false);
      },
    );
  };
  const customRenderers = {
    h3: ({TDefaultRenderer, ...props}) => {
      const phoneText = props?.tnode?.domNode?.children?.[0]?.data || '';
      const phoneNumber = `tel:${phoneText.replace(/[^+\d]/g, '')}`;

      return (
        <TouchableOpacity onPress={() => Linking.openURL(phoneNumber)}>
          <TDefaultRenderer {...props} />
        </TouchableOpacity>
      );
    },
    p: ({TDefaultRenderer, ...props}) => {
      const urlText = props?.tnode?.domNode?.children?.[0]?.data || '';
      const websiteUrl = urlText.startsWith('http')
        ? urlText
        : `https://${urlText}`;

      return (
        <TouchableOpacity onPress={() => Linking.openURL(websiteUrl)}>
          <TDefaultRenderer {...props} />
        </TouchableOpacity>
      );
    },
  };

  return (
    <CommonView customStyle={{}}>
      <Header
        title={data?.title}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <Loader loading={loading} />
      <ScrollView
        style={{padding: 10, paddingBottom: 30, paddingHorizontal: 0}}
        showsVerticalScrollIndicator={false}>
        <View style={{}}>
          <Image
            source={
              cmsId == '1'
                ? images?.JoinUs
                : cmsId == '2'
                ? images?.AboutUs
                : cmsId == '3'
                ? images?.BlackBanner
                : cmsId == '4'
                ? images?.Advertise
                : images?.ContactBanner
            }
            style={{
              height: cmsId == '3' ? 50 : FULL_HEIGHT * 0.22,
              width: cmsId == '3' ? 180 : FULL_WIDTH * 0.91,
              resizeMode: 'cover',
              borderRadius: 20,
              marginBottom: 40,
              resizeMode: 'contain',
            }}
          />
        </View>
        <RenderHTML
          contentWidth={FULL_WIDTH}
          source={{html: data?.description}}
          {...(cmsId === '5' && {renderers: customRenderers})}
          defaultTextProps={{
            style: {
              color: themeColors?.iconColor,
            },
          }}
        />

        {cmsId == '1' && UserType !== 'guest' ? (
          <Button
            btnTitle={localization?.Thanks?.submit}
            borderRadius={10}
            btnWidth="60%"
            txtSize={16}
            customStyle={{marginTop: 70}}
            onPress={() => {
              navigation?.navigate('SubmitStory');
            }}
          />
        ) : (
          <></>
        )}

        <Happiness style={{marginVertical: 80}} />
      </ScrollView>
    </CommonView>
  );
};

export default CmsPages;

const styles = StyleSheet.create({});
