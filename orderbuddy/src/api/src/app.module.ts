import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Logger, LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiConfigModule } from './config/config.module';
import { PaymentsModule } from './payments/payments.module';
import { MenuModule } from './menu/menu.module';
import { EventsModule } from './events/events.module';
import * as admin from 'firebase-admin';
import { WebPushModule } from './web-push/web-push.module';
import { AuthModule } from './auth/auth.module';
import { OrderAppModule } from './order-app/order-app.module';
import { MongoIndexInitializer } from './db/mongo-index-initializer';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { StationsModule } from './stations/stations.module';
import { OriginsModule } from './origins/origins.module';
import { StorageModule } from './storage/storage.module';
// import { AzureInsightsMiddleware } from './middleware/appInsights.middleware';
import { MessageModule } from './message/message.module';
import { PrintersModule } from './printers/printers.module';
import { ReportModule } from './report/report.module';
import { LocationSettingsModule } from './location-settings/location-settings.module';
import { PosModule } from './pos/pos.module';
import { EmailModule } from './email/email.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    ApiConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'trace',
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              level: 'trace',
              options: {
                colorize: true,
                singleLine: true,
              },
            },
          ],
        },
      },
    }),
    AuthModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const connectionURI = configService.get<string>('SUPERTOKENS_CONNECTION_URI') || 'development';
        const apiKey = configService.get<string>('SUPERTOKENS_API_KEY') || 'development';
        const apiDomain = configService.get<string>('API_ENDPOINT');
        const websiteDomain = configService.get<string>('STORE_ENDPOINT') || 'localhost';

        if (!connectionURI || !apiKey || !apiDomain || !websiteDomain) {
          throw new Error('Required auth configuration is missing');
        }

        return {
          connectionURI,
          apiKey,
          appInfo: {
            appName: 'OrderBuddy',
            apiDomain,
            websiteDomain,
            apiBasePath: '/login',
            websiteBasePath: '/login',
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('DB_CONN_STRING');
        const dbName = configService.get<string>('DB_NAME');

        if (!uri || !dbName) {
          throw new Error('Database configuration is missing');
        }

        return { uri, dbName };
      },
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      load: [
        () => {
          return {
            firebase: admin.initializeApp({
              credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              }),
            }),
          };
        },
      ],
    }),

    WebPushModule,
    EventsModule,
    RestaurantModule,
    PaymentsModule,
    MenuModule,
    OrderAppModule,
    AuthModule,
    StationsModule,
    OriginsModule,
    StorageModule,
    MessageModule,
    PrintersModule,
    ReportModule,
    LocationSettingsModule,
    PosModule,
    EmailModule,
    CampaignModule,
  ],
  controllers: [],
  providers: [MongoIndexInitializer, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*'); // Apply middleware globally
  }
}
