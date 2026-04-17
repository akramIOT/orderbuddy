import { Controller, Get, Param, Res, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { OrderHistoryDto, SalesItemDto,SalesOriginDto } from './dto/reports.dto';
import { Response } from 'express';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/order_history/:restaurantId/:locationId/:date')
  async getHistoryOrders(@Param() params: OrderHistoryDto, @Res() res: Response) {
    try {
      const orders = await this.reportService.getHistoryOrders(params.restaurantId, params.locationId, params.date);
      return res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/sales_summary/:restaurantId/:locationId')
  async getSalesSummary(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Res() res: Response,
  ) {
    try {
      const salesData = await this.reportService.getSalesSummary(restaurantId, locationId);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: salesData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/sales_by_item/:restaurantId/:locationId/:date')
  async getSalesByItem(
    @Param() params: SalesItemDto,
    @Res() res: Response,
  ) {
    try {
      const salesData = await this.reportService.getSalesByItem(params.restaurantId, params.locationId, params.date);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: salesData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Get('/sales_by_origin/:restaurantId/:locationId/:date')
  async getSalesByOrigin(
    @Param() params: SalesOriginDto,
    @Res() res: Response,
  ) {
    try {
      const salesData = await this.reportService.getSalesByOrigin(params.restaurantId, params.locationId, params.date);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: salesData,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

