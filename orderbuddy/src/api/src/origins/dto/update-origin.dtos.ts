import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateQrStyleParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;
}

class QrOptions {
  @IsNumber()
  typeNumber: number;

  @IsString()
  errorCorrectionLevel: string;
}

class ImageOptions {
  @IsNotEmpty()
  hideBackgroundDots: boolean;

  @IsNumber()
  imageSize: number;

  @IsNumber()
  margin: number;

  @IsString()
  crossOrigin: string;
}

class DotsOptions {
  @IsString()
  color: string;

  @IsString()
  type: string;
}

class BackgroundOptions {
  @IsString()
  color: string;
}

class CornersOptions {
  @IsString()
  color: string;

  @IsString()
  type: string;
}

export class QrCodeStyleDto {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  type: string;

  @IsString()
  data: string;

  @IsNumber()
  margin: number;

  @ValidateNested()
  @Type(() => QrOptions)
  qrOptions: QrOptions;

  @ValidateNested()
  @Type(() => ImageOptions)
  imageOptions: ImageOptions;

  @IsOptional()
  @IsString()
  image?: string;

  @ValidateNested()
  @Type(() => DotsOptions)
  dotsOptions: DotsOptions;

  @ValidateNested()
  @Type(() => BackgroundOptions)
  backgroundOptions: BackgroundOptions;

  @ValidateNested()
  @Type(() => CornersOptions)
  cornersSquareOptions: CornersOptions;

  @ValidateNested()
  @Type(() => CornersOptions)
  cornersDotOptions: CornersOptions;

  @IsString()
  shape: string;
}

export class UpdateQrStyleDto {
  @ValidateNested()
  @Type(() => QrCodeStyleDto)
  qrCodeStyle: QrCodeStyleDto;

  @IsString()
  qrCodeImage: string;
}
export interface QrCodeStyle {
  width: number;
  height: number;
  type: string;
  data: string;
  margin: number;
  qrOptions: {
    typeNumber: number;
    errorCorrectionLevel: string;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    crossOrigin: string;
  };
  image?: string;
  dotsOptions: {
    color: string;
    type: string;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    color: string;
    type: string;
  };
  cornersDotOptions: {
    color: string;
    type: string;
  };
  shape: string;
}
