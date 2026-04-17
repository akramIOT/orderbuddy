@Module({
    providers: [
      {
        provide: SmsService,
        useClass: process.env.NODE_ENV === 'development'
          ? MockSmsService
          : TwilioSmsService
      }
    ]
  })
  export class NotificationModule {}
  