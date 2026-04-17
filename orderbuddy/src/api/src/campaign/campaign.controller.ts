import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, Req, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignParams, CampaignParamsWithId, CreateCampaignDto } from './dto/create-campaign.dto';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
@UseGuards(AuthGuard)
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post('restaurant/:restaurantId/location/:locationId')
  createCampaign(
    @Param() params: CampaignParams,
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('authorization') authHeader: string,
    @Req() request: Request,
  ) {
    const campaignWithLocation = {
      ...createCampaignDto,
      restaurantId: params.restaurantId,
      locationId: params.locationId,
    };
    const authToken = authHeader || request.headers.authorization;
    return this.campaignService.createCampaign(params.restaurantId, params.locationId, campaignWithLocation, authToken);
  }

  @Get('restaurant/:restaurantId/location/:locationId')
  findByRestaurantAndLocationId(@Param() params: CampaignParams) {
    return this.campaignService.findByRestaurantAndLocationId(params.restaurantId, params.locationId);
  }

  @Get('restaurant/:restaurantId/location/:locationId/:campaignId/summary')
  async getCampaignSummary(
    @Param() params: CampaignParamsWithId,
  ) {
    return this.campaignService.getCampaignSummary(params.restaurantId, params.locationId, params.campaignId);
  }
}
