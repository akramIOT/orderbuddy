import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
//request
export class GetStationsParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;
}
export class GetStationOrderParamsDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}
export enum OrderItemStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
}

export class UpdateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsEnum(OrderItemStatus)
  orderItemStatus: OrderItemStatus;
}
//response
export class CreateStationDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  locationId: ObjectId; // ObjectId

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
export class StationDto {
  @IsNotEmpty()
  _id: ObjectId;

  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  locationId: ObjectId; // ObjectId

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class StationOrderResponseDto {
  _id: string;
  status: string;
  startedAt: Date;
  orderCode: string;
  customer: {
    name: string;
    phone: string;
  };
  meta?: {
    correlationId?: string;
  };
  items: {
    id: string;
    menuItemId: string;
    name: string;
    priceCents: number;
    stationTags: string[];
    isStarted?: boolean;
    isCompleted?: boolean;
    variants?: any[];
    modifiers?: any[];
    notes?: string;
  }[];
  totalPriceCents: number;
}
