import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Typography from './Typography';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import {FULL_WIDTH} from '../../Constants/Layout';
import SvgIcon from '../../Constants/svg';
import {useTheme} from './ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import localization from '../../Constants/localization';

export const CommonInput = ({
  placeholder,
  placeholderTextColor = colors?.GREY,
  rightIcon = true,
  rightIconName = 'user',
  value,
  onChangeText = () => {},
  onSubmitEditing = () => {},
  onFocus = () => {},
  multiline = false,
  cursorColor,
  textAlignVertical,
  textAlign,
  editable = true,
  keyboardType,
  passwordType,
  inputStyle,
  mainWidth = FULL_WIDTH * 0.9,
  error,
  secureTextEntry,
  errorStyle = {},
}) => {
  const [show, setShow] = useState(true);
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  const styles = getStyles(themeColors);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{width: '100%'}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{width: mainWidth, marginTop: 20}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: colors?.BORDER_COLOR,
              height: 48,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {rightIcon && (
                <View style={{marginRight: 12}}>
                  <SvgIcon
                    name={rightIconName}
                    color={colors?.GREY}
                    size={18}
                  />
                </View>
              )}
              <View
                style={{
                  width: FULL_WIDTH * 0.8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <TextInput
                  style={[
                    {
                      fontSize: 14,
                      flex: 1,
                      fontFamily: fonts?.Montserrat_Medium,
                      color: themeColors?.text,
                      ...inputStyle,
                    },
                  ]}
                  placeholder={placeholder}
                  placeholderTextColor={placeholderTextColor}
                  secureTextEntry={secureTextEntry && show}
                  value={value}
                  onChangeText={onChangeText}
                  onSubmitEditing={onSubmitEditing}
                  onFocus={onFocus}
                  multiline={multiline}
                  cursorColor={cursorColor}
                  textAlignVertical={textAlignVertical}
                  textAlign={textAlign}
                  editable={editable}
                  keyboardType={keyboardType}
                />
                {passwordType && (
                  <TouchableOpacity
                    onPress={() => {
                      setShow(!show);
                    }}>
                    <SvgIcon
                      name={!show ? 'openEye' : 'closedEye'}
                      color={colors?.GREY}
                      size={18}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          {error && <ErrorBox error={error} style={errorStyle} />}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CommonInput;
export const ErrorBox = ({error, style}) => {
  return (
    <Text
      style={[
        {
          fontSize: 11,
          fontFamily: fonts?.Montserrat_Regular,
          color: 'red',
          alignSelf: 'flex-end',
          width: '100%',
          marginTop: 10,
          textAlign: 'right',
        },
        style,
      ]}>
      {error}
    </Text>
  );
};

export const CommonContent = ({
  title = localization?.signUp?.already,
  subTitle = localization?.SignIn?.btnTitle,
  onPressSubTitle = () => {},
  size = 14,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography type={fonts?.Montserrat_Bold} size={size}>
        {title}
      </Typography>
      <TouchableOpacity onPress={onPressSubTitle}>
        <Typography
          type={fonts?.Montserrat_SemiBold}
          color={colors?.ORANGE}
          size={size}>
          {subTitle}
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

export const ProfileInput = ({
  label,
  value,
  onChangeText,
  editable = true,
  error,
  errorStyle = {},
  maxLength,
}) => {
  const {themeMode} = useTheme();
  const themeColors = themeMode === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);

  return (
    <>
      <View style={styles.inputWrapper}>
        <Typography
          style={styles.label}
          size={16}
          type={fonts?.Montserrat_SemiBold}>
          {label}
        </Typography>
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor={themeColors?.lightGrey}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline={true}
          maxLength={maxLength}
        />
      </View>
      {error && (
        <ErrorBox error={error} style={{marginTop: 0, ...errorStyle}} />
      )}
    </>
  );
};

const getStyles = themeColors =>
  StyleSheet.create({
    inputWrapper: {
      marginBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: themeColors?.placeholder,
      paddingBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontFamily: fonts?.Montserrat_SemiBold,
      fontSize: 16,
      color: themeColors?.text,
      width: FULL_WIDTH * 0.25,
    },
    input: {
      fontFamily: fonts?.Montserrat_SemiBold,
      fontSize: 16,
      color: themeColors?.text,
      width: FULL_WIDTH * 0.63,
    },
  });
