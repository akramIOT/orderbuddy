import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { logExceptionError } from '../utils/errorLogger';
import { client } from '../Client';
import { fetchDashboardOrder } from './dashboard/useSingleDasboardOrder';
import { OrderStatus } from '../constants';

interface Customer {
  name: string;
  phone: string;
}

interface Origin {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
}

interface Modifier {
  id: string;
  name: string;
  options?: Array<{
    id: string;
    name: string;
    priceCents?: number;
  }>;
}

interface OrderItem {
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

interface Order {
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
interface OrderStatusInfo {
  orderId: string;
  orderStatus: string;
  correlationId: string;
}

interface UseOrderStatusProps {
  activeOrders: Map<string, Order>;
  notifyPickupOrder: (orderId: string) => void;
  notifyCompleteOrder: (orderId: string) => void;
  notifyAcceptOrder: (orderId: string) => void;
  locationId: string;
  sortOrder: (order: Order) => void;
  removeOrderFromActive: (orderId: string) => void;
  restaurantId: string;
  updateOrderToReadyForPickup: (orderId: string) => void;
  updateOrderToAcceptOrder: (orderId: string) => void;
  onSuccess?: () => void;
}

export function useOrderStatus({
  activeOrders,
  restaurantId,
  locationId,
  sortOrder,
  removeOrderFromActive,
  notifyPickupOrder,
  notifyCompleteOrder,
  notifyAcceptOrder,
  updateOrderToReadyForPickup,
  onSuccess,
  updateOrderToAcceptOrder,
}: UseOrderStatusProps) {
  return useMutation({
    mutationFn: async ({ orderId, orderStatus, correlationId }: OrderStatusInfo) => {
      const orderInfo = {
        orderId,
        orderStatus,
      };
      const response = await axiosInstance.post('restaurant/order-status/', orderInfo, {
        headers: {
          'X-Request-Id': correlationId,
        },
      });
      return response.data;
    },
    onSuccess: async (_, variables) => {
      const { orderId, orderStatus } = variables;

      if (activeOrders.has(orderId)) {
        const order = activeOrders.get(orderId)!;

        if (orderStatus === OrderStatus.OrderAccepted) {
          updateOrderToAcceptOrder(orderId);
        }
        if (orderStatus === OrderStatus.ReadyForPickup) {
          updateOrderToReadyForPickup(orderId);
        }

        if (orderStatus === OrderStatus.OrderCompleted) {
          const orderCorrelationId = order.meta.correlationId;
          removeOrderFromActive(orderId);

          // activeOrders.delete(orderId);

          try {
            const newOrder = await fetchDashboardOrder(restaurantId, locationId, orderId, orderCorrelationId);
            sortOrder(newOrder);
          } catch (error) {
            console.error('Error fetching completed order:', error);
            // Log to Application Insights
            logExceptionError(error, 'useOrderStatus.fetchCompletedOrder', {
              orderId,
              targetStatus: 'Completed',
            });
          }
        }
      }
      onSuccess?.();
    },
    onSettled: (_, __, variables) => {
      const { orderId, orderStatus } = variables;
      if (orderStatus === OrderStatus.OrderAccepted) {
        notifyAcceptOrder(orderId);
      } else if (orderStatus === OrderStatus.ReadyForPickup) {
        notifyPickupOrder(orderId);
      } else if (orderStatus === OrderStatus.OrderCompleted) {
        notifyCompleteOrder(orderId);
      }
    },
  });
}
