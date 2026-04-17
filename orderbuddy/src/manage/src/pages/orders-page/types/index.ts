export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  notes?: string; 
  priceCents: number;
  modifiers: Modifier[];
  variants: Variant[];
  stationTags: string[];
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface Order {
  _id: string;
  orderCode: string; 
  paymentId: string;
  restaurant: string;
  meta: {
    correlationId: string;
  };
  customer: Customer;
  origin: Origin;
  items: OrderItem[];
  startedAt: Date;
  totalPriceCents: number;
  getSms: boolean;
  status: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface Origin {
  id: string;
  name: string;
}
export interface Variant {
  id: string;
  name: string;
}

export interface Modifier {
  id: string;
  name: string;
  options?: Array<{
    id: string;
    name: string;
    priceCents?: number;
  }>;
}
