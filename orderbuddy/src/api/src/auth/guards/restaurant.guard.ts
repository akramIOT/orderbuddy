import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { getSession } from 'supertokens-node/recipe/session';

@Injectable()
export class RestaurantGuard implements CanActivate {
  constructor() {
    this.verifySessionMiddleware = verifySession();
  }
  private readonly logger = new Logger(RestaurantGuard.name);

  private verifySessionMiddleware: any;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      await new Promise((resolve, reject) => {
        this.verifySessionMiddleware(request, response, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });

      const session = await getSession(request, response);
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      const accessTokenPayload = session.getAccessTokenPayload();
      const restaurants = accessTokenPayload.ob_restaurant_Id;
      const requestedRestaurantId = request.params.restaurantId;

      if (!Array.isArray(restaurants) || !restaurants.includes(requestedRestaurantId)) {
        throw new UnauthorizedException('Not authorized for this restaurant');
      }
      this.logger.debug('RestaurantGuard: Authorized for restaurant', requestedRestaurantId);
      request.session = session;
      request.restaurants = restaurants;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
