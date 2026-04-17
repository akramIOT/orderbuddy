import { Inject, Injectable, Logger } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import Passwordless from 'supertokens-node/recipe/passwordless';
import { ConfigInjectionToken, AuthModuleConfig } from '../config.interface';
import { TwilioService } from 'supertokens-node/recipe/passwordless/smsdelivery';
import { ConfigService } from '@nestjs/config';
import { Db, Collection, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { User } from '../../models/users';
import { COLLECTIONS } from '../../db/collections';
import { Location } from '../../db/models';
import { createJWT } from 'supertokens-node/recipe/session';
@Injectable()
export class SupertokensService {
  private readonly logger = new Logger(SupertokensService.name);
  private readonly usersCollection: Collection<User>;
  private readonly locationsCollection: Collection<Location>;

  constructor(
    @Inject(ConfigInjectionToken) private config: AuthModuleConfig,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly db: Db
  ) {
    this.usersCollection = this.db.collection(COLLECTIONS.USERS);
    this.locationsCollection = this.db.collection(COLLECTIONS.LOCATIONS);

    supertokens.init({
      appInfo: {
        appName: config.appInfo.appName,
        apiDomain: config.appInfo.apiDomain,
        websiteDomain: config.appInfo.websiteDomain,
        apiBasePath: '/login',
        websiteBasePath: '/login',
      },
      supertokens: {
        connectionURI: config.connectionURI,
        apiKey: config.apiKey,
      },
      recipeList: [
        Passwordless.init({
          flowType: 'USER_INPUT_CODE',
          contactMethod: 'EMAIL_OR_PHONE',
          override: {
            functions: (originalImplementation) => {
              return {
                ...originalImplementation,
                consumeCode: async (input) => {
                  let response = await originalImplementation.consumeCode(input);
                  if (response.status === 'OK') {
                    if (input.session === undefined) {
                      if (response.createdNewRecipeUser && response.user.loginMethods.length === 1) {
                        this.logger.debug('New user signed up with passwordless');
                      } else {
                        this.logger.debug('User logged in with passwordless');
                      }
                    }
                    this.logger.debug('User: ' + JSON.stringify(response.user));
                  }
                  return response;
                },
              };
            },
          },
          smsDelivery: {
            service: new TwilioService({
              twilioSettings: {
                accountSid: this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
                authToken: this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
                from: this.configService.getOrThrow<string>('TWILIO_PHONE_NUMBER'),
              },
            }),
          },
        }),
        Session.init({
          cookieSecure: true,
          exposeAccessTokenToFrontendInCookieBasedAuth: true,
          override: {
            functions: (originalImplementation) => {
              return {
                ...originalImplementation,
                createNewSession: async function (input) {
                  const restaurants = await this.getUserRestaurants(input.userId);
                  const locationIds = await this.getLocationIds(restaurants);

                  input.accessTokenPayload = {
                    ...input.accessTokenPayload,
                    ob_restaurantId: restaurants,
                    ob_locationId: locationIds,
                  };
                  this.logger.debug('Creating session with claims:', {
                    userId: input.userId,
                    restaurants,
                    locationIds,
                  });

                  return originalImplementation.createNewSession(input);
                }.bind(this),
              };
            },
          },
        }),
        //todo check
        // Session.init({
        //   cookieSecure: true,
        //   override: {
        //     functions: (originalImplementation) => {
        //       return {
        //         ...originalImplementation,
        //         createNewSession: async function (input) {
        //           const restaurants = await this.getUserRestaurants(input.userId);
        //           const locationIds = await this.getLocationIds(restaurants);

        //           // Create custom JWT payload
        //           const jwtPayload = {
        //             userId: input.userId,
        //             restaurants,
        //             locationIds,
        //             iat: Math.floor(Date.now() / 1000),
        //           };

        //           // Create JWT with 15 minutes validity
        //           const jwtResponse = await Session.createJWT({
        //             payload: jwtPayload,
        //             validity: 60 * 15, // 15 minutes
        //             useStaticSigningKey: false,
        //           });

        //           if (jwtResponse.status === 'OK') {
        //             this.logger.debug('JWT created successfully');

        //             // Add JWT and other claims to access token payload
        //             input.accessTokenPayload = {
        //               ...input.accessTokenPayload,
        //               ob_restaurantId: restaurants,
        //               ob_locationId: locationIds,
        //               jwt: jwtResponse.jwt, // Include JWT in access token
        //             };

        //             this.logger.debug('Creating session with claims:', {
        //               userId: input.userId,
        //               restaurants,
        //               locationIds,
        //             });

        //             return originalImplementation.createNewSession(input);
        //           } else {
        //             this.logger.error('JWT creation failed:', jwtResponse.status);
        //             return originalImplementation.createNewSession(input);
        //           }
        //         }.bind(this),
        //       };
        //     },
        //   },
        // }),
      ],
    });
  }

  private async getUserRestaurants(userId: string): Promise<string[]> {
    try {
      const user = await this.usersCollection.findOne({ userId }, { projection: { restaurants: 1 } });

      this.logger.debug('Found user restaurants:', {
        userId,
        restaurants: user?.restaurants || [],
      });

      return user?.restaurants || [];
    } catch (error) {
      this.logger.error('Error getting user restaurants:', error);
      return [];
    }
  }

  private async getLocationIds(restaurantIds: string[]): Promise<string[]> {
    try {
      const locations = await this.locationsCollection
        .find({ restaurantId: { $in: restaurantIds } })
        .project({ _id: 1 })
        .toArray();

      return locations.map((loc) => loc._id.toString());
    } catch (error) {
      this.logger.error('Error getting location IDs:', error);
      return [];
    }
  }
  // async createCustomJWT(payload: any, validitySeconds: number = 900): Promise<string | undefined> {
  //   try {
  //     const response = await Session.createJWT({
  //       payload,
  //       validity: validitySeconds,
  //       useStaticSigningKey: false,
  //     });

  //     if (response.status === 'OK') {
  //       this.logger.debug('JWT created successfully');
  //       return response.jwt;
  //     }

  //     if (response.status === 'UNSUPPORTED_ALGORITHM_ERROR') {
  //       this.logger.error('JWT creation failed: Unsupported algorithm');
  //       return undefined;
  //     }

  //     return undefined;
  //   } catch (error) {
  //     this.logger.error('Error creating JWT:', error);
  //     throw error;
  //   }
  // }
}
