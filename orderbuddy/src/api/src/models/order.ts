import { ObjectId } from 'mongodb';

export class Order {
  paymentId!: string;
  restaurantId!: string;
  orderCode!: string; // Add the orderCode field
  station!: Station;
  customer!: Customer;
  items!: OrderItem[];
  startedAt!: Date;
  endedAt?: Date;
  waitTimeInMinutes!: number;
  status!: string;
  totalPriceCents!: number;
  isTakeaway!: boolean;
  getSms!: boolean;
}

export class Customer {
  name!: string;
  phone!: string;
}

export class Station {
  id!: ObjectId | string;
  name!: string;
}
export class OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCents: number;
  notes?: string;
  public modifiers?: any[];
  public variants?: any[];
  public stationTags?: string[];
  public startedAt: Date;
  public completedAt: Date;

  constructor(
    id: string,
    menuItemId: string,
    name: string,
    price: number,
    startedAt: Date,
    completedAt: Date,
    modifiers?: any[],
    variants?: any[],
    stationTags?: string[],
    notes?: string,
  ) {
    this.id = id;
    this.menuItemId = menuItemId;
    this.name = name;
    this.priceCents = price;
    this.modifiers = modifiers;
    this.variants = variants;
    this.stationTags = stationTags;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.notes = notes;
  }
}

export class OrderResponse {
  orderId!: ObjectId;
  orderTime!: Date;
  waitingTime!: number;
  status!: string;
}

export class StatusResponse {
  orderTime!: Date;
  waitingTime!: number;
  status!: string;
}
