import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import CommonView from '../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../Components/Hoc/Header';
import colors from '../../Constants/colors';
import Button from '../../Components/Hoc/Button';
import {useTranslation} from 'react-i18next';
import localization from '../../Constants/localization';
import {useDispatch, useSelector} from 'react-redux';
import {lang} from '../../Redux/Action';
import {setLanguage} from '../../Backend/AsyncStorage';
import GlobalStyles from '../../Constants/GlobalStyles';

const ChooseLang = ({navigation}) => {
  const dispatch = useDispatch();
  const langCode = useSelector(store => store.lang);
  const [lan, setLang] = useState(langCode);
  const {t, i18n} = useTranslation();

  const changeLanguage = lng => {
    ToastMsg(
      lng == 'en'
        ? 'Your language has been selected'
        : 'आपकी भाषा चुन ली गई है',
    );
    dispatch(lang(lng));
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localization?.setLanguage(lng);
    setLang(lng);
  };
  return (
    <CommonView customStyle={{}}>
      <Header
        downTitle={true}
        title={localization?.chooseLng?.title}
        onPressBack={() => {
          navigation?.goBack();
        }}
        titleWidth={langCode == 'en' ? '60%' : '40%'}
      />

      <View style={GlobalStyles?.mainView}>
        <View style={{flex: 1, justifyContent: 'center'}}>
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
                borderColor: colors?.BORDER_GREY,
                borderWidth: 1,
              }}
            />
            <Button
              btnTitle="हिंदी"
              borderRadius={10}
              btnWidth="45%"
              txtColor={lan == 'hi' ? colors?.WHITE : colors?.ORANGE}
              customStyle={{
                backgroundColor: lan == 'hi' ? colors?.ORANGE : colors?.WHITE,
                borderColor: colors?.BORDER_GREY,
                borderWidth: 1,
              }}
              onPress={() => {
                changeLanguage('hi');
              }}
            />
          </View>
        </View>
        <Happiness style={{marginBottom: 50}} />
      </View>
    </CommonView>
  );
};

export default ChooseLang;

const styles = StyleSheet.create({});
