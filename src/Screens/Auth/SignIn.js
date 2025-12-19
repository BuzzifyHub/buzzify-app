import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
  Platform,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Typography from '../../Components/Hoc/Typography';
import { useDispatch } from 'react-redux';
import { isAuth, isUserType, user_details } from '../../Redux/Action';
import CommonInput, { CommonContent } from '../../Components/Hoc/CommonInput';
import Button from '../../Components/Hoc/Button';
import Header, { Happiness } from '../../Components/Hoc/Header';
import CommonView from '../../Components/Hoc/CommonView';
import { FULL_HEIGHT, FULL_WIDTH } from '../../Constants/Layout';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import images from '../../Constants/images';
import localization from '../../Constants/localization';
import { validators } from '../../Backend/Validators';
import { isValidForm } from '../../Backend/Utility';
import { POST_FORMDATA } from '../../Backend/Backend';
import { SIGN_IN, SOCIAL_MEDIA } from '../../Backend/ApiRoutes';
import { useIsFocused } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import GlobalStyles from '../../Constants/GlobalStyles';
import { AccessToken, LoginManager, Profile } from 'react-native-fbsdk-next';

const SignIn = ({ navigation }) => {
  const dispatch = useDispatch();
  const focus = useIsFocused();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);

  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (result.isCancelled) {
        console.log('User cancelled login');
      } else {
        const data = await AccessToken.getCurrentAccessToken();
        if (!data) {
          console.log('Something went wrong obtaining access token');
        } else {
          console.log('Access token:', data.accessToken.toString());
          const profile = await Profile.getCurrentProfile();
          console.log('User profile:', profile);
        }
      }
    } catch (error) {
      console.log('Login fail with error: ' + error);
    }
  };

  const onSignIn = () => {
    const error = {
      email: validators.checkEmail(localization?.myProfile?.email, email),
      password: validators.checkPassword(
        localization?.signIn?.passwoed,
        password,
      ),
    };
    setErrors(error);

    if (isValidForm(error)) {
      SignInApi();
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBackPress();
      return true;
    };

    let subscription;
    if (focus) {
      subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, backPressCount]);

  const handleBackPress = () => {
    if (backPressCount === 1) {
      BackHandler.exitApp();
    } else {
      ToastMsg(localization?.signIn?.pressBack);
      setBackPressCount(1);
      setTimeout(() => {
        setBackPressCount(0);
      }, 2000);
    }
  };

  const SignInApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('email', email),
      formdata.append('password', password),
      POST_FORMDATA(
        SIGN_IN,
        formdata,
        async success => {
          setLoading(false);
          if (success?.status == true) {
            setEmail('');
            setPassword('');
            ToastMsg(success?.message);
            dispatch(isUserType('customer')); //added
            dispatch(user_details(success?.data));
            dispatch(isAuth(true));
          } else {
            ToastMsg(success?.message);
            if (success?.data?.isVerified == false) {
              navigation?.navigate('Otp', { email: email, type: 'SignUp' });
            }
          }
        },
        error => {
          setLoading(false);
          ToastMsg(error?.message);
        },
        fail => {
          setLoading(false);
        },
      );
  };
  const SocialMedia = user => {
    console.log(user, 'USERRRRRRSR0000');

    const formdata = new FormData();
    formdata.append('login_from', user?.type),
      formdata.append(
        'name',
        user?.givenName || user?.fullName?.givenName || 'User',
      ),
      formdata.append('email', user?.email || 'unknown@appleid.com'),
      formdata.append('google_token', user?.id || ''),
      formdata.append('apple_token', user?.identityToken || '');

    console.log(formdata, ';;;;;;;;');

    POST_FORMDATA(
      SOCIAL_MEDIA,
      formdata,
      async success => {
        setLoading(false);
        if (success?.status == true) {
          setEmail('');
          setPassword('');
          ToastMsg(success?.message);
          dispatch(isUserType('customer')); //added
          dispatch(user_details(success?.data));
          dispatch(isAuth(true));
        } else {
          // ToastMsg(success?.message);
        }
      },
      error => {
        setLoading(false);
        // ToastMsg(error?.message);
      },
      fail => {
        setLoading(false);
      },
    );
  };
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.signOut(); //added for signout
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.type == 'cancelled') {
        return;
      }

      // return;
      SocialMedia({
        ...userInfo?.data?.user,
        type: 'google',
      });
    } catch (error) {
      console.log(error, 'EROR signInWithGoogle');

      // Ignore error silently — optionally track it in crash tool if needed
    }
  };

  const onAppleButtonPress = async () => {
    console.log('21212');

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      console.log(appleAuthRequestResponse);

      SocialMedia({
        ...appleAuthRequestResponse,
        type: 'apple',
      });
    } catch (e) {
      // Ignore error silently — optionally track it in crash tool if needed
    }
  };

  return (
    <CommonView>
      <Header
        title={localization?.signIn?.title}
        downTitle={true}
        backArrow={false}
        subTitle={true}
        subTitleText={localization?.signIn?.subTitle}
        customMargin={FULL_HEIGHT * 0.06}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0} // Adjust offset as needed
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={GlobalStyles?.mainView}>
            <View style={{ marginTop: 20 }}>
              <CommonInput
                placeholder={localization?.signIn?.email}
                value={email}
                onChangeText={e => {
                  setEmail(e);
                }}
                rightIconName={'emailIcon'}
                keyboardType={'email-address'}
                error={errors?.email}
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
              <TouchableOpacity
                style={{ alignSelf: 'center', marginVertical: 22 }}
                onPress={() => {
                  navigation?.navigate('ForgotPassword');
                }}
              >
                <Typography
                  style={{ textDecorationLine: 'underline' }}
                  type={fonts?.Montserrat_Medium}
                  color={colors?.ORANGE}
                >
                  {localization?.signIn?.forgotpass}
                </Typography>
              </TouchableOpacity>
              <Button
                loading={loading}
                btnTitle={localization?.signIn?.title}
                customStyle={{ marginBottom: 20 }}
                onPress={() => {
                  onSignIn();
                }}
              />
              <View style={{ marginTop: 10, marginBottom: 40 }}>
                <CommonContent
                  title={localization?.signIn?.newUser}
                  subTitle={localization?.signIn?.signUp}
                  onPressSubTitle={() => {
                    navigation?.navigate('SignUp');
                  }}
                />
                <CommonContent
                  title={localization?.signIn?.continues}
                  subTitle={localization?.signIn?.guest}
                  size={16}
                  onPressSubTitle={() => {
                    dispatch(isUserType('guest')); //added
                    dispatch(isAuth(true));
                  }}
                />
              </View>
              <View style={{ alignItems: 'center' }}>
                {Platform.OS == 'ios' && (
                  <TouchableOpacity
                    onPress={() => {
                      onAppleButtonPress();
                    }}
                    style={styles?.imgBg}
                  >
                    <Image
                      source={images?.Apple}
                      style={{
                        height: 24,
                        width: 24,
                        marginRight: 9,
                        marginLeft: 22,
                      }}
                    />
                    <Typography
                      size={15}
                      type={fonts?.Montserrat_Bold}
                      color={colors?.BLACK}
                      style={{ marginTop: 4 }}
                    >
                      Sign in with Apple
                    </Typography>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => {
                    signInWithGoogle();
                  }}
                >
                  <Image
                    source={images?.Google}
                    style={[styles?.imgstyle, { height: 71 }]}
                  />
                </TouchableOpacity>
                {/* <TouchableOpacity
                onPress={() => {
                  handleFacebookLogin();
                }}>
                <Image source={images?.Facebook} style={styles?.imgstyle} />
              </TouchableOpacity> */}
              </View>
            </View>

            <Happiness style={{ marginVertical: 50 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CommonView>
  );
};

export default SignIn;
const styles = StyleSheet.create({
  imgBg: {
    backgroundColor: colors?.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderRadius: 10,
    width: FULL_WIDTH * 0.64,
    elevation: 3,
    shadowColor: colors?.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 5,
    marginBottom: 12,
  },
  imgstyle: {
    width: FULL_WIDTH,
    height: 75,
    resizeMode: 'contain',
  },
});
