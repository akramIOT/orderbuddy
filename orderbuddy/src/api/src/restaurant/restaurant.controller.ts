import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import {
  GetCategoryDtoBody,
  GetMenuItemDto,
  GetMenuParamDto,
  GetMenusParamDto,
  GetRestaurantLocationsParamDto,
  GetRestaurantsDto,
  getTodayOrdersDto,
  LocationDto,
  MenuDto,
  MenuSummaryDto,
  RestaurantDto,
  UpdateCategorySortOrderDto,
} from './dto/restaurant.dto';
import { Response } from 'express';
import { UpdateOrderStatusDto } from './dto/create-restaurant.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiResponse } from '../models/api-response';
import { OrderStatus } from '../constants';
import { MessageService } from '../message/message.service';
import { logger } from '../logger/pino.logger';
import { UpdateItemAvailabilityParamDto } from './dto/update-restaurant.dto';
import { RestaurantUpdateDto } from './dto/restaurant-update.dto';
@UseGuards(AuthGuard)
@Controller('restaurant')
export class RestaurantController {
  private readonly logger: typeof logger;

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly messageService: MessageService,
  ) {
    if (!logger) {
      throw new Error('Logger is not initialized');
    }
    this.logger = logger.child({ context: 'RestaurantController' });
  }

  @Get('/:userId')
  async getRestaruntByUserId(
    @Param() params: GetRestaurantsDto,

    @Res() res: Response,
  ): Promise<Response<ApiResponse<RestaurantDto>>> {
    const restaurants = await this.restaurantService.getRestaurants(params.userId);
    return res.status(HttpStatus.OK).json({ data: restaurants });
  }

  @Post('/create/:userId')
  async createRestaurant(
    @Param('userId') userId: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<{ restaurant: RestaurantDto }>>> {
    const requestId = req['requestId'];

    try {
      const result = await this.restaurantService.createRestaurant(userId);
      return res.status(HttpStatus.CREATED).json({
        data: result,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'create_restaurant',
          correlationId: requestId,
          error: error.message,
          userId,
        },
        'Error creating restaurant',
      );
      throw new BadRequestException(error.message);
    }
  }

  // @RequireRestaurant() //restaurant.guard.ts
  @Get('/restaurants/:restaurantId/locations')
  async getRestaurantLocations(
    @Param() params: GetRestaurantLocationsParamDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<LocationDto[]>>> {
    //         const restaurants = req.restaurants;
    try {
      const locations = await this.restaurantService.getRestaurantLocations(params.restaurantId);
      return res.status(HttpStatus.OK).json({
        data: locations,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('/:restaurantId/location/create')
  async createLocation(
    @Param('restaurantId') restaurantId: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<LocationDto>>> {
    const requestId = req['requestId'];

    try {
      const location = await this.restaurantService.createLocation(restaurantId);

      return res.status(HttpStatus.CREATED).json({
        data: location,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'create_location',
          correlationId: requestId,
          error: error.message,
          restaurantId,
        },
        'Error creating location',
      );
      throw new BadRequestException(error.message);
    }
  }

  @Get('/orders/today/:restaurantId/:locationId')
  async getOrders(@Param() params: getTodayOrdersDto, @Res() res: Response, @Req() req: Request) {
    const requestId = req['requestId'];
    try {
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'get_today_orders',
          correlationId: requestId,
          restaurantId: params.restaurantId,
          locationId: params.locationId,
        },
        'Get today orders',
      );
      const orders = await this.restaurantService.getTodayOrders(params.restaurantId, params.locationId);
      return res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'get_today_orders',
          correlationId: requestId,
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          error: error.message,
        },
        'Exception - get today orders',
      );
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'get_today_orders',
          correlationId: requestId,
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          error: error.message,
        },
        'Exception - get today orders',
      );
      throw new BadRequestException(error.message);
    }
  }

  @Get('orders/:restaurantId/:locationId/:orderId')
  async getSingleOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Param('orderId') orderId: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<any>>> {
    const requestId = req['requestId'];

    try {
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'get_single_order',
          correlationId: requestId,
          orderId,
          restaurantId,
          locationId,
        },
        'Getting single order',
      );

      const order = await this.restaurantService.getSingleOrder(restaurantId, locationId, orderId);

      return res.status(HttpStatus.OK).json({
        data: order,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'get_single_order',
          correlationId: requestId,
          error: error.message,
        },
        'Error fetching single order',
      );
      throw error;
    }
  }
  @Post('order-status')
  async updateOrderStatus(
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const correlationId = req['requestId'];
    try {
      if (updateOrderStatusDto.orderStatus !== OrderStatus.OrderAccepted) {
        this.logger.trace(
          {
            module: 'restaurant',
            event: 'update_order_status',
            correlationId,
            orderId: updateOrderStatusDto.orderId,
            status: updateOrderStatusDto.orderStatus,
          },
          `Order - ${updateOrderStatusDto.orderStatus}`,
        );
      }

      const order = await this.restaurantService.getOrder(updateOrderStatusDto.orderId);
      if (!order) throw new NotFoundException();

      const restaurantAck = await this.restaurantService.updateOrderStatus(
        updateOrderStatusDto.orderId,
        updateOrderStatusDto.orderStatus,
        correlationId,
      );
      const restaurant = await this.restaurantService.getRestaurantById(order.restaurantId);
      if (!restaurant) throw new NotFoundException();

      if (updateOrderStatusDto.orderStatus === OrderStatus.ReadyForPickup) {
        const orderNumber = updateOrderStatusDto.orderId.toString().slice(-4).toUpperCase();
        const message = `OrderBuddy-${restaurant.name}: your order #${orderNumber} is ready for pickup`;

        if (order.customer.phone) {
          try {
            const result = await this.messageService.sendMessage(order.customer.phone, message);
            if (!result) {
              throw new Error(' Failed to notify ready for pickup');
            }
            this.logger.trace(
              {
                module: 'restaurant',
                event: 'send_notification',
                correlationId,
                orderId: order.id,
                phone: order.customer.phone,
              },
              'Ready for pickup notified to customer',
            );
          } catch (messageError) {
            this.logger.error(
              {
                module: 'restaurant',
                event: 'send_notification',
                error: messageError.message,
                correlationId,
                orderId: order.id,
                phone: order.customer.phone,
              },
              'Exception - Failed to notify ready for pickup',
            );
            this.logger.trace(
              {
                module: 'restaurant',
                event: 'send_notification',
                correlationId,
                orderId: order.id,
                phone: order.customer.phone,
              },
              'Exception - Failed to notify ready for pickup',
            );
          }
        }
      }

      return res.status(HttpStatus.OK).json(restaurantAck);
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'update_order_status',
          correlationId,
          error: error.message,
        },
        `Exception - Failed to update ${updateOrderStatusDto.orderStatus}`,
      );
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'update_order_status',
          correlationId,
          orderId: updateOrderStatusDto.orderId,
          status: updateOrderStatusDto.orderStatus,
        },
        `Exception - Failed to update ${updateOrderStatusDto.orderStatus}`,
      );
      throw error;
    }
  }

  @Get('restaurants/:restaurantId/locations/:locationId/menus')
  async getMenus(
    @Param() params: GetMenusParamDto,

    @Res() res: Response,
  ): Promise<Response<ApiResponse<MenuSummaryDto[]>>> {
    const menus = await this.restaurantService.getMenus(params.restaurantId, params.locationId);
    return res.status(HttpStatus.OK).json({ data: menus });
  }

  @Get('restaurants/:restaurantId/locations/:locationId/menus/:menuId')
  async getMenu(
    @Param() params: GetMenuParamDto,

    @Res() res: Response,
  ): Promise<Response<ApiResponse<MenuDto>>> {
    const menu = await this.restaurantService.getMenu(params.restaurantId, params.locationId, params.menuId);
    return res.status(HttpStatus.OK).json({ data: menu });
  }
  @Post(':restaurantId/location/:locationId/menu/:menuId/category')
  async upsertCategory(
    @Param() params: GetMenuParamDto,

    @Body() category: GetCategoryDtoBody,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<boolean>>> {
    const result = await this.restaurantService.upsertCategory(
      params.restaurantId,
      params.locationId,
      params.menuId,
      category,
    );

    return res.status(HttpStatus.OK).json({
      data: result.acknowledged,
    });
  }
  @Post(':restaurantId/location/:locationId/menu/:menuId/item')
  async upsertMenuItem(
    @Param() params: GetMenuParamDto,
    @Body() item: GetMenuItemDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<boolean>>> {
    const result = await this.restaurantService.upsertMenuItem(
      params.restaurantId,
      params.locationId,
      params.menuId,
      item,
    );

    return res.status(HttpStatus.OK).json({
      data: result.acknowledged,
    });
  }
  @Post(':restaurantId/location/:locationId/menu/:menuId/category/sort-order')
  async updateCategorySortOrder(
    @Param() params: GetMenuParamDto,
    @Body() updateData: UpdateCategorySortOrderDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<boolean>>> {
    const result = await this.restaurantService.updateCategorySortOrder(
      params.restaurantId,
      params.locationId,
      params.menuId,
      updateData.categoryId,
      updateData.sortOrder,
    );

    return res.status(HttpStatus.OK).json({
      data: result.acknowledged,
    });
  }

  @Patch(':restaurantId/location/:locationId/menu/:menuId/item/:itemId/availability')
  async updateItemAvailability(
    @Param() params: UpdateItemAvailabilityParamDto,

    @Body() body: { isAvailable: boolean },
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<boolean>>> {
    const requestId = req['requestId'];

    try {
      const result = await this.restaurantService.updateItemAvailability(
        params.restaurantId,
        params.locationId,
        params.menuId,
        params.itemId,
        body.isAvailable,
      );

      return res.status(HttpStatus.OK).json({
        data: result,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'update_item_availability',
          correlationId: requestId,
          error: error.message,
        },
        'Error updating menu item availability',
      );
      throw error;
    }
  }

  @Get('restaurants/:restaurantId/locationId/:locationId/restaurantDetails')
  async getRestaurantDetails(
    @Param() params: GetMenusParamDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<any>>> {
    const requestId = req['requestId'];

    try {
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'get_restaurant_details',
          correlationId: requestId,
          restaurantId: params.restaurantId,
          locationId: params.locationId,
        },
        'Getting restaurant details',
      );

      const restaurant = await this.restaurantService.getRestaurantDetails(params.restaurantId, params.locationId);

      return res.status(HttpStatus.OK).json({
        data: restaurant,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'get_restaurant_details',
          correlationId: requestId,
          error: error.message,
        },
        'Error fetching restaurant details',
      );

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }

  @Patch('restaurants/:restaurantId/locationId/:locationId/update-restaurantDetails')
  async updateRestaurantDetails(
    @Param() params: GetMenusParamDto,
    @Body() updateDto: RestaurantUpdateDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response<ApiResponse<any>>> {
    const requestId = req['requestId'];

    try {
      this.logger.trace(
        {
          module: 'restaurant',
          event: 'update_restaurant_details',
          correlationId: requestId,
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          updateData: updateDto,
        },
        'Updating restaurant details',
      );

      const result = await this.restaurantService.updateRestaurantDetails(
        params.restaurantId,
        params.locationId,
        updateDto,
      );

      return res.status(HttpStatus.OK).json({
        data: result,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'restaurant',
          event: 'update_restaurant_details',
          correlationId: requestId,
          error: error.message,
        },
        'Error updating restaurant details',
      );

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
