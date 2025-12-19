import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './src/Navigation/MainNavigation';
import { persistor, store } from './src/Redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import LaunchScreen from './src/Screens/Auth/LaunchScreen';
import { UserProvider } from './src/Context/UserContext';
import GlobalToast from './src/Components/Hoc/GlobalToast';
import { ThemeProvider, useTheme } from './src/Components/Hoc/ThemeContext';
import { FontSizeProvider } from './src/Components/Hoc/FontSizeContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import localization from './src/Constants/localization';
import { getLanguage } from './src/Backend/AsyncStorage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NetAlert from './src/Components/Hoc/NetAlert';
import {
  getFcmToken,
  registerListenerWithFCM,
} from './src/PushNotification/Notificaton';
import { Linking, AppState } from 'react-native';
import {
  navigate,
  navigationRef,
  onNavigationReady,
} from './src/Navigation/NavigationRef';
import notifee from '@notifee/react-native';
import { Settings } from 'react-native-fbsdk-next';

GoogleSignin.configure({
  webClientId:
    '437517013917-77rlv8obhte8h7tjbe5nrurope7q7gju.apps.googleusercontent.com',
  offlineAccess: true,
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let unsubscribeFCM = null;

    const initApp = async () => {
      try {
        const savedLang = await getLanguage();
        const langCode = savedLang || 'en';

        await i18n.use(initReactI18next).init({
          compatibilityJSON: 'v3',
          lng: langCode,
          fallbackLng: 'en',
          resources: {
            en: { translation: localization?.en },
            hi: { translation: localization?.hi },
          },
          interpolation: {
            escapeValue: false,
          },
        });

        localization.setLanguage(langCode);
        store.dispatch({ type: 'LANG', payload: { lang: langCode } });

        const token = await getFcmToken();
        console.log(token, 'FCM TOKEN :::');

        Settings.initializeSDK();
        setTimeout(() => {
          setShowSplash(false);
          setAppReady(true);

          const waitForNav = setInterval(() => {
            if (navigationRef.isReady()) {
              clearInterval(waitForNav);
              unsubscribeFCM = registerListenerWithFCM();
            }
          }, 100);
        }, 2000);
      } catch (error) {
        setShowSplash(false);
        setAppReady(true);
      }
    };

    initApp();

    const subscription = AppState.addEventListener('change', async state => {
      if (state === 'active') {
        await notifee.setBadgeCount(0);
      }
    });

    return () => {
      if (unsubscribeFCM) unsubscribeFCM();
      subscription.remove();
    };
  }, []);

  if (!appReady || showSplash) {
    return <LaunchScreen />;
  }

  const linking = {
    prefixes: ['buzzify://', 'https://buzzify.24livehost.com'],

    async getInitialURL() {
      try {
        const url = await Linking.getInitialURL();
        return url;
      } catch (err) {
        return null;
      }
    },

    subscribe(listener) {
      const handleDeepLink = ({ url }) => {
        listener(url);

        const match = url.match(/public\/blog-details\/(\d+)/);
        if (match && match[1]) {
          const featureId = Number(match[1]);

          const tryNavigate = () => {
            if (navigationRef.isReady()) {
              navigate('MyFeed', { featureId });
            } else {
              setTimeout(tryNavigate, 100);
            }
          };

          tryNavigate();
        }
      };

      const subscription = Linking.addEventListener('url', handleDeepLink);
      return () => subscription.remove();
    },

    config: {
      screens: {
        MyFeed: {
          path: 'public/blog-details/:featureId',
          parse: {
            featureId: Number,
          },
        },
      },
    },
  };

  return (
    <UserProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <NavigationContainer
            theme={theme}
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              onNavigationReady();
            }}
          >
            <MainNavigation />
            <NetAlert />
            <GlobalToast />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </UserProvider>
  );
};

const AppWrapper = () => (
  <FontSizeProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </FontSizeProvider>
);

export default AppWrapper;
