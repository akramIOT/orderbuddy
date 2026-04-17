import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRestaurantDto {}
export class CreateOrderDto {
  @IsNotEmpty() restaurantId!: string;
  @IsNotEmpty() sessionId!: string;
  @IsOptional()
  paymentId?: string;
  @IsNotEmpty() station!: Station;
  @IsNotEmpty() customer!: Customer;
  @IsNotEmpty() items!: OrderItemDto[];
  @IsNotEmpty() isTakeaway!: boolean;
  @IsNotEmpty() waitTimeInMinutes!: number;
  @IsNotEmpty() getSms!: boolean;
  @IsOptional()
  transactionDetails?: any;
}

export interface Station {
  id: string;
  name: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export type OrderItemDto = {
  isStarted: boolean;
  startedAt: Date;
  isCompleted: boolean;
  completedAt: Date;
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  toppings: string[];
  addons: string[];
  notes: string;
  size: string;
  isTakeaway: boolean;
  displayIds: string[];
};
export class UpdateOrderStatusDto {
  @IsNotEmpty() orderId!: string;
  @IsNotEmpty() orderStatus!: string;
}

export class GetStationsOrdersDto {
  @IsNotEmpty() restaurantId: string;
  @IsNotEmpty() stationId: string;
  @IsNotEmpty() locationId: string;
}
