import { Module } from '@nestjs/common'
import { SupertokensService } from './supertokens/supertokens.service'
import { MiddlewareConsumer, NestModule, DynamicModule } from '@nestjs/common'
import { AuthMiddleware } from './auth.middleware'
import { ConfigInjectionToken, AuthModuleConfig } from './config.interface'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  providers: [],
  exports: [],
  controllers: [],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }

  static forRootAsync(configProvider: {
    useFactory: (...args: any[]) => Promise<AuthModuleConfig> | AuthModuleConfig
    inject?: any[]
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [],
      providers: [
        {
          provide: ConfigInjectionToken,
          useFactory: async (...args: any[]) => {
            const config = await configProvider.useFactory(...args)
            return {
              appInfo: config.appInfo,
              connectionURI: config.connectionURI,
              apiKey: config.apiKey,
            }
          },
          inject: configProvider.inject || [],
        },
        SupertokensService,
      ],
      exports: [],
    }
  }
}
