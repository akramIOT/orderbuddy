import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  DB_CONN_STRING: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  API_ENDPOINT: Joi.string().uri().required(),
  STORE_ENDPOINT: Joi.string().uri().required(),
  MENU_ENDPOINT: Joi.string().uri().required(),
  TAX_RATE: Joi.number().required(),
  EMERGEPAY_ENVIRONMENT_URL: Joi.string().uri().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  // Allow empty when USEEMULATOR=true (local OpenAPI / checkout smoke tests without Firebase).
  FIREBASE_PRIVATE_KEY: Joi.when('USEEMULATOR', {
    is: 'true',
    then: Joi.string().allow(''),
    otherwise: Joi.string().min(1).required(),
  }),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'local').required(),
  USEEMULATOR: Joi.string().valid('true', 'false').required(),
  LOCALHOST_URL: Joi.string().uri().required(),

  // Auth related
  // SUPERTOKENS_API_KEY: Joi.string().required(),
  // SUPERTOKENS_CONNECTION_URI: Joi.string().uri().required(),

  // Twilio configuration
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  // TWILIO_PHONE_NUMBER: Joi.string().required(),

  // AI and Smart Scan
  // OPENAI_API_KEY: Joi.string().required(),
  // SMART_SCAN_URL: Joi.string().uri().required(),

  // Azure Storage
  // AZURE_STORAGE_ACCOUNT_NAME: Joi.string().required(),
  // AZURE_STORAGE_CONNECTION_STRING: Joi.string().required(),
  // APPLICATIONINSIGHTS_CONNECTION_STRING: Joi.string().required(),
  // APPINSIGHTS_INSTRUMENTATIONKEY: Joi.string().required(),

  // SendGrid
  SENDGRID_API_KEY: Joi.string().required(),
  // FROM_EMAIL: Joi.string().email().default('noreply@orderbuddy.com'),
});
