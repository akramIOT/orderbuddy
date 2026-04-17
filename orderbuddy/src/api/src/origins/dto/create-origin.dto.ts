import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

//request

export class CreateOriginsParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;
}

export class OriginsParamsDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsEnum(['table', 'parking', 'campaign'])
  type: 'table' | 'parking' | 'campaign';
}

// Response
export class LogoUploadParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
  @IsNotEmpty()
  @IsString()
  locationId: string;
}

export class SendQrCodeLinkParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  originId: string;
}
export class CreateOriginDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  qrCode: string;

  @IsNotEmpty()
  @IsString()
  qrCodeId: string;

  @IsEnum(['table', 'parking', 'campaign'])
  type: 'table' | 'parking' | 'campaign';
}
