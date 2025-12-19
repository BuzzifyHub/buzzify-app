import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import Button from '../../Components/Hoc/Button';
import CommonInput from '../../Components/Hoc/CommonInput';
import CommonView from '../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../Components/Hoc/Header';
import {FULL_HEIGHT} from '../../Constants/Layout';
import localization from '../../Constants/localization';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validators';
import {FORGOT_PASSWORD} from '../../Backend/ApiRoutes';
import {POST_FORMDATA} from '../../Backend/Backend';
import GlobalStyles from '../../Constants/GlobalStyles';

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSignUp = () => {
    const error = {
      email: validators.checkEmail(localization?.myProfile?.email, email),
    };

    setErrors(error);

    if (isValidForm(error)) {
      ForgotPasswordApi();
    }
  };

  const ForgotPasswordApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('email', email),
      POST_FORMDATA(
        FORGOT_PASSWORD,
        formdata,
        async success => {
          setLoading(false);
          if (success?.status == true) {
            ToastMsg(success?.message);
            setEmail('');
            navigation?.navigate('Otp', {email: email});
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
    <CommonView customStyle={{paddingTop: 15}}>
      <Header
        title={localization?.signIn?.forgotpass}
        downTitle={true}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />

      <View style={GlobalStyles?.forgetView}>
        <View style={{marginTop: 20}}>
          <CommonInput
            placeholder={localization?.myProfile?.email}
            value={email}
            onChangeText={e => {
              setEmail(e);
            }}
            rightIconName={'emailIcon'}
            keyboardType={'email-address'}
            error={errors?.email}
          />
          <Button
            loading={loading}
            btnTitle={localization?.addFeedback?.submit}
            customStyle={{marginTop: FULL_HEIGHT * 0.04, marginBottom: 20}}
            onPress={() => {
              onSignUp();
            }}
          />
        </View>

        <Happiness style={{marginBottom: 50}} />
      </View>
    </CommonView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({});
