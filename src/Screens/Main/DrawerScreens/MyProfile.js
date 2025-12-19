import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Header, {Happiness} from '../../../Components/Hoc/Header';
import Typography from '../../../Components/Hoc/Typography';
import fonts from '../../../Constants/fonts';
import {FULL_HEIGHT, FULL_WIDTH} from '../../../Constants/Layout';
import images from '../../../Constants/images';
import colors from '../../../Constants/colors';
import {ProfileInput} from '../../../Components/Hoc/CommonInput';
import Button from '../../../Components/Hoc/Button';
import UploadImg from '../../../Components/Hoc/UploadImg';
import {useTheme} from '../../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../../Constants/Color';
import {useNavigation} from '@react-navigation/native';
import localization from '../../../Constants/localization';
import CommonModal from '../../../Components/Hoc/CommonModal';
import {useDispatch, useSelector} from 'react-redux';
import {isAuth, isUserType, user_details} from '../../../Redux/Action';
import {POST_FORMDATA} from '../../../Backend/Backend';
import {
  DELETE_ACCOUNT,
  UPDTAE_PROFILE,
  UPDTAE_PROFILE_PICTURE,
} from '../../../Backend/ApiRoutes';
import {validators} from '../../../Backend/Validators';
import {isValidForm} from '../../../Backend/Utility';
import {SafeAreaView} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import {getFcmToken} from '../../../PushNotification/Notificaton';

const MyProfile = ({}) => {
  const dispatch = useDispatch();
  const userDetails = useSelector(store => store.user_details);

  const navigation = useNavigation();
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);

  const [imgUpload, setImgUpload] = useState(
    userDetails?.photo
      ? {
          uri: userDetails?.photo,
        }
      : {},
  );

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState(
    userDetails?.email ? userDetails?.email : '',
  );
  const [name, setName] = useState(userDetails?.name ? userDetails?.name : '');
  const [mobile, setMobile] = useState(
    userDetails?.phone ? userDetails?.phone : '',
  );
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const DeleteAccount = () => {
    const formdata = new FormData();
    formdata.append('id', userDetails?.id),
      POST_FORMDATA(
        DELETE_ACCOUNT,
        formdata,
        async success => {
          if (success?.status == true) {
            setShowModal(false);
            ToastMsg(success?.message);
            dispatch(isAuth(false));
            dispatch(isUserType(''));
            dispatch(user_details({}));
          } else {
            ToastMsg(success?.message);
          }
        },
        error => {
          ToastMsg(error?.message);
        },
        fail => {},
      );
  };
  const onUpdate = () => {
    const error = {
      name: validators.checkRequireAndTrim(localization?.myProfile?.name, name),
      email: validators.checkEmail('Email', email),
    };
    if (mobile && mobile.trim()) {
      error.mobile = validators.checkNumber('Mobile', mobile ? mobile : '');
    }
    setErrors(error);

    if (isValidForm(error)) {
      UpdateProfile();
    }
  };

  const UpdateProfile = async () => {
    let deviceId = await DeviceInfo.getUniqueId();
    const fcmToken = await getFcmToken();

    setLoading(true);
    const formdata = new FormData();
    formdata.append('id', userDetails?.id),
      formdata.append('name', name),
      formdata.append('email', email),
      formdata.append('phone', mobile ? mobile : ''),
      formdata.append('player_id', deviceId);

    POST_FORMDATA(
      UPDTAE_PROFILE,
      formdata,
      async success => {
        setLoading(false);
        if (success?.status == true) {
          dispatch(user_details(success?.data));
          ToastMsg(success?.message);
        } else {
          ToastMsg(success?.message);
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
  const UpdateProfllePicture = () => {
    const formdata = new FormData();
    formdata.append('photo', imgUpload), formdata.append('id', userDetails?.id);
    if (!imgUpload?.uri || imgUpload?.uri === userDetails?.photo) {
      return;
    }

    // return;
    POST_FORMDATA(
      UPDTAE_PROFILE_PICTURE,
      formdata,
      async success => {
        if (success?.status == true) {
          ToastMsg(success?.message);
          dispatch(user_details(success?.data));
        } else {
          ToastMsg(success?.message);
        }
      },
      error => {
        // ToastMsg(error?.message);
      },
      fail => {},
    );
  };
  return (
    <SafeAreaView style={styles?.topView}>
      <Header
        title={localization?.myProfile?.title}
        style={{
          marginHorizontal: 20,
          width: FULL_WIDTH * 0.9,
        }}
        onPressBack={() => {
          navigation.goBack();
        }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <Typography
          textAlign={'center'}
          size={20}
          type={fonts?.Montserrat_SemiBold}
          style={{
            marginTop: FULL_HEIGHT * 0.02,
            marginBottom: FULL_HEIGHT * 0.08,
          }}>
          {userDetails?.name}
        </Typography>

        <View style={{alignItems: 'center'}}>
          <Image source={images?.OrangeRect} style={{height: 70}} />
          <View style={styles?.main}>
            <Image
              source={imgUpload?.uri ? {uri: imgUpload?.uri} : images?.Buzzify}
              style={{
                height: 110,
                width: 110,
                borderRadius: imgUpload?.uri ? 55 : 0,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setShow(true);
              }}
              style={{position: 'absolute', bottom: 0, right: -7}}>
              <Image
                source={images?.EditIcon}
                style={{height: 55, width: 55}}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{padding: 25, marginTop: 30}}>
          <ProfileInput
            label={localization?.myProfile?.name}
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <ProfileInput
            label={localization?.myProfile?.email}
            value={email}
            onChangeText={setEmail}
            error={errors?.email}
            editable={false}
          />
          <ProfileInput
            label={localization?.myProfile?.mobile}
            value={mobile}
            onChangeText={setMobile}
            error={errors.mobile}
            maxLength={10}
          />
          <Button
            btnTitle={localization?.myProfile?.btnTitle}
            borderRadius={10}
            btnWidth="100%"
            txtSize={18}
            customStyle={{marginTop: FULL_HEIGHT * 0.05}}
            onPress={() => {
              onUpdate();
              UpdateProfllePicture();
            }}
            loading={loading}
          />
          <Button
            btnTitle={localization?.myProfile?.changePassword}
            borderRadius={10}
            btnWidth="100%"
            txtSize={18}
            customStyle={{marginVertical: 15}}
            onPress={() => {
              navigation?.navigate('ChangePassword');
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setShowModal(true);
            }}>
            <Typography
              size={17}
              textAlign={'center'}
              type={fonts?.Montserrat_SemiBold}
              color={colors?.RED}
              style={{
                textDecorationLine: 'underline',
                marginBottom: FULL_HEIGHT * 0.08,
              }}>
              {localization?.myProfile?.delAccount}
            </Typography>
          </TouchableOpacity>
          <Happiness />
        </View>
        <UploadImg
          selected={(i, type) => {
            const image = Array.isArray(i) ? i[0] : i;
            const selectedImage = {
              uri: image?.path || '',
              name: image?.filename || 'image.jpg',
              type: image?.mime || 'image/jpeg',
            };
            setImgUpload(selectedImage);
          }}
          showModal={show}
          close={() => {
            setShow(false);
          }}
        />

        <CommonModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          title="Delete Account"
          subtitle="Are you sure you want to delete your account?"
          onConfirm={() => {
            DeleteAccount();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyProfile;

const getStyles = themeColors =>
  StyleSheet.create({
    topView: {flex: 1, backgroundColor: themeColors?.background},
    main: {
      position: 'absolute',
      bottom: -30,
      backgroundColor: colors?.WHITE,
      height: 150,
      width: 150,
      borderRadius: 75,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
