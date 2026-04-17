import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { GetOrderInfoDto, RestaurantResponseDto } from './dtos/menu.controller.dto';
import { MenuService } from './menu.service';
import { OrderAppService } from '../order-app/order-app.service';

import _ from 'lodash';
import { GetRestaurantInfoDto } from '../restaurant/dto/restaurant.dto';
import { ApiResponse } from '../models/api-response';
import { CreateOrderDto } from '../payments/dtos/payments.controller.dto';
import { CreateOrderFromPreviewDto } from './dtos/create-order-from-preview.dto';
import { logger } from '../logger/pino.logger';

@Controller('menu-app/')
export class MenuController {
  private readonly logger: typeof logger;

  constructor(
    private readonly menuService: MenuService,
    private readonly orderAppService: OrderAppService,
  ) {
    this.logger = logger.child({ context: 'MenuController' });
  }

  @Get('/:restauranId')
  async getRestaurantById(
    @Param() params: GetRestaurantInfoDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<RestaurantResponseDto>>> {
    const restaurant = await this.menuService.getRestaurantById(params.restauranId);

    if (!restaurant) throw new NotFoundException();
    return res.status(HttpStatus.OK).json({ data: restaurant });
  }

  @Get('/order/:orderId')
  async getOrderStatus(@Param() params: GetOrderInfoDto, @Res() res: Response, @Req() req: Request) {
    const orderId = params.orderId;

    try {
      const orderStatus = await this.menuService.getStatus(orderId);

      return res.status(HttpStatus.OK).json(orderStatus);
    } catch (error) {
      throw error;
    }
  }

  @Post('/restaurant/order')
  async createOrder(@Body() body: CreateOrderDto, @Res() res: Response, @Req() req: Request) {
    const requestId = req['requestId'];
    this.logger.trace(
      {
        module: 'menu',
        event: 'create-order',
        restaurantId: body.restaurantId,
        correlationId: requestId,
      },
      'Creating order with preview order',
    );

    try {
      const previewOrderResult = await this.orderAppService.createPreviewOrder(body, requestId);
      const createOrderFromPreviewDto: CreateOrderFromPreviewDto = {
        previewOrderId: previewOrderResult.previewOrderId,
        paymentId: '', 
      };

      const orderId = await this.menuService.createOrder(createOrderFromPreviewDto, requestId);
      if (!orderId) throw new BadRequestException('Failed to create order');

      res.status(HttpStatus.CREATED).json(orderId);
    } catch (error) {
      this.logger.error(
        {
          module: 'menu',
          event: 'create-order-error',
          restaurantId: body.restaurantId,
          correlationId: requestId,
          error: error.message || error,
        },
        'Failed to create order',
      );

      throw new BadRequestException('Failed to create order: ' + (error.message || error));
    }
  }
}
