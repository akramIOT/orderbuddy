import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { EmailTemplateService } from './email-template.service';
import { LocalEmailService } from './local-email.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailTemplateService: EmailTemplateService,
    private readonly localEmailService: LocalEmailService,
  ) {}
  // @Get('test/:email')
  // async sendTestEmail(@Param('email') email: string) {
  //   console.log(`Sending test email to: ${email}`);
  //   console.info(`Email template service: ${this.emailTemplateService.constructor.name}`);
  //   await this.localEmailService.send({
  //     to: email,
  //     subject: 'Test Email',
  //     html: '<h1>Hello World</h1><p>This is a test email from OrderBuddy!</p>',
  //   });

  //   return { success: true, message: 'Test email sent' };
  // }

  // @Get('test-template/:template')
  // async sendTemplateEmail(@Param('template') template: string, @Query('email') email: string) {
  //   console.log(`Sending test email with template: ${template} to: ${email}`);
  //   const testData = {
  //     welcome: { name: 'Test User' },
  //     'order-confirmation': { name: 'Test User', orderNumber: '12345', total: '25.99' },
  //   };

  //   const data = testData[template] || {};
  //   const html = this.emailTemplateService.renderHtml(template, data);

  //   await this.localEmailService.send({
  //     to: email || 'test@example.com',
  //     subject: `Test ${template} template`,
  //     html,
  //   });

  //   return { success: true, message: `Test email with ${template} template sent` };
  // }
}
