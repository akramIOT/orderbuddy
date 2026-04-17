import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

// Import MJML
let mjml2html;
try {
  mjml2html = require('mjml');
} catch (e) {
  // Fallback if import fails
  mjml2html = (mjmlContent) => ({
    html: `<p>Email content unavailable. Please contact support.</p>`,
    errors: [],
  });
}

@Injectable()
export class EmailTemplateService implements OnModuleInit {
  private readonly logger = new Logger(EmailTemplateService.name);
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();

  onModuleInit() {
    try {
      const templateDir = path.resolve(__dirname, 'templates');

      // Load templates from directory
      const files = fs.readdirSync(templateDir);

      files.forEach((file) => {
        if (file.endsWith('.mjml')) {
          const fullPath = path.join(templateDir, file);
          const mjmlRaw = fs.readFileSync(fullPath, 'utf8');
          const compiled = Handlebars.compile(mjmlRaw);
          this.templates.set(file.replace('.mjml', ''), compiled);
        }
      });

      this.logger.log(`Loaded templates: ${Array.from(this.templates.keys()).join(', ')}`);
    } catch (error) {
      this.logger.error('Error loading email templates', error);
    }
  }

  renderHtml(templateName: string, context: any): string {
    // Get the template
    const templateFn = this.templates.get(templateName);

    // If no template found, throw error
    if (!templateFn) throw new Error(`Template "${templateName}" not found`);

    // Apply the template context
    const mjmlWithData = templateFn(context);

    try {
      // Render the MJML to HTML
      const result = mjml2html(mjmlWithData);

      // Check for MJML errors
      if (result.errors && result.errors.length > 0) {
        this.logger.error('MJML compilation errors:', result.errors);
      }
      return result.html;
    } catch (err) {
      console.error('Failed to render MJML:', err);
      this.logger.error('Failed to render template:', err);
      return '<p>Failed to render email template.</p>';
    }
  }
}
