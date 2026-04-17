import { useEffect, useState } from 'react';
import NotificationSound from '../utils/NotificationSound';
import { Capacitor } from '@capacitor/core';

export const useNotificationSound = () => {
  const [webAudio] = useState<HTMLAudioElement | null>(
    Capacitor.isNativePlatform() ? null : new Audio('/sounds/new-order.mp3'),
  );

  // Cleanup web audio when component unmounts
  useEffect(() => {
    return () => {
      if (webAudio) {
        webAudio.pause();
        webAudio.currentTime = 0;
      }
    };
  }, [webAudio]);

  const playNotificationSound = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use native sounds on Android
        await NotificationSound.playNotificationSound();
      } else {
        // Fallback to web audio on non-native platforms
        if (webAudio) {
          webAudio.currentTime = 0;
          await webAudio.play();
        }
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await NotificationSound.stopSound();
      } else if (webAudio) {
        webAudio.pause();
        webAudio.currentTime = 0;
      }
    } catch (error) {
      console.error('Error stopping notification sound:', error);
    }
  };

  return {
    playNotificationSound,
    stopSound,
  };
};
