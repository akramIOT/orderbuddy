import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RestaurantGuard } from '../guards/restaurant.guard';

export function RequireRestaurant() {
  return applyDecorators(UseGuards(RestaurantGuard));
}
