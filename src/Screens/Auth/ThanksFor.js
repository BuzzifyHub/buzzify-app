import {Image, Share, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import CommonView from '../../Components/Hoc/CommonView';
import {FULL_HEIGHT, FULL_WIDTH} from '../../Constants/Layout';
import images from '../../Constants/images';
import Button from '../../Components/Hoc/Button';
import {useSelector} from 'react-redux';
import Typography from '../../Components/Hoc/Typography';
import fonts from '../../Constants/fonts';
import localization from '../../Constants/localization';

const ThanksFor = ({navigation}) => {
  const UserType = useSelector(store => store.isUserType);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Hey! I'm working on buzzify app. I'll share the download link with you soon. Stay tuned!",
      });
    } catch (error) {
      // Ignore error silently — optionally track it in crash tool if needed
    }
  };

  return (
    <CommonView customStyle={{paddingTop: FULL_HEIGHT * 0.02, flex: 1}}>
      <TouchableOpacity
        style={{width: 30}}
        onPress={() => {
          navigation.goBack();
        }}>
        <Image
          source={images?.ArrowLeft}
          style={{Height: 28, width: 28, resizeMode: 'contain'}}
        />
      </TouchableOpacity>
      <View
        style={{
          alignItems: 'center',
          height: FULL_HEIGHT * 0.7,
          justifyContent: 'center',
        }}>
        <View style={{alignItems: 'center'}}>
          <Image
            source={images?.Thumb}
            style={{
              width: 50,
              height: 50,
              resizeMode: 'contain',
              marginBottom: 20,
            }}
          />
          <Typography
            size={30}
            textAlign={'center'}
            type={fonts?.Montserrat_Bold}
            style={{
              maxWidth: FULL_WIDTH * 0.7,
            }}>
            {localization?.Thanks?.title}
          </Typography>
          <Typography
            size={18}
            textAlign={'center'}
            type={fonts?.Montserrat_LightItalic}
            style={{
              marginTop: 20,
              maxWidth: FULL_WIDTH * 0.6,
            }}>
            {localization?.Thanks?.love}
          </Typography>
          <Typography
            size={18}
            textAlign={'center'}
            type={fonts?.Montserrat_LightItalic}
            color={'#DAA520'}
            style={{
              marginBottom: FULL_HEIGHT * 0.04,
              maxWidth: FULL_WIDTH * 0.6,
            }}>
            {localization?.Thanks?.share}
          </Typography>
        </View>
        <Button
          btnTitle={localization?.Thanks?.btnTitle}
          borderRadius={10}
          btnWidth="55%"
          onPress={() => {
            handleShare();
          }}
        />
        {UserType !== 'guest' && (
          <Button
            onPress={async () => {
              navigation?.navigate('SubmitStory');
            }}
            btnTitle={localization?.Thanks?.submit}
            borderRadius={10}
            btnWidth="55%"
            customStyle={{marginTop: 20}}
          />
        )}
      </View>
    </CommonView>
  );
};

export default ThanksFor;

const styles = StyleSheet.create({});
