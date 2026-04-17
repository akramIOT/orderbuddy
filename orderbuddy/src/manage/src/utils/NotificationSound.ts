import { registerPlugin } from '@capacitor/core';

export interface NotificationSoundPlugin {
  playNotificationSound(options?: { type?: 'notification' | 'ringtone' | 'alarm' }): Promise<{ success: boolean }>;
  stopSound(): Promise<{ success: boolean }>;
}

// Register the plugin with Capacitor
const NotificationSound = registerPlugin<NotificationSoundPlugin>('NotificationSound');

export default NotificationSound;
