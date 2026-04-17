import { Controller, Get, Param, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PosService } from './pos.service';
import { GetMenuParamDto, GetMenusParamDto, MenuDto, MenuSummaryDto } from './dto/create-po.dto';
import { ApiResponse } from '../models/api-response';
import { AuthGuard } from '../auth/auth.guard';
@UseGuards(AuthGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('/:restaurantId/locations/:locationId/menus')
  async getMenus(
    @Param() params: GetMenusParamDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<MenuSummaryDto[]>>> {
    const menus = await this.posService.getMenus(params.restaurantId, params.locationId);
    return res.status(HttpStatus.OK).json({ data: menus });
  }

  // menu page
  @Get('/:restaurantId/locations/:locationId/menus/:menuId')
  async getMenu(@Param() params: GetMenuParamDto, @Res() res: Response): Promise<Response<ApiResponse<MenuDto>>> {
    const menu = await this.posService.getMenu( params.menuId);
    return res.status(HttpStatus.OK).json({ data: menu });
  }
}
