import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { z } from 'zod';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
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

export const fetchDashboardOrder = async (
  restaurantId: string,
  locationId: string,
  orderId: string,
  correlationId: string
): Promise<Order> => {
  const response = await axiosInstance.get(`/restaurant/orders/${restaurantId}/${locationId}/${orderId}`, {
    headers: {
      'X-Request-Id': correlationId,
    },
  });
  return response.data.data as Order;
};

export const useSingleDashboardOrder = (
  restaurantId?: string,
  locationId?: string,
  orderId?: string,
  correlationId?: string
) => {
  return useQuery({
    queryKey: ['dashboard-order', orderId],
    queryFn: () => fetchDashboardOrder(restaurantId!, locationId!, orderId!, correlationId!),
    enabled: !!restaurantId && !!locationId && !!orderId,
  });
};
