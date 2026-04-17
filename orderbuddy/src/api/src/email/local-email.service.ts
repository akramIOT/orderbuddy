import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string; // optional override
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string; // Nodemailer uses 'contentType'
    cid?: string;
    disposition?: 'attachment' | 'inline';
  }>;
}

@Injectable()
export class LocalEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false, // Mailpit doesn't require SSL
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

 async send(options: SendEmailOptions): Promise<void> {
    const { to, subject, html, from = 'noreply@orderbuddy.test', attachments } = options;

    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        cid: att.cid,
        contentDisposition: att.disposition,
      })),
    });
  }
}



