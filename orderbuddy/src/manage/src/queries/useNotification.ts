import { axiosInstance } from './axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { isPlatform } from '@ionic/react';
import { messaging } from '../firebase/firebase';
import { getToken } from 'firebase/messaging';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import axios from 'axios';
import { Device } from '@capacitor/device';

interface NotificationSubscription {
  token: string;
  restaurantId: string;
  platform: 'android' | 'web';
}
const getBaseUrl = async () => {
  const info = await Device.getInfo();
  // Android emulator uses 10.0.2.2 to access host's localhost
  if (
    info.platform === 'android' &&
    (info.isVirtual || info.model?.toLowerCase().includes('sdk') || info.manufacturer?.toLowerCase().includes('google'))
  ) {
    return import.meta.env.VITE_EMULATOR_HOST_API; // Use your API port
  }
  return import.meta.env.VITE_API_ENDPOINT;
};
// Register notification token with backend
const registerToken = async (subscription: NotificationSubscription) => {
  try {
    const response = await axiosInstance.post('/web-push/subscribe', subscription);
    return response.data;
  } catch (error) {
    console.error('Token registration error:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

// Initialize Android Push Notifications
const initializeAndroidNotifications = async (restaurantId: string) => {
  const result = await PushNotifications.requestPermissions();

  if (result.receive === 'granted') {
    await PushNotifications.register();

    // Set up listeners
    PushNotifications.addListener('registration', async (token: Token) => {
      try {
        const response = await registerToken({
          token: token.value,
          restaurantId,
          platform: 'android',
        });
        console.log('Token registration successful:', response);
      } catch (error) {
        console.error('Failed to register token with backend:', error);
        // Retry logic could be added here
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed:', notification);
    });
  }
};

// Initialize Web Push Notifications
const initializeWebNotifications = async (restaurantId: string) => {
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    try {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
      });

      await registerToken({
        token,
        restaurantId,
        platform: 'web',
      });

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      throw error;
    }
  } else {
    throw new Error('Notification permission denied');
  }
};

// Custom hook for notification initialization
export const useInitializeNotifications = () => {
  return useMutation({
    mutationFn: async (restaurantId: string) => {
      if (isPlatform('android')) {
        return initializeAndroidNotifications(restaurantId);
      } else if (isPlatform('desktop') || isPlatform('mobileweb')) {
        return initializeWebNotifications(restaurantId);
      }
    },
  });
};

// Custom hook for manual token registration
// export const useRegisterNotificationToken = () => {
//   return useMutation({
//     mutationFn: registerToken,
//   });
// };
