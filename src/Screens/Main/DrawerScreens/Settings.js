import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect} from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../../Components/Hoc/Header';
import Typography from '../../../Components/Hoc/Typography';
import fonts from '../../../Constants/fonts';
import SettingsCard from '../../../Components/UI/SettingsCard';
import {useTheme} from '../../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../../Constants/Color';
import {useFontSize} from '../../../Components/Hoc/FontSizeContext';
import colors from '../../../Constants/colors';
import localization from '../../../Constants/localization';
import {useDispatch, useSelector} from 'react-redux';
import {GET, POST_FORMDATA} from '../../../Backend/Backend';
import {
  GET_PROFILE,
  NOTIFICATION_TOGGLE,
  RESET_ALL_NEWS,
} from '../../../Backend/ApiRoutes';
import {user_details} from '../../../Redux/Action';
import {useIsFocused} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {getFcmToken} from '../../../PushNotification/Notificaton';

const Settings = ({navigation}) => {
  const dispatch = useDispatch();
  const focus = useIsFocused();
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const {fontSizeLevel, setFontSizeLevel} = useFontSize();
  const data = [
    {title: localization?.settings?.joinUs, cmsId: '1'},
    {
      title: localization?.settings?.aboutUs,
      cmsId: '2',
    },
    {title: localization?.settings?.adver, cmsId: '4'},
    {title: localization?.settings?.con, cmsId: '5'},
    {
      title: localization?.settings?.Privacy,
      cmsId: '3',
    },
  ];
  const langCode = useSelector(store => store.lang);
  const UserType = useSelector(store => store.isUserType);
  const userDetails = useSelector(store => store.user_details);

  useEffect(() => {
    if (UserType !== 'guest') {
      GetProfile();
    }
  }, [focus, langCode]);

  const GetProfile = () => {
    const formdata = new FormData();
    formdata.append('id', userDetails?.id),
      POST_FORMDATA(
        GET_PROFILE,
        formdata,
        async success => {
          dispatch(user_details(success?.data));
        },
        error => {},
        fail => {},
      );
  };
  const Notifcation_Enable_Disable = async () => {
    GET(
      `${NOTIFICATION_TOGGLE}?user_id=${userDetails?.id}`,
      success => {
        GetProfile();
        ToastMsg(success?.message);
      },
      error => {},
      fail => {},
    );
  };
  const ResetAllNews = async () => {
    let deviceId = await DeviceInfo.getUniqueId();
    const fcmToken = await getFcmToken();
    GET(
      UserType == 'guest'
        ? `${RESET_ALL_NEWS}?device_id=${deviceId}`
        : `${RESET_ALL_NEWS}?user_id=${userDetails?.id}`,
      async success => {
        ToastMsg(success?.message);
      },
      error => {},
      fail => {},
    );
  };

  return (
    <CommonView>
      <Header
        title={localization?.settings?.title}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />
      <View style={{padding: 10, flex: 1}}>
        {UserType !== 'guest' && (
          <SettingsCard
            useToggle={true}
            disabled={true}
            onToggleChange={() => {
              Notifcation_Enable_Disable();
            }}
          />
        )}
        <SettingsCard
          iconName="flag"
          title={localization?.settings?.selctLang}
          subTitle={localization?.settings?.chhose}
          onPress={() => {
            navigation?.navigate('ChooseLang');
          }}
        />
        <TouchableOpacity
          onPress={() => {
            ResetAllNews();
          }}>
          <Typography
            style={{marginTop: 15}}
            size={18}
            type={fonts?.Montserrat_SemiBold}
            color={colors?.ORANGE}>
            {localization?.settings?.resetAll}
          </Typography>
        </TouchableOpacity>
        <View style={{marginTop: 15}}>
          <Typography
            size={18}
            type={fonts.Montserrat_Bold}
            style={{marginBottom: 12}}>
            {localization?.settings?.fontSize}
          </Typography>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: themeColors.card,
              borderRadius: 12,
              padding: 10,
              gap: 8,
            }}>
            {['small', 'default', 'large'].map(option => {
              const isActive = fontSizeLevel === option;
              const label = localization?.settings?.[option];
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setFontSizeLevel(option)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: isActive
                      ? themeColors.primary
                      : themeColors.surface,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: themeColors.border || '#ccc',
                    alignItems: 'center',
                  }}>
                  <Typography
                    size={14}
                    type={fonts.Montserrat_SemiBold}
                    style={{
                      color: isActive ? colors?.ORANGE : themeColors.text,
                      textTransform: 'capitalize',
                    }}>
                    {label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{marginTop: 20}}>
          {data?.map(item => {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation?.navigate('CmsPages', {cmsId: item?.cmsId});
                }}>
                <Typography
                  size={16}
                  type={fonts?.Montserrat_SemiBold}
                  style={{marginVertical: 5}}>
                  {item?.title}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
        <Happiness style={{marginTop: 80}} />
      </View>
    </CommonView>
  );
};

export default Settings;

const getStyles = themeColors => StyleSheet.create({});
