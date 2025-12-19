import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import Typography from '../../Components/Hoc/Typography';
import Button from '../../Components/Hoc/Button';
import colors from '../../Constants/colors';
import CommonView from '../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../Components/Hoc/Header';
import {FULL_HEIGHT} from '../../Constants/Layout';
import {useDispatch} from 'react-redux';
import {isValidForm} from '../../Backend/Utility';
import {validators} from '../../Backend/Validators';
import {OTP_VERIFY, RESEND_OTP} from '../../Backend/ApiRoutes';
import {POST_FORMDATA} from '../../Backend/Backend';
import CommonInput, {ErrorBox} from '../../Components/Hoc/CommonInput';
import {isAuth, isUserType, user_details} from '../../Redux/Action';
import {useTheme} from '../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import localization from '../../Constants/localization';
import fonts from '../../Constants/fonts';
import BackgroundTimer from 'react-native-background-timer';

const CELL_COUNT = 4;

const Otp = ({navigation, route}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const dispatch = useDispatch();
  const emailAdd = route?.params?.email;
  const type = route?.params?.type;

  const [error, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    let intervalId = null;

    if (resendDisabled) {
      intervalId = BackgroundTimer.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            BackgroundTimer.clearInterval(intervalId);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId !== null) {
        BackgroundTimer.clearInterval(intervalId);
      }
    };
  }, [resendDisabled]);

  const formatTime = seconds => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const onSubmit = () => {
    const error = {
      otp: validators.checkOtp(localization?.myProfile?.otp, value),
    };

    setErrors(error);

    if (isValidForm(error)) {
      VerifyOtpApi();
    }
  };

  const VerifyOtpApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('otp', value);
    formdata.append('email', emailAdd);

    POST_FORMDATA(
      OTP_VERIFY,
      formdata,
      async success => {
        setLoading(false);
        if (success?.status == true) {
          ToastMsg(success?.message);
          if (type === 'SignUp') {
            dispatch(isAuth(true));
            dispatch(isUserType('customer'));
            dispatch(user_details(success?.data));
          } else {
            navigation?.navigate('ResetPassword', {email: emailAdd});
          }
        } else {
          ToastMsg(success?.message);
        }
      },
      error => setLoading(false),
      fail => setLoading(false),
    );
  };
  const Resend_Otp = () => {
    setResendLoading(true);
    const formdata = new FormData();
    formdata.append('email', emailAdd);

    POST_FORMDATA(
      RESEND_OTP,
      formdata,
      async success => {
        setResendLoading(false);
        ToastMsg(success?.message);
        setSecondsRemaining(300);
        setResendDisabled(true);
        setValue('');
        setErrors({});
      },
      error => setResendLoading(false),
      fail => setResendLoading(false),
    );
  };

  return (
    <CommonView>
      <Header onPressBack={() => navigation?.goBack()} />
      <View style={{flex: 0.99, justifyContent: 'space-between'}}>
        <View style={{marginTop: 20}}>
          <Typography size={25}>
            {localization?.myProfile?.verification}
          </Typography>
          <Typography>
            {localization?.myProfile?.wehave}{' '}
            <Typography color={colors?.ORANGE}>{emailAdd}</Typography>
          </Typography>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                <Typography size={20}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Typography>
              </View>
            )}
          />
          {error?.otp && <ErrorBox error={error?.otp} />}

          <Button
            loading={loading}
            btnTitle={localization?.myProfile?.verify}
            customStyle={{marginTop: FULL_HEIGHT * 0.04, marginBottom: 20}}
            onPress={onSubmit}
          />

          <View style={{alignItems: 'center', marginTop: 20}}>
            {resendDisabled ? (
              <Typography color={colors.GREY}>
                {formatTime(secondsRemaining)}
              </Typography>
            ) : resendLoading ? (
              <Typography color={colors?.ORANGE} size={16}>
                {localization?.myProfile?.sending}
              </Typography>
            ) : (
              <TouchableOpacity onPress={Resend_Otp}>
                <Typography
                  color={colors?.ORANGE}
                  size={16}
                  type={fonts?.Montserrat_SemiBold}>
                  {localization?.myProfile?.resend}{' '}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Happiness style={{marginBottom: 50}} />
      </View>
    </CommonView>
  );
};

export default Otp;

const getStyles = themeColors =>
  StyleSheet.create({
    codeFieldRoot: {
      marginTop: 30,
      marginHorizontal: 20,
      justifyContent: 'center',
    },
    cell: {
      width: 50,
      height: 50,
      lineHeight: 48,
      fontSize: 20,
      borderWidth: 1,
      borderColor: themeColors?.lightGrey,
      textAlign: 'center',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    focusCell: {
      borderColor: colors.ORANGE,
    },
  });
