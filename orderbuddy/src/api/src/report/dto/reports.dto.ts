import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderHistoryDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}

export class SalesItemDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}

export class SalesByItemResponse {
  @IsNotEmpty()
  @IsString()
  menuItemId: string;

  @IsNotEmpty()
  @IsString()
  itemName: string;

  @IsNotEmpty()
  @IsNumber()
  soldCount: number;

  @IsNotEmpty()
  @IsNumber()
  grossSales: number;
}
export class SalesOriginDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}
export class SalesByOriginResponse {
  @IsNotEmpty()
  @IsString()
  originId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  soldCount: number;

  @IsNotEmpty()
  @IsNumber()
  grossSales: number;
}
