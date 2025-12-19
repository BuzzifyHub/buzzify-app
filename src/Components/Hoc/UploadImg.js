import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {openCamera, openPicker} from 'react-native-image-crop-picker';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import Typography from './Typography';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import {FULL_WIDTH} from '../../Constants/Layout';
import images from '../../Constants/images';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import localization from '../../Constants/localization';

const UploadImg = ({
  multiple = false,
  showModal,
  close = () => {},
  selected = () => {},
  mediaType = 'photo',
  onlyPdf = false,
}) => {
  const insets = useSafeAreaInsets();

  const OpenCamera = () => {
    setTimeout(() => {
      openCamera({
        mediaType: mediaType,
        width: 200,
        height: 200,
        cropping: mediaType != 'video',
        compressImageQuality: 0.8,
        forceJpg: true,
        cropping: false,
      })
        .then(async (response, type = 'camera') => {
          let arr = [];
          arr?.push(response);
          selected(arr, 'camera:::::::', type);

          close();
        })
        .catch(err => {
          close();
        });
    }, 200);
  };
  const OpenGallery = () => {
    setTimeout(() => {
      openPicker({
        mediaType: mediaType,
        width: 200,
        height: 200,
        cropping: mediaType != 'video',
        multiple: multiple,
        compressImageQuality: 0.8,
        forceJpg: true,
        cropping: false,
      })
        .then(async (response, type = 'gallery') => {
          selected(response, 'gallery::::::', type);

          close();
        })
        .catch(err => {
          close();
        });
    }, 200);
  };

  const isIos = Platform.OS === 'ios';
  const checkCameraPermission = () => {
    check(!isIos ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA)
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            requestCameraPermission();
            ToastMsg(localization?.cameraPer?.camFea);

            break;
          case RESULTS.DENIED:
            requestCameraPermission();
            break;
          case RESULTS.LIMITED:
            requestCameraPermission();
            break;
          case RESULTS.GRANTED:
            OpenCamera();
            break;
          case RESULTS.BLOCKED:
            ToastMsg(localization?.cameraPer?.plsProvide);
            break;
        }
      })
      .catch(error => {
        ToastMsg(localization?.cameraPer?.plsProvide);
      });
  };

  const checkPhotoPermission = () => {
    check(
      !isIos
        ? Platform.constants['Release'] > 12
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY,
    )
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            ToastMsg(localization?.cameraPer?.notAvail);

            break;
          case RESULTS.DENIED:
            requestPhotosPermission();
            break;
          case RESULTS.LIMITED:
            requestPhotosPermission();
            break;
          case RESULTS.GRANTED:
            OpenGallery();
            break;
          case RESULTS.BLOCKED:
            ToastMsg(localization?.cameraPer?.stoPer);
            break;
        }
      })
      .catch(error => {
        ToastMsg(localization?.cameraPer?.stoPer);
      });
  };

  const requestCameraPermission = () => {
    request(isIos ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
      .then(result => {
        if (result == 'blocked') {
          ToastMsg(localization?.cameraPer?.blocked);
          setTimeout(() => {
            close();
          }, 1500);
        }
        if (result === 'granted') OpenCamera();
        else if (result === 'denied') checkCameraPermission();
      })
      .catch(e => {
        // Ignore error silently — optionally track it in crash tool if needed
      });
  };

  const requestPhotosPermission = () => {
    OpenGallery();
  };
  return (
    <SafeAreaView style={{}}>
      <Modal
        statusBarTranslucent={true}
        onRequestClose={() => close()}
        transparent={true}
        style={styles.mainContainer}
        visible={showModal}
        animationType="fade"
        presentationStyle="overFullScreen">
        <View
          style={[
            styles.modalContainer,
            {
              paddingBottom: insets?.bottom,
            },
          ]}>
          <TouchableOpacity style={styles.TouchArea} onPress={() => close()} />
          <View style={styles.bottomModal}>
            <View style={styles.modalShowSection}>
              <View style={[styles.modalView, {}]}>
                {!onlyPdf && (
                  <>
                    <TouchableOpacity
                      style={styles.checkView}
                      onPress={checkCameraPermission}>
                      <Image
                        source={images?.Camera}
                        style={{
                          height: 25,
                          width: 25,
                          tintColor: colors?.ORANGE,
                        }}
                      />
                      <Typography
                        size={16}
                        style={{marginTop: 10}}
                        color={colors?.ORANGE}
                        font={fonts?.Montserrat_Bold}>
                        {localization?.cameraPer?.camera}
                      </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkView}
                      onPress={checkPhotoPermission}>
                      <Image
                        source={images?.Gallery}
                        style={{
                          height: 25,
                          width: 25,
                          tintColor: colors?.ORANGE,
                        }}
                      />
                      <Typography
                        style={{marginTop: 10}}
                        font={fonts?.Montserrat_Bold}
                        size={16}
                        color={colors?.ORANGE}>
                        {localization?.cameraPer?.gallery}
                      </Typography>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  TouchArea: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  bottomModal: {
    width: FULL_WIDTH,
    justifyContent: 'center',
    backgroundColor: colors?.WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 40,
  },

  modalShowSection: {
    marginHorizontal: 20,
    padding: 20,
  },
  crossIcon: {
    padding: 15,
    alignSelf: 'flex-end',
  },
  modalView: {
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  checkView: {
    alignItems: 'center',
  },
});

export default UploadImg;
