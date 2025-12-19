import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Button from '../../Components/Hoc/Button';
import CommonInput from '../../Components/Hoc/CommonInput';
import CommonView from '../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../Components/Hoc/Header';
import {FULL_HEIGHT} from '../../Constants/Layout';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validators';
import {CHANGE_PASSWORD} from '../../Backend/ApiRoutes';
import {POST_FORMDATA} from '../../Backend/Backend';
import {useSelector} from 'react-redux';
import localization from '../../Constants/localization';
import GlobalStyles from '../../Constants/GlobalStyles';

const ChangePassword = ({navigation}) => {
  const userDetails = useSelector(store => store.user_details);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    const error = {
      password: validators.checkPassword(
        localization?.signIn?.passwoed,
        password,
      ),
    };

    setErrors(error);

    if (isValidForm(error)) {
      ChangePasswordApi();
    }
  };

  const ChangePasswordApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('id', userDetails?.id);
    formdata.append('password', password);

    POST_FORMDATA(
      CHANGE_PASSWORD,
      formdata,
      async success => {
        setLoading(false);
        if (success?.status == true) {
          ToastMsg(success?.message);
          setPassword('');
          navigation.goBack();
        } else {
          ToastMsg(success?.message);
        }
      },
      error => {
        setLoading(false);
      },
      fail => {
        setLoading(false);
      },
    );
  };
  return (
    <CommonView customStyle={{}}>
      <Header
        title={localization?.myProfile?.changePassword}
        downTitle={true}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />
      <View style={GlobalStyles?.forgetView}>
        <View style={{marginTop: 20}}>
          <CommonInput
            placeholder={localization?.signIn?.passwoed}
            value={password}
            onChangeText={e => {
              setPassword(e);
            }}
            passwordType={true}
            rightIconName={'passowrdIcon1'}
            error={errors?.password}
            secureTextEntry={true}
          />

          <Button
            loading={loading}
            btnTitle={localization?.addFeedback?.submit}
            customStyle={{marginTop: FULL_HEIGHT * 0.04, marginBottom: 20}}
            onPress={() => {
              onSubmit();
            }}
          />
        </View>

        <Happiness style={{marginBottom: 50}} />
      </View>
    </CommonView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({});
