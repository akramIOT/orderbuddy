import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { LocalEmailService } from './local-email.service';
import { EmailTemplateService } from './email-template.service';
import { EmailController } from './email.controller';

export const EMAIL_SENDER = 'EMAIL_SENDER';

const EmailSenderProvider: Provider = {
  provide: EMAIL_SENDER,
  useFactory: (configService: ConfigService, localEmailService: LocalEmailService, emailService: EmailService) => {
    const nodeEnv = configService.getOrThrow<string>('NODE_ENV');
    return nodeEnv === 'local' ? localEmailService : emailService;
  },
  inject: [ConfigService, LocalEmailService, EmailService],
};

@Module({
  controllers: [EmailController],
  providers: [EmailService, LocalEmailService, EmailSenderProvider, EmailTemplateService],
  exports: [EMAIL_SENDER, EmailTemplateService],
})
export class EmailModule {}
