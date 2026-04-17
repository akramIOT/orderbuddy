import { Controller, Get, Param, Res, HttpStatus, UseGuards, Body, Post, Query, Req } from '@nestjs/common';
import { Response } from 'express';
import { StationsService } from './stations.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiResponse } from '../models/api-response';
import {
  CreateStationDto,
  GetStationOrderParamsDto,
  GetStationsParamsDto,
  StationDto,
  StationOrderResponseDto,
  UpdateOrderItemDto,
} from './dto/create-station.dto';
import { logger } from '../logger/pino.logger';

@UseGuards(AuthGuard)
@Controller('stations')
export class StationsController {
  private readonly logger: typeof logger;

  constructor(private readonly stationsService: StationsService) {
    this.logger = logger.child({ context: 'StationsController' });
  }

  @Post()
  async createStation(
    @Body() createStationDto: CreateStationDto,
    @Res() res: Response
  ): Promise<Response<ApiResponse<StationDto>>> {
    try {
      const station = await this.stationsService.createStation(createStationDto);
      return res.status(HttpStatus.CREATED).json({
        data: station,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get(':restaurantId/:locationId')
  async getStations(
    @Param() params: GetStationsParamsDto,
    @Res() res: Response
  ): Promise<Response<ApiResponse<StationDto[]>>> {
    try {
      const stations = await this.stationsService.getStations(params.restaurantId, params.locationId);

      return res.status(HttpStatus.OK).json({
        data: stations,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get(':restaurantId/:locationId/:stationId/orders')
  async getOrdersByStationId(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Param('stationId') stationId: string,
    @Res() res: Response
  ): Promise<Response<ApiResponse<any>>> {
    try {
      const result = await this.stationsService.getOrdersByStationId(restaurantId, locationId, stationId);

      return res.status(HttpStatus.OK).json({
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  @Get(':restaurantId/:locationId/orders/:orderId')
  async getStationSingleOrder(
    @Param() params: GetStationOrderParamsDto,
    @Query('stationTags') stationTagsStr: string,

    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<ApiResponse<StationOrderResponseDto>>> {
    const correlationId = req['requestId'];

    try {
      this.logger.trace(
        {
          module: 'stations',
          event: 'fetch-station-order',
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          orderId: params.orderId,
          correlationId,
        },
        'Get station order'
      );

      const stationTags = stationTagsStr ? stationTagsStr.split(',') : [];

      const order = await this.stationsService.getStationSingleOrder(
        params.restaurantId,
        params.locationId,
        params.orderId,
        stationTags
      );

      return res.status(HttpStatus.OK).json({
        data: order,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'stations',
          event: 'fetch-station-order-error',
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          orderId: params.orderId,
          correlationId,
        },
        'Exception - get station order',
        error
      );
      this.logger.trace(
        {
          module: 'stations',
          event: 'fetch-station-order-error',
          restaurantId: params.restaurantId,
          locationId: params.locationId,
          orderId: params.orderId,
          correlationId,
        },
        'Exception - get station order'
      );
      throw error;
    }
  }

  @Post('order-item')
  async updateOrderItem(
    @Body() updateOrderItemDto: UpdateOrderItemDto,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<ApiResponse<boolean>>> {
    const correlationId = req['requestId'];
    try {
      this.logger.trace(
        {
          module: 'stations',
          event: 'update-order-item',
          orderId: updateOrderItemDto.orderId,
          itemId: updateOrderItemDto.itemId,
          status: updateOrderItemDto.orderItemStatus,
          correlationId,
        },
        `Order item -${updateOrderItemDto.orderItemStatus}`
      );
      const result = await this.stationsService.updateOrderItem(updateOrderItemDto);
      console.debug(result);
      if (!result) {
        this.logger.trace(
          {
            module: 'stations',
            event: 'update-order-item-not-found',
            orderId: updateOrderItemDto.orderId,
            itemId: updateOrderItemDto.itemId,
            status: updateOrderItemDto.orderItemStatus,
            correlationId,
          },
          `Order item  failed to - ${updateOrderItemDto.orderItemStatus} `
        );
      }
      return res.status(HttpStatus.OK).json({
        data: result,
        message: `Order item ${updateOrderItemDto.orderItemStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      this.logger.error(
        {
          module: 'stations',
          event: 'update-order-item-error',
          orderId: updateOrderItemDto.orderId,
          itemId: updateOrderItemDto.itemId,
          status: updateOrderItemDto.orderItemStatus,
          correlationId,
        },
        `Exception - Order item  failed to - ${updateOrderItemDto.orderItemStatus} `
      );
      this.logger.trace(
        {
          module: 'stations',
          event: 'update-order-item-error',
          orderId: updateOrderItemDto.orderId,
          itemId: updateOrderItemDto.itemId,
          status: updateOrderItemDto.orderItemStatus,
          correlationId,
        },
        `Exception - Order item  failed to - ${updateOrderItemDto.orderItemStatus} `
      );
      throw error;
    }
  }
}
