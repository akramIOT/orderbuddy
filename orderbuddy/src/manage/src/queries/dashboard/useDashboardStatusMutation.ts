import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { client } from '../../Client';
import { axiosInstance } from '../axiosInstance';
import { OrderItemStatus } from '../../constants';
// Zod schemas for validation
const OrderItemStatusSchema = z.object({
  orderId: z.string(),
  itemId: z.string(),
  orderItemStatus: z.string(),
  stationTags: z.array(z.string()),
  correlationId: z.string(),
});
interface StatusMutationOptions {
  onOrderItemCompleted?: (data: {
    orderId: string;
    itemId: string;
    restaurantId: string;
    locationId: string;
    stationTags: string[];
  }) => void;
}

type OrderItemStatusType = z.infer<typeof OrderItemStatusSchema>;

export const useStatusMutation = (restaurantId: string, locationId: string, options?: StatusMutationOptions) => {
  const notifyOrderItemStatus = (orderId: string, itemId: string, orderItemStatus: string, stationTags: string[]) => {
    if (orderItemStatus === OrderItemStatus.Started) {
      client.emit('order_item_started', {
        restaurantId,
        locationId,
        orderId,
        itemId,
        stationTags,
      });
    } else if (orderItemStatus === OrderItemStatus.Completed) {
      client.emit('order_item_completed', {
        restaurantId,
        locationId,
        orderId,
        itemId,
        stationTags,
      });
      options?.onOrderItemCompleted?.({
        orderId,
        itemId,
        restaurantId,
        locationId,
        stationTags,
      });
    }
  };

  return useMutation({
    mutationFn: async (orderItem: OrderItemStatusType) => {
      // Validate input
      // const validatedData = OrderItemStatusSchema.parse(orderItem);
      const orderItemStatusUpdate = {
        orderId: orderItem.orderId,
        itemId: orderItem.itemId,
        orderItemStatus: orderItem.orderItemStatus,
      };
      const response = await axiosInstance.post('/stations/order-item/', orderItemStatusUpdate, {
        headers: {
          'X-Request-Id': orderItem.correlationId,
        },
      });

      return response.data;
    },
    onSuccess: (_, variables) => {
      //todo
      notifyOrderItemStatus(variables.orderId, variables.itemId, variables.orderItemStatus, variables.stationTags);
    },
  });
};
