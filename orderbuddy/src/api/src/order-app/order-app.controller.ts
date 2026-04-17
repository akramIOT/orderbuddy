import {
  Controller,
  Get,
  Post,
  Param,
  Body,

  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { OrderAppService } from './order-app.service';
import { ApiResponse } from '../models/api-response';
import {
  CheckoutFormDto,
  GetMenuParamDto,
  GetMenusParamDto,
  GetOrderStatusParamDto,
  MenuDto,
  MenuSummaryDto,
  OrderConfirmationDto,
  OrderStatusDto,
  RestaurantDto,
  LocationDto,
  OriginDto,
  CampaignDto,
  CreateOrderDto,
} from './dtos/order-app.controller.dto';

@Controller('order-app')
export class OrderAppController {
  constructor(private readonly orderAppService: OrderAppService) {}

  // Get restaurant info
  @Get('restaurants/:restaurantId')
  async getRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<RestaurantDto>>> {
    const restaurant = await this.orderAppService.getRestaurant(restaurantId);
    return res.status(HttpStatus.OK).json({ data: restaurant });
  }

  // Get location info
  @Get('restaurants/:restaurantId/locations/:locationId')
  async getLocation(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<LocationDto>>> {
    const location = await this.orderAppService.getLocation(restaurantId, locationId);
    return res.status(HttpStatus.OK).json({ data: location });
  }

  // Get origin info
  @Get('restaurants/origins/:originId')
  async getOrigin(
    @Param('originId') originId: string,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<OriginDto>>> {
    const origin = await this.orderAppService.getOrigin(originId);
    return res.status(HttpStatus.OK).json({ data: origin });
  }

  // Get campaign info
  @Get('restaurants/:restaurantId/locations/:locationId/origins/:originId/campaign')
  async getCampaign(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Param('originId') originId: string,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<CampaignDto>>> {
    const campaign = await this.orderAppService.getCampaign(restaurantId, locationId, originId);
    return res.status(HttpStatus.OK).json({ data: campaign });
  }

  // entry page -> menus
  @Get('restaurants/:restaurantId/locations/:locationId/menus')
  async getMenus(
    @Param() params: GetMenusParamDto,

    @Res() res: Response,
  ): Promise<Response<ApiResponse<MenuSummaryDto[]>>> {
    const menus = await this.orderAppService.getMenus(params.restaurantId, params.locationId);
    return res.status(HttpStatus.OK).json({ data: menus });
  }

  // menu page
  @Get('restaurants/:restaurantId/locations/:locationId/menus/:menuId')
  async getMenu(
    @Param() params: GetMenuParamDto,

    @Res() res: Response,
  ): Promise<Response<ApiResponse<MenuDto>>> {
    const menu = await this.orderAppService.getMenu(params.restaurantId, params.locationId, params.menuId);
    return res.status(HttpStatus.OK).json({ data: menu });
  }

  // Create preview order
  @Post('cart/preview-order')
  async createPreviewOrder(
    @Body()
    body: CreateOrderDto,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<ApiResponse<{ previewOrderId: string; totalPriceCents: number }>>> {
        const requestId = req['requestId'];

    const result = await this.orderAppService.createPreviewOrder(body,requestId);
    return res.status(HttpStatus.OK).json({ data: result });
  }

  // Checkout
  @Post('checkout')
  checkout(@Body() dto: CheckoutFormDto): Promise<OrderConfirmationDto> {
    return this.orderAppService.checkout(dto);
  }

  // Order Status
  @Get('orders/:orderId/status')
  getOrderStatus(@Param() params: GetOrderStatusParamDto): Promise<OrderStatusDto> {
    return this.orderAppService.getOrderStatus(params.orderId);
  }
}
