import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import colors from '../../Constants/colors';
import SvgIcon from '../../Constants/svg';
import fonts from '../../Constants/fonts';
import Typography from '../Hoc/Typography';
import {FULL_WIDTH} from '../../Constants/Layout';
import {useTheme} from '../Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import localization from '../../Constants/localization';
import {useSelector} from 'react-redux';

const SettingsCard = ({
  iconName = 'notification',
  title = localization?.settings?.notifi,
  subTitle = localization?.settings?.enable,
  useToggle = false,
  onPress = () => {},
  disabled = false,
  onToggleChange = () => {},
}) => {
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const userDetails = useSelector(store => store.user_details);
  const [isEnabled, setIsEnabled] = useState(
    userDetails?.is_notiifcation == 0 ? false : true,
  );

  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggleChange(newState);
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles?.main}
      disabled={disabled}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 14,
          width: FULL_WIDTH * 0.85,
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '85%',
          }}>
          <SvgIcon name={iconName} color={themeColors?.iconColor} />
          <View style={{marginLeft: 15}}>
            <Typography
              size={18}
              type={fonts?.Montserrat_SemiBold}
              color={themeColors?.txtBlack}>
              {title}
            </Typography>
            <Typography
              type={fonts?.Montserrat_SemiBold}
              color={colors?.LIGHT_GREY}>
              {subTitle}
            </Typography>
          </View>
        </View>
        {useToggle && (
          <TouchableOpacity
            onPress={toggleSwitch}
            activeOpacity={0.8}
            style={{}}>
            <View
              style={[
                styles.switchContainer,
                {backgroundColor: isEnabled ? '#FFC9A7' : '#ccc'},
              ]}>
              <Animated.View
                style={[
                  styles.knob,
                  {
                    transform: [{translateX: isEnabled ? 15 : 0}],
                    backgroundColor: isEnabled
                      ? colors?.ORANGE
                      : colors?.OFF_WHITE,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SettingsCard;

const getStyles = themeColors =>
  StyleSheet.create({
    main: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: themeColors?.borderColor,
    },
    switchContainer: {
      width: 38,
      height: 20,
      borderRadius: 20,
      padding: 0,
      justifyContent: 'center',
    },
    knob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      elevation: 2,
    },
  });
