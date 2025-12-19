import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header, { Happiness } from '../../../Components/Hoc/Header';
import images from '../../../Constants/images';
import { FULL_HEIGHT, FULL_WIDTH } from '../../../Constants/Layout';
import colors from '../../../Constants/colors';
import Button from '../../../Components/Hoc/Button';
import localization from '../../../Constants/localization';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { lang, showAboutUs } from '../../../Redux/Action';
import {
  getSavedFcmToken,
  setAboutUsSeen,
  setLanguage,
} from '../../../Backend/AsyncStorage';
import { useIsFocused } from '@react-navigation/native';
import { ADD_DEVICE_TOKEN, CMS_PAGES } from '../../../Backend/ApiRoutes';
import { GET, POST_FORMDATA } from '../../../Backend/Backend';
import RenderHTML from 'react-native-render-html';
import { useTheme } from '../../../Components/Hoc/ThemeContext';
import { darkTheme, lightTheme } from '../../../Constants/Color';
import GlobalStyles from '../../../Constants/GlobalStyles';
import DeviceInfo from 'react-native-device-info';

const AboutUs = ({ navigation }) => {
  const focus = useIsFocused();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const langCode = useSelector(store => store.lang);
  const [lan, setLang] = useState(langCode);
  const [changeLang, setChangeLang] = useState(langCode);
  const [data, setData] = useState([]);

  useEffect(() => {
    CmsApi();
  }, [focus, langCode]);
  // useEffect(() => {
  //   AddDeviceToken(); //added to send device token on about us screen
  // }, [focus]);

  const CmsApi = () => {
    GET(
      CMS_PAGES + `${langCode}`,
      async success => {
        const list = success.data?.list || [];
        const selectedItem = list.find(item => item?.cms_id === '2');
        setData(selectedItem);
      },
      error => {},
      fail => {},
    );
  };

  const changeLanguage = async lng => {
    ToastMsg(
      lng == 'en'
        ? 'Your language has been selected'
        : 'आपकी भाषा चुन ली गई है',
    );
    dispatch(lang(lng));
    i18n.changeLanguage(lng);
    setChangeLang(lng);
    setLanguage(lng);
    localization?.setLanguage(lng);
    setLang(lng);
  };

  const { resolvedTheme } = useTheme();

  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <CommonView>
      <Header
        title={localization?.settings?.aboutUs}
        downTitle={true}
        backArrow={false}
        subTitle={true}
        customMargin={FULL_HEIGHT * 0.04}
        txtSize={30}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{}}>
          <Image source={images?.AboutUs} style={styles?.mainImg} />
          <RenderHTML
            contentWidth={FULL_WIDTH}
            source={{ html: data?.description }}
            tagsStyles={{
              p: { color: themeColors?.iconColor },
            }}
          />
        </View>
        <View style={[GlobalStyles?.mainView, { marginTop: 20 }]}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={GlobalStyles?.commonStyle}>
              <Button
                btnTitle="English"
                borderRadius={10}
                btnWidth="45%"
                onPress={() => {
                  changeLanguage('en');
                }}
                txtColor={lan == 'en' ? colors?.WHITE : colors?.ORANGE}
                customStyle={{
                  backgroundColor: lan == 'en' ? colors?.ORANGE : colors?.WHITE,
                  borderColor: lan == 'en' && colors?.BORDER_GREY,
                  borderWidth: 1,
                }}
              />
              <Button
                btnTitle="हिंदी"
                borderRadius={10}
                btnWidth="45%"
                onPress={() => {
                  changeLanguage('hi');
                }}
                txtColor={lan == 'hi' ? colors?.WHITE : colors?.ORANGE}
                customStyle={{
                  backgroundColor: lan == 'hi' ? colors?.ORANGE : colors?.WHITE,
                  borderColor: lan == 'hi' && colors?.BORDER_GREY,
                  borderWidth: 1,
                }}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await setAboutUsSeen();
              dispatch(showAboutUs(false));
              navigation?.navigate('SaveInterests');
            }}
            style={{ width: 44, marginTop: 40, alignSelf: 'flex-end' }}
          >
            <Image
              source={images?.Arrow}
              style={{
                height: 44,
                width: 44,
                transform: [{ rotate: '180deg' }],
              }}
            />
          </TouchableOpacity>
        </View>
        <Happiness style={{ marginVertical: 50 }} />
      </ScrollView>
    </CommonView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  mainImg: {
    height: FULL_HEIGHT * 0.2,
    width: FULL_WIDTH * 0.92,
    resizeMode: 'cover',
    borderRadius: 20,
    marginVertical: 40,
  },
});
