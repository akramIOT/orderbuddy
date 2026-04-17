import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as appInsights from 'applicationinsights';
import { logger } from './logger/pino.logger';

// if (!appInsights.defaultClient) {
//   appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).setAutoCollectConsole(false).start();
// }
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: ['error', 'warn', 'log'] });
  app.useLogger({
    log: (msg) => logger.info(msg),
    error: (msg) => logger.error(msg),
    warn: (msg) => logger.warn(msg),
    debug: (msg) => logger.debug(msg),
    verbose: (msg) => (logger.trace ? logger.trace(msg) : logger.debug(msg)),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('OrderBuddy API')
    .setDescription('REST API for Order and Manage apps')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // app.useGlobalFilters(new SupertokensExceptionFilter())

  const configService = app.get(ConfigService);
  const storeEndpoint = configService.get('STORE_ENDPOINT');
  const menuEndpoint = configService.get('MENU_ENDPOINT');
  const useEmulator = configService.get('USEEMULATOR');
  const LOCALHOST_URL = configService.get('LOCALHOST_URL');

  const allowedOrigins = [storeEndpoint, menuEndpoint];

  if (useEmulator === 'true') {
    allowedOrigins.push(LOCALHOST_URL);
  }

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies or authorization headers
  });

  const port = configService.get('PORT');
  await app.listen(port);

  logger.info(`OrderBuddy API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
