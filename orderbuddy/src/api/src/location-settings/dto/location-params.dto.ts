import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class LocationParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  locationId: string;
}
