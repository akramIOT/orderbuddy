import { Injectable } from '@nestjs/common';
import { CreateWebPushDto, SendNotificationDto } from './dto/create-web-push.dto';
import * as webPush from 'web-push';
import { Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { COLLECTIONS } from '../db/collections';
interface NotificationPayload {
  title: string;
  body: string;
}
@Injectable()
export class WebPushService {
  private readonly subscriptionsCollection;

  constructor(@InjectConnection() private readonly db: Db) {
    this.subscriptionsCollection = this.db.collection(COLLECTIONS.SUBSCRIPTIONS);
    // webPush.setVapidDetails('mailto:your-email@example.com', this.VAPID_PUBLIC_KEY, this.VAPID_PRIVATE_KEY)
  }

  async addSubscription(subscriptionData: CreateWebPushDto) {
    const { restaurantId, token, platform } = subscriptionData;
    const tokenField = platform === 'android' ? 'fcmAndroid' : 'fcmWeb';

    const existingSubscription = await this.subscriptionsCollection.findOne({
      restaurantId,
    });

    if (existingSubscription) {
      await this.subscriptionsCollection.updateOne({ restaurantId }, { $addToSet: { [tokenField]: token } });
      return { success: true, updated: true };
    }

    const newDoc = {
      restaurantId,
      fcmAndroid: platform === 'android' ? [token] : [],
      fcmWeb: platform === 'web' ? [token] : [],
    };

    await this.subscriptionsCollection.insertOne(newDoc);
    return { success: true };
  }

  async sendNotifications(payload: NotificationPayload, data: SendNotificationDto) {
    const subscription = await this.subscriptionsCollection.findOne({
      restaurantId: data.restaurantId,
    });

    if (!subscription) {
      return { success: false, message: 'No subscriptions found' };
    }

    const results: {
      android: { success: boolean; token: string; error: any }[];
      web: { success: boolean; token: string; error: any }[];
    } = {
      android: [],
      web: [],
    };

    if (data.platform === 'all' || data.platform === 'android') {
      results.android = await this.sendFCMNotifications(subscription.fcmAndroid || [], payload, 'android');
    }

    if (data.platform === 'all' || data.platform === 'web') {
      results.web = await this.sendFCMNotifications(subscription.fcmWeb || [], payload, 'web');
    }

    return {
      success: true,
      results,
    };
  }

  private async sendFCMNotifications(tokens: string[], payload: NotificationPayload, platform: 'android' | 'web') {
    if (!tokens?.length) return [];

    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        android:
          platform === 'android'
            ? {
                priority: 'high' as const,
                notification: {
                  channelId: 'order_notifications',
                  sound: 'default',
                },
              }
            : undefined,
        tokens: tokens.filter((token) => this.isValidToken(token)),
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Handle invalid tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          this.removeInvalidToken(tokens[idx], platform);
        }
      });

      return response.responses.map((resp, idx) => ({
        success: resp.success,
        token: tokens[idx],
        error: resp.error?.message,
      }));
    } catch (error: any) {
      console.error('FCM Error:', error);
      return tokens.map((token) => ({
        success: false,
        token,
        error: error.message,
      }));
    }
  }

  private async removeInvalidToken(token: string, platform: 'android' | 'web') {
    const field = platform === 'android' ? 'fcmAndroid' : 'fcmWeb';
    await this.subscriptionsCollection.updateMany({ [field]: token }, { $pull: { [field]: token } });
  }

  private isValidToken(token: string): boolean {
    return typeof token === 'string' && token.length > 0 && token.includes(':');
  }
}
