import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Typography from '../../Components/Hoc/Typography';
import Button from '../../Components/Hoc/Button';
import colors from '../../Constants/colors';
import CommonInput, {
  CommonContent,
  ErrorBox,
} from '../../Components/Hoc/CommonInput';
import CommonView from '../../Components/Hoc/CommonView';
import Header, { Happiness } from '../../Components/Hoc/Header';
import { FULL_HEIGHT } from '../../Constants/Layout';
import images from '../../Constants/images';
import localization from '../../Constants/localization';
import { isValidForm } from '../../Backend/Utility';
import { validators } from '../../Backend/Validators';
import { SIGN_UP } from '../../Backend/ApiRoutes';
import { POST_FORMDATA } from '../../Backend/Backend';
import DeviceInfo from 'react-native-device-info';
import { getFcmToken } from '../../PushNotification/Notificaton';
import GlobalStyles from '../../Constants/GlobalStyles';

const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [check, setcheck] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emptyState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setMobile('');
    setcheck(false);
  };
  const onSignUp = () => {
    const error = {
      name: validators.checkRequireAndTrim(localization?.myProfile?.name, name),
      email: validators.checkEmail(localization?.myProfile?.email, email),
      password: validators.checkPassword(
        localization?.signIn?.passwoed,
        password,
      ),
      check: !check ? localization?.signUp?.accept : '',
    };
    if (mobile && mobile.trim()) {
      error.mobile = validators.checkNumber(
        localization?.myProfile?.mobile,
        mobile,
      );
    }

    setErrors(error);

    if (isValidForm(error)) {
      SignUpApi();
    }
  };

  const SignUpApi = async () => {
    setLoading(true);

    let deviceId = await DeviceInfo.getUniqueId();
    const fcmToken = await getFcmToken();
    const formdata = new FormData();
    formdata.append('name', name),
      formdata.append('email', email),
      formdata.append('password', password),
      formdata.append('phone', mobile ? mobile : '');
    formdata.append('player_id', deviceId);
    POST_FORMDATA(
      SIGN_UP,
      formdata,
      async success => {
        setLoading(false);
        if (success?.status == true) {
          emptyState();
          navigation?.navigate('Otp', { email: email, type: 'SignUp' });
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
        title={localization?.signIn?.signUp}
        downTitle={true}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0} // Adjust offset as needed
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={GlobalStyles?.mainView}>
            <View style={{ marginTop: 20 }}>
              <CommonInput
                placeholder={localization?.myProfile?.name}
                value={name}
                onChangeText={n => {
                  setName(n);
                }}
                error={errors?.name}
              />
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
              <CommonInput
                placeholder={localization?.addFeedback?.phnNum}
                value={mobile}
                onChangeText={m => {
                  setMobile(m);
                }}
                rightIconName="callIcon"
                keyboardType={'number-pad'}
                error={errors.mobile}
              />
              <CommonInput
                placeholder={localization?.signIn?.passwoed}
                multiline={false}
                passwordType={true}
                value={password}
                secureTextEntry={true}
                rightIconName="passowrdIcon1"
                onChangeText={p => {
                  setPassword(p);
                }}
                error={errors?.password}
              />
              <View style={{ marginTop: 20 }}>
                <View
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setcheck(!check);
                    }}
                  >
                    <Image
                      source={check ? images?.Checked : images?.Unchecked}
                      style={{
                        height: check ? 20 : 18,
                        width: check ? 20 : 18,
                        tintColor: colors?.ORANGE,
                        marginRight: 7,
                      }}
                    ></Image>
                  </TouchableOpacity>
                  {/* <View style={{width: '93%', backgroundColor: 'red'}}>
                <Typography style={{marginLeft: 7}}>
                  {localization?.signUp?.plsAccept}{' '}
                  <Typography color={colors?.ORANGE}>
                    {localization?.signUp?.terms}{' '}
                  </Typography>
                  <Typography>{localization?.signUp?.and} </Typography>
                  <Typography color={colors?.ORANGE}>
                    {localization?.signUp?.privacy}
                  </Typography>
                </Typography>
              </View> */}

                  <View
                    style={{
                      width: '90%',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography style={{}}>
                      {localization?.signUp?.plsAccept}{' '}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => {
                        navigation?.navigate('CmsPages', { cmsId: '7' });
                      }}
                    >
                      <Typography color={colors?.ORANGE}>
                        {localization?.signUp?.terms}{' '}
                      </Typography>
                    </TouchableOpacity>
                    <Typography>{localization?.signUp?.and} </Typography>
                    <TouchableOpacity
                      onPress={() => {
                        navigation?.navigate('CmsPages', { cmsId: '3' });
                      }}
                    >
                      <Typography color={colors?.ORANGE}>
                        {localization?.signUp?.privacy}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>
                {errors?.check && <ErrorBox error={errors?.check} />}
              </View>
              <Button
                loading={loading}
                btnTitle={localization?.signIn?.signUp}
                customStyle={{
                  marginTop: FULL_HEIGHT * 0.04,
                  marginBottom: 20,
                }}
                onPress={() => {
                  onSignUp();
                }}
              />
              <CommonContent
                onPressSubTitle={() => {
                  navigation?.navigate('SignIn');
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Happiness style={{ marginVertical: 40 }} />
    </CommonView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
