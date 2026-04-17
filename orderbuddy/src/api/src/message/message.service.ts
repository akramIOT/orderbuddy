import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class MessageService {
  private readonly twilioClient: Twilio;

  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(MessageService.name) private readonly logger: PinoLogger
  ) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );
    this.logger.setContext('MessageService');
  }

  async sendMessage(phoneNumber: string, message: string): Promise<string | void> {
    try {
      const allowMessage = this.configService.get<boolean>('ALLOW_MESSAGE', false);

      if (!allowMessage) {
        this.logger.debug(`Messaging disabled: ${message}`);
        return;
      }
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: `+1${phoneNumber}`,
      });

      if (!result) {
        this.logger.error('Unable to send message');
        return;
      }

      this.logger.debug(`Message response ${result}`);
      this.logger.debug(`Message sent to phone:${phoneNumber} sid:${result.sid}`);
      return result.sid;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }
}
