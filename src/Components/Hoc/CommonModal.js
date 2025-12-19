import React from 'react';
import {Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import Typography from './Typography';
import fonts from '../../Constants/fonts';
import colors from '../../Constants/colors';
import localization from '../../Constants/localization';

const CommonModal = ({
  visible,
  onClose,
  onConfirm,
  title = localization?.customDrawer?.signOut,
  subtitle = localization?.customDrawer?.areYou,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Typography
            size={20}
            type={fonts?.Montserrat_Bold}
            color={colors?.DIFF_BLACK}>
            {title}
          </Typography>
          <Typography
            size={16}
            type={fonts?.Montserrat_SemiBold}
            color={colors?.DIFF_BLACK}
            style={{marginVertical: 15}}>
            {subtitle}
          </Typography>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.noButton} onPress={onClose}>
              <Typography
                color={colors?.ORANGE}
                size={16}
                type={fonts?.Montserrat_Medium}>
                {localization?.customDrawer?.no}
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yesButton} onPress={onConfirm}>
              <Typography
                color={colors?.ORANGE}
                size={16}
                type={fonts?.Montserrat_Medium}>
                {localization?.customDrawer?.yes}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    // alignItems: 'center',
    elevation: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'flex-end',
  },
  noButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    // backgroundColor: '#f2f2f2',
  },
  yesButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    // backgroundColor: '#ff784f',
  },
});

export default CommonModal;
