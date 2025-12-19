import notifee, {
  AndroidBadgeIconType,
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import messagingDefault, {
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  deleteToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { AppState, Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import colors from '../Constants/colors';
import { setFcmToken } from '../Backend/AsyncStorage';
import { navigate } from '../Navigation/NavigationRef';

const messaging = getMessaging();

export const getFcmToken = async () => {
  let token = null;
  try {
    // First check and request permission
    const permissionGranted = await checkApplicationNotificationPermission();

    if (permissionGranted) {
      // Ensure device is registered for remote messages
      await registerAppWithFCM();

      // iOS-specific: Double-check registration status before getting token
      // Android doesn't need this check as registration is synchronous
      if (Platform.OS === 'ios') {
        const isRegistered = await isDeviceRegisteredForRemoteMessages(
          messaging,
        );
        if (!isRegistered) {
          console.warn(
            'Device not registered, attempting to register again...',
          );
          await registerDeviceForRemoteMessages(messaging);
          // Wait a bit for iOS registration to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Now get the token
      token = await getToken(messaging);
      if (token) {
        console.log('FCM Token retrieved successfully:', token);
        await setFcmToken(token);
      } else {
        console.warn('FCM Token is null - check permissions and APNS setup');
      }
    } else {
      console.warn('Notification permission not granted, cannot get FCM token');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
  return token;
};

export async function registerAppWithFCM() {
  try {
    const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
    if (!isRegistered) {
      console.log('Registering device for remote messages...');
      await registerDeviceForRemoteMessages(messaging);
      // On iOS, wait a bit for the registration to complete (APNS is async)
      // Android doesn't need this delay as registration is synchronous
      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      console.log('Device registered for remote messages');
    } else {
      console.log('Device already registered for remote messages');
    }
  } catch (error) {
    console.error('Error registering app with FCM:', error);
    // Only throw on iOS to maintain Android compatibility
    if (Platform.OS === 'ios') {
      throw error;
    }
  }
}

export async function unRegisterAppWithFCM() {
  try {
    const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
    if (isRegistered) {
      // Note: unregisterDeviceForRemoteMessages is not available in the modular API
      // The device will be unregistered when the app is uninstalled
      console.log('Device is registered, skipping unregister (not supported)');
    }
    await deleteToken(messaging);
  } catch (error) {
    console.error('Error unregistering app with FCM:', error);
  }
}

export const checkApplicationNotificationPermission = async () => {
  try {
    let permissionGranted = false;

    if (Platform.OS === 'android') {
      const permission =
        PERMISSIONS.ANDROID.POST_NOTIFICATIONS ||
        'android.permission.POST_NOTIFICATIONS';

      const result = await request(permission);
      permissionGranted = result === 'granted';
    } else if (Platform.OS === 'ios') {
      // Use default export for requestPermission on iOS
      const authStatus = await messagingDefault().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      permissionGranted = enabled;
    }

    return permissionGranted;
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};

export function registerListenerWithFCM() {
  const unsubscribe = onMessage(messaging, async remoteMessage => {
    const { title, body } = remoteMessage.notification || {};

    if (title || body) {
      await onDisplayNotification(title, body, remoteMessage.data);
    }
  });

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const storyId = detail.notification.data?.id;
      if (storyId) {
        navigate('MyFeed', { featureId: storyId });
      }
    }
  });

  onNotificationOpenedApp(messaging, remoteMessage => {
    const storyId = remoteMessage?.data?.id;
    if (storyId) {
      navigate('MyFeed', { featureId: storyId });
    }
  });

  getInitialNotification(messaging).then(remoteMessage => {
    const storyId = remoteMessage?.data?.id;
    if (storyId) {
      navigate('MyFeed', { featureId: storyId });
    }
  });

  return unsubscribe;
}

async function onDisplayNotification(title, body, data = {}) {
  try {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'default', // Avoid creating a new channel every time
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      vibration: true,
      badge: true,
      vibrationPattern: [300, 500],
    });

    const currentBadgeCount = await notifee.getBadgeCount();
    const newBadgeCount = currentBadgeCount + 1;
    await notifee.setBadgeCount(newBadgeCount);

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: '@mipmap/ic_launcher',
        pressAction: {
          id: 'default',
        },
        badgeCount: newBadgeCount,
        badgeIconType: AndroidBadgeIconType.SMALL,
        importance: AndroidImportance.HIGH,
        color: colors.ORANGE,
      },
    });
  } catch (err) {
    // Ignore error silently — optionally track it in crash tool if needed
  }
}

export const initializeAppStateListener = () => {
  AppState.addEventListener('change', async state => {
    if (state === 'active') {
      await notifee.setBadgeCount(0);
    }
  });
};

export async function requestUserPermission() {
  // Use default export for requestPermission
  const authStatus = await messagingDefault().requestPermission();
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    getFCMToken();
  }
}

const getFCMToken = async () => {
  await registerDeviceForRemoteMessages(messaging);
  try {
    const token = await getToken(messaging);
    if (token) {
      await setFcmToken(token);
    }
  } catch (e) {
    // Ignore error silently — optionally track it in crash tool if needed
  }

  onForeground();
  onBackground();
};

// 🔔 Create default channel (required for Android)
const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
};

// 📲 Foreground message handling
export const onForeground = () => {
  onMessage(messaging, async remoteMessage => {
    await createNotificationChannel();

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || '📬 New Message',
      body: remoteMessage.notification?.body || 'You have a new notification.',
      android: {
        channelId: 'default',
        smallIcon: '@mipmap/ic_launcher',

        pressAction: {
          id: 'default',
        },
        color: 'yellow',
        style: {
          type: AndroidStyle.BIGTEXT,
          text: remoteMessage.notification?.body || '',
        },
      },
    });
  });
};

// 🎯 Background/quit-state handling
// Note: setBackgroundMessageHandler should be called in index.js, not here
export const onBackground = () => {
  // Background message handler is registered in index.js
  // This function is kept for compatibility but doesn't do anything here
};

// 🎮 Optional: Listen for notification press events
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
  }
});
