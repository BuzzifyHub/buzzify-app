import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Button from '../../Components/Hoc/Button';
import CommonInput from '../../Components/Hoc/CommonInput';
import CommonView from '../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../Components/Hoc/Header';
import {FULL_HEIGHT} from '../../Constants/Layout';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validators';
import {RESET_PASSWORD} from '../../Backend/ApiRoutes';
import {POST_FORMDATA} from '../../Backend/Backend';
import localization from '../../Constants/localization';
import GlobalStyles from '../../Constants/GlobalStyles';

const ResetPassword = ({navigation, route}) => {
  const {email} = route?.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = () => {
    const error = {
      password: validators.checkPassword(
        localization?.signIn?.passwoed,
        password,
      ),
      confirmPassword: validators.checkMatch(
        localization?.signIn?.passwoed,
        password,
        localization?.signIn?.conPass,
        confirmPassword,
      ),
    };

    setErrors(error);

    if (isValidForm(error)) {
      ResetPasswordApi();
    }
  };

  const ResetPasswordApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('email', email),
      formdata.append('password', password),
      POST_FORMDATA(
        RESET_PASSWORD,
        formdata,
        async success => {
          setLoading(false);
          if (success?.status) {
            ToastMsg(success?.message);
            navigation?.navigate('SignIn');
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
    <CommonView>
      <Header
        title={'Reset Password'}
        downTitle={true}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />

      <View style={GlobalStyles?.forgetView}>
        <View style={{marginTop: 20}}>
          <CommonInput
            placeholder={'Password'}
            value={password}
            onChangeText={e => {
              setPassword(e);
            }}
            passwordType={true}
            rightIconName={'passowrdIcon1'}
            error={errors?.password}
            secureTextEntry={true}
          />
          <CommonInput
            placeholder={'Confirm Password'}
            value={confirmPassword}
            onChangeText={e => {
              setConfirmPassword(e);
            }}
            passwordType={true}
            rightIconName={'passowrdIcon1'}
            error={errors?.confirmPassword}
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

export default ResetPassword;

const styles = StyleSheet.create({});
