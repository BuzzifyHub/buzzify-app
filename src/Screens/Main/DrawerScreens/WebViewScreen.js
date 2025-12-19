import React, {useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import images from '../../../Constants/images';

const WebViewScreen = ({route}) => {
  const {url} = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={images?.Remove} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>
      <WebView
        source={{uri: url}}
        style={styles.webView}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    marginTop: 20,
  },
  closeIcon: {
    height: 30,
    width: 30,
  },
  webView: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Optional: add a background to mask content behind
    zIndex: 10,
  },
});

export default WebViewScreen;
