import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
  Put,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OriginsService } from './origins.service';
import {
  CreateOriginsParamsDto,
  LogoUploadParamsDto,
  OriginsParamsDto,
  SendQrCodeLinkParamsDto,
} from './dto/create-origin.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetOriginsParamsDto, OriginDto, OriginsResponseDto } from './dto/get-origin.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { ApiResponse } from '../models/api-response';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as QC from 'qrcode';
import { UpdateQrStyleParamsDto, UpdateQrStyleDto } from './dto/update-origin.dtos';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard)
@ApiTags('Origins')
@Controller('origins')
export class OriginsController {
  constructor(
    private readonly originsService: OriginsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':restaurantId/:locationId')
  async findAll(
    @Param() params: GetOriginsParamsDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<OriginsResponseDto>>> {
    const originsResponse = await this.originsService.findAllOrigins(params.restaurantId, params.locationId);
    return res.status(HttpStatus.OK).json({
      data: originsResponse,
    });
  }

  @Post(':restaurantId/:locationId')
  async create(
    @Param() params: CreateOriginsParamsDto,
    @Body() createOriginDto: OriginsParamsDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<OriginDto>>> {
    try {
      const menuEndPoint = this.configService.get<string>('MENU_ENDPOINT');
      const smartScanUrl = this.configService.get<string>('SMART_SCAN_URL');

      if (!menuEndPoint || !smartScanUrl) {
        throw new BadRequestException('Missing configuration');
      }

      const restaurant = await this.originsService.getRestaurantDetails(params.restaurantId);
      if (!restaurant) {
        throw new BadRequestException('Restaurant not found');
      }
      const location = await this.originsService.getLocationDetails(params.restaurantId, params.locationId);
      if (!location) {
        throw new BadRequestException('Location not found');
      }
      const origin = await this.originsService.createOrigin(params.restaurantId, params.locationId, {
        name: createOriginDto.name,
        qrCode: '',
        qrCodeId: '',
        type: createOriginDto.type,
      });

      const redirectUrl =
        `${menuEndPoint}/entry/${origin._id}?name=${encodeURIComponent(restaurant.name)}`;

      const { data, status } = await firstValueFrom(
        this.httpService.post(`${smartScanUrl}/add-qrdata`, {
          redirectUrl: redirectUrl,
        }),
      );

      if (status !== HttpStatus.CREATED) {
        throw new BadRequestException('Failed to create origin QR code');
      }

      const tinyUrl = `${data}`;
      const qrcode = await QC.toDataURL(tinyUrl);

      const updatedOrigin = await this.originsService.updateOrigin(origin._id, {
        qrCode: qrcode,
        qrCodeId: tinyUrl,
      });

      return res.status(HttpStatus.CREATED).json({
        data: updatedOrigin,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create origin: ' + error.message);
    }
  }

  @Put(':restaurantId/:locationId/qr-style')
  async updateQrStyle(
    @Param() params: UpdateQrStyleParamsDto,
    @Body() updateQrStyleDto: UpdateQrStyleDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<void>>> {
    try {
      await this.originsService.updateQrStyle(params.restaurantId, params.locationId, updateQrStyleDto);

      return res.status(HttpStatus.OK).json({
        data: null,
        message: 'QR style updated successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to update QR style: ' + error.message);
    }
  }

  @Post(':restaurantId/:locationId/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param() params: LogoUploadParamsDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<string>>> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const imageUrl = await this.originsService.uploadLogo(file, params.restaurantId);

      return res.status(HttpStatus.OK).json({
        data: imageUrl,
        message: 'Logo uploaded successfully',
      });
    } catch (error) {
      throw new BadRequestException('Failed to upload logo: ' + error.message);
    }
  }

  @Post(':restaurantId/:locationId/send-link/:originId')
  async sendQrCodeLink(
    @Param() params: SendQrCodeLinkParamsDto,
    @Res() res: Response,
  ): Promise<Response<ApiResponse<void>>> {
    try {
      await this.originsService.sendQrCodeLink(params.restaurantId, params.locationId, params.originId);

      return res.status(HttpStatus.OK).json({
        data: null,
        message: 'QR code link sent successfully via email',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to send QR code link: ' + error.message);
    }
  }
}
