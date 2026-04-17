import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { format } from 'date-fns';
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

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCents: number;
  notes?: string;
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
  meta: {
    correlationId: string;
  };
  restaurant: string;
  customer: Customer;
  origin: Origin;
  items: OrderItem[];
  startedAt: Date;
  totalPriceCents: number;
  getSms: boolean;
  status: string;
  endedAt?: Date;
}

export function useHistoryOrdersApi(restaurantId: string, locationId: string, selectedDate: string) {
  if (!restaurantId || !locationId) {
    throw new Error('restaurantId and locationId required');
  }

  return useQuery<Order[]>({
    queryKey: ['historyOrders', restaurantId, locationId, selectedDate],
    queryFn: async () => {
      const res = await axiosInstance.get<Order[]>(
        `report/order_history/${restaurantId}/${locationId}/${selectedDate}`,
      );
      if (!res.data) {
        throw new Error('No today orders found');
      }

      const orders = Array.isArray(res.data.sort().reverse()) ? res.data : [];

      return orders;
    },
    enabled: Boolean(restaurantId && locationId),
  });
}
