import { Controller, Get, Patch, Param, Body, HttpStatus, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { LocationSettingsService } from './location-settings.service';
import { UpdateLocationSettingDto } from './dto/update-location-setting.dto';
import { LocationParamsDto } from './dto/location-params.dto';

@Controller('location-settings')
export class LocationSettingsController {
  constructor(private readonly locationSettingsService: LocationSettingsService) {}

  @Get('restaurant/:restaurantId/location/:locationId')
  async findOne(@Param(ValidationPipe) params: LocationParamsDto, @Res() res: Response) {
    const location = await this.locationSettingsService.findOne(params.locationId, params.restaurantId);
    return res.status(HttpStatus.OK).json({
      data: location,
    });
  }

  @Patch('restaurant/:restaurantId/location/:locationId')
  async update(
    @Param(ValidationPipe) params: LocationParamsDto,
    @Body() updateLocationSettingDto: UpdateLocationSettingDto,
    @Res() res: Response
  ): Promise<any> {
    const result = await this.locationSettingsService.update(
      params.locationId,
      params.restaurantId,
      updateLocationSettingDto,
    );
    return res.status(HttpStatus.OK).json({
      data: result,
    });
  }
}
