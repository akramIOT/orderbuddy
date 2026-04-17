import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

//request
export class GetOriginsParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;
}

/// Response
export class OriginDto {
  @IsMongoId()
  _id: ObjectId;

  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: ObjectId;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  qrCodeId: string;

  @IsNotEmpty()
  @IsString()
  qrCode: string;
}

export class OriginsResponseDto {
  qrCodeStyle: any;
  qrCodeImage: any;
  originData: OriginDto[];
}
