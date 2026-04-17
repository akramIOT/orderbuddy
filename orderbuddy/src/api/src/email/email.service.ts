import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string; // optional override
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    type?: string;
    disposition?: string;
    content_id?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('SENDGRID_API_KEY');
    sgMail.setApiKey(apiKey);
    this.fromEmail = this.configService.getOrThrow<string>('FROM_EMAIL');
  }

  async send(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, from = this.fromEmail, attachments } = options;

  try {
    await sgMail.send({
      to,
      from,
      subject,
      html,
      attachments: attachments?.map(att => ({
        ...att,
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64')
      }))
    });
  } catch (error) {
    // Log the error details but protect sensitive information
    console.error('SendGrid email error:', error.message);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
}
}
