import { IsNotEmpty, IsOptional } from 'class-validator';

export interface PaymentRequestBody {
  amount: number;
  currency: string;
}

export class GetStoreInfoDto {
  @IsNotEmpty() restaurantId!: string;
}

export class CreateOrderDto {
  @IsNotEmpty() restaurantId!: string;
  @IsNotEmpty() locationId!: string;
  @IsNotEmpty() locationSlug!: string;
  @IsOptional()
  paymentId?: string;
  @IsNotEmpty() origin!: Origin;
  @IsNotEmpty() customer!: Customer;
  @IsNotEmpty() items!: OrderItemDto[];
  @IsNotEmpty() getSms!: boolean;
  @IsOptional()
  transactionDetails?: any;
  @IsOptional()
  discount?: {
    name: string;
    type: string;
    amountCents: number;
  };
}

export interface Origin {
  id: string;
  name: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface OrderItemDto {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  notes?: string;
  startedAt: Date;
  completedAt: Date;
  modifiers?: any[];
  variants?: any[];
  stationTags?: string[];
}


export class CreateOrderBody {
  @IsNotEmpty() previewOrderId: string;
  @IsNotEmpty() transactionToken: string;
}

export class CreateOrderUpiBody {
  @IsNotEmpty() previewOrderId: string;
  @IsNotEmpty() transactionDetails: any;
}