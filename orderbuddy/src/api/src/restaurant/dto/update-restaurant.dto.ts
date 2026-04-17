import { IsString, IsBoolean } from 'class-validator';

export class UpdateItemAvailabilityParamDto {
  @IsString()
  restaurantId: string;

  @IsString()
  locationId: string;

  @IsString()
  menuId: string;

  @IsString()
  itemId: string;
}

export class UpdateItemAvailabilityBodyDto {
  @IsBoolean()
  isAvailable: boolean;
}
