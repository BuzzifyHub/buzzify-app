import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import colors from '../../Constants/colors';
import SvgIcon from '../../Constants/svg';
import CommonInput, { ErrorBox } from '../../Components/Hoc/CommonInput';
import { FULL_HEIGHT, FULL_WIDTH } from '../../Constants/Layout';
import CommonView from '../../Components/Hoc/CommonView';
import Header from '../../Components/Hoc/Header';
import images from '../../Constants/images';
import Typography from '../../Components/Hoc/Typography';
import fonts from '../../Constants/fonts';
import Button from '../../Components/Hoc/Button';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import UploadImg from '../../Components/Hoc/UploadImg';
import { SEND_STORY } from '../../Backend/ApiRoutes';
import { POST_FORMDATA } from '../../Backend/Backend';
import { useSelector } from 'react-redux';
import { isValidForm } from '../../Backend/Utility';
import { validators } from '../../Backend/Validators';
import localization from '../../Constants/localization';
import { darkTheme, lightTheme } from '../../Constants/Color';
import { useTheme } from '../../Components/Hoc/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SubmitStory = ({ navigation }) => {
  const { resolvedTheme } = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const richText = useRef(null);
  const userDetails = useSelector(store => store.user_details);

  const [story, setStory] = useState('');
  const [imgUpload, setImgUpload] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editorFocused, setEditorFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const OnSubmit = () => {
    const error = {
      story: validators.checkOnlyRequire(localization?.AddStory?.story, story),
      image: validators?.checkRequire(
        localization?.AddStory?.addFile,
        imgUpload?.uri,
      ),
    };

    setErrors(error);
    if (isValidForm(error)) {
      setLoading(true);
      const formdata = new FormData();
      formdata.append('user_id', userDetails?.id),
        formdata.append('name', userDetails?.name),
        formdata.append('email', userDetails?.email),
        formdata.append('phone', userDetails?.phone ? userDetails?.phone : ''),
        formdata.append('story', story),
        formdata.append('file', imgUpload),
        POST_FORMDATA(
          SEND_STORY,
          formdata,
          async success => {
            console.log(success, 'SUCCESSS0000');

            setLoading(false);
            if (success?.status == true) {
              navigation.navigate('DrawerNavigation', { screen: 'MyStories' });
              ToastMsg(success?.message);
            } else {
              ToastMsg(success?.message);
            }
          },
          {
            userData: userDetails?.id,
          },
          error => {
            setLoading(false);
            ToastMsg(error?.message);
          },
          fail => {
            setLoading(false);
          },
        );
    }
  };

  return (
    <CommonView customStyle={{ flex: 1, paddingBottom: insets?.bottom }}>
      <Header
        txtSize={34}
        title={localization?.addFeedback?.addStory}
        downTitle={true}
        onPressBack={() => {
          navigation?.goBack();
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!editorFocused) {
              Keyboard.dismiss();
              // richText.current?.blurContentEditor?.();
            }
          }}
          accessible={false}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{}}
            >
              <RichEditor
                ref={richText}
                style={styles?.richEditor}
                placeholder={`${localization?.AddStory?.story} ...`}
                initialContentHTML={story}
                onChange={setStory}
                scrollEnabled={true}
                onFocus={() => setEditorFocused(true)}
                onBlur={() => setEditorFocused(false)}
                editorStyle={{
                  cssText: `
      body {
        font-size: 16px;
        margin: 0;
        padding: 8px;
        max-height: 140px;
        overflow-y: scroll;
      }
    `,
                }}
                useContainer={false}
              />

              {!story && <ErrorBox error={errors?.story} />}
              <RichToolbar
                editor={richText}
                actions={[
                  'bold',
                  'italic',
                  'underline',
                  'strikeThrough',
                  'justifyLeft',
                  'justifyCenter',
                  'justifyRight',
                  'justifyFull',
                  'insertBulletsList',
                  'insertOrderedList',
                ]}
                iconMap={{
                  bold: ({ tintColor }) => (
                    <SvgIcon name="boldIcon" color={tintColor} />
                  ),
                  italic: ({ tintColor }) => (
                    <SvgIcon name="italicIcon" color={tintColor} />
                  ),
                  underline: ({ tintColor }) => (
                    <SvgIcon name="underlineIcon" color={tintColor} />
                  ),
                  strikeThrough: ({ tintColor }) => (
                    <SvgIcon name="strike" color={tintColor} />
                  ),
                  justifyLeft: ({ tintColor }) => (
                    <SvgIcon name="indentLeft" color={tintColor} />
                  ),
                  justifyCenter: ({ tintColor }) => (
                    <SvgIcon name="indentRight" color={tintColor} />
                  ),
                  justifyRight: ({ tintColor }) => (
                    <SvgIcon name="paragraph" color={tintColor} />
                  ),
                  justifyFull: ({ tintColor }) => (
                    <SvgIcon name="alignJustify" color={tintColor} />
                  ),
                  insertBulletsList: ({ tintColor }) => (
                    <SvgIcon name="alignLeft" color={tintColor} />
                  ),
                  insertOrderedList: ({ tintColor }) => (
                    <SvgIcon name="spacing" color={tintColor} />
                  ),
                }}
                iconTint="#888"
                selectedIconTint={colors?.ORANGE}
                style={styles?.richToolbar}
              />

              <TouchableOpacity
                disabled={imgUpload?.uri ? true : false}
                onPress={() => {
                  Keyboard.dismiss();
                  richText.current?.dismissKeyboard?.();
                  setShow(true);
                }}
                style={styles?.uploadview}
              >
                {imgUpload?.uri ? (
                  <View style={{}}>
                    <TouchableOpacity
                      onPress={() => {
                        setImgUpload('');
                      }}
                      style={styles?.absoluteView}
                    >
                      <Image
                        source={images?.Remove}
                        style={{
                          height: 30,
                          width: 30,
                        }}
                      ></Image>
                    </TouchableOpacity>
                    <Image
                      source={{ uri: imgUpload?.uri }}
                      style={styles?.mainImg}
                    />
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Image
                      source={images?.AddIcon}
                      style={{
                        height: 50,
                        width: 50,
                        marginBottom: 20,
                      }}
                    />
                    <Typography
                      size={24}
                      type={fonts?.Montserrat_Medium}
                      color={colors?.TEXT_GREY}
                    >
                      {localization?.AddStory?.tap}
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
              {!imgUpload?.uri && <ErrorBox error={errors?.image}></ErrorBox>}

              <Button
                customStyle={{ marginTop: 30 }}
                onPress={() => {
                  Keyboard.dismiss();
                  richText.current?.dismissKeyboard?.();
                  OnSubmit();
                }}
                loading={loading}
              />

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
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </CommonView>
  );
};

export default SubmitStory;

const getStyles = themeColors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors?.background,
      padding: 16,
    },
    richEditor: {
      minHeight: 80,
      maxHeight: 200,
      padding: 12,
      fontSize: 16,
      borderBottomWidth: 1,
      borderColor: '#AAAAAA',
      backgroundColor: themeColors?.background,
      width: '100%',
      alignSelf: 'center',
    },
    richToolbar: {
      backgroundColor: themeColors?.background,
      borderColor: '#ccc',
      marginBottom: 10,
    },
    uploadview: {
      alignSelf: 'center',
      alignItems: 'center',
      height: FULL_HEIGHT * 0.28,
      width: FULL_WIDTH * 0.9,
      marginTop: FULL_HEIGHT * 0.05, //0.05
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors?.OFF_WHITE,
    },
    absoluteView: {
      position: 'absolute',
      right: -4,
      zIndex: 99,
      top: -15,
    },
    mainImg: {
      height: FULL_HEIGHT * 0.32,
      width: FULL_WIDTH * 0.9,
      marginBottom: 20,
      resizeMode: 'cover',
    },
  });
