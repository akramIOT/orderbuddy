import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RestaurantUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  concept?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  tagline?: string;
  
  @IsOptional()
  @IsString()
  website?: string;
}

export class RestaurantUpdateParamDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}
