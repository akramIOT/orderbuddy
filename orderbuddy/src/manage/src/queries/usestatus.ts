import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from './axiosInstance';
import { STATIONS_ORDERS_QUERY_KEY } from './useStationsOrder';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';
import { client } from '../Client';
import { OrderItemStatus } from '../constants';
//todo: add types for axiosInstance
// Zod schemas for validation
const OrderItemStatusSchema = z.object({
  orderId: z.string(),
  itemId: z.string(),
  orderItemStatus: z.string(),
  correlationId: z.string(),
});

type OrderItemStatustype = z.infer<typeof OrderItemStatusSchema>;

export const useStatusMutation = (
  restaurantId: string,
  stationId: string,
  locationId: string,
  stationTags: string[]
) => {
  const queryClient = useQueryClient();

  const notifyOrderItemStatus = (orderId: string, itemId: string, orderItemStatus: string) => {
    console.log('restaurantId:', restaurantId);
    console.log('orderId:', orderId);
    console.log('itemId:', itemId);
    console.log('orderItemStatus:', orderItemStatus);

    if (orderItemStatus === OrderItemStatus.Started) {
      console.log('Emitting order_item_started event');
      client.emit('order_item_started', {
        restaurantId,
        locationId,
        orderId,
        itemId,
        stationTags: stationTags,
      });
    } else if (orderItemStatus === OrderItemStatus.Completed) {
      console.log('Emitting order_item_completed event');
      client.emit('order_item_completed', {
        restaurantId,
        locationId,
        orderId,
        itemId,
        stationTags: stationTags,
      });
    }
  };

  return useMutation({
    mutationFn: async (orderItem: OrderItemStatustype) => {
      // Validate input
      const validatedData = OrderItemStatusSchema.parse(orderItem);
      const orderItemData = {
        orderId: validatedData.orderId,
        itemId: validatedData.itemId,
        orderItemStatus: validatedData.orderItemStatus,
      };
      const response = await axiosInstance.post('/stations/order-item/', orderItemData, {
        headers: {
          'X-Request-Id': validatedData.correlationId,
        },
      });

      return response.data;
    },
    onSuccess: (_, variables) => {
      //todo
      queryClient.setQueryData(STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          matchedOrders: oldData.matchedOrders
            .map((order: any) => {
              if (order._id === variables.orderId) {
                return {
                  ...order,
                  items: order.items
                    .map((item: any) => {
                      if (item.id === variables.itemId) {
                        const now = new Date().toISOString();

                        if (variables.orderItemStatus === OrderItemStatus.Started) {
                          return {
                            ...item,
                            startedAt: now,
                            completedAt: null,
                          };
                        } else if (variables.orderItemStatus === OrderItemStatus.Completed) {
                          return {
                            ...item,
                            completedAt: now,
                          };
                        }
                      }
                      return item;
                    })
                    .filter((item: { completedAt: any }) => !item.completedAt), // Remove completed items
                };
              }
              console.log('Returning order:', order._id);
              return order;
            })
            .filter((order: { items: string | any[] }) => order.items.length > 0), // Remove orders with no items
        };
      });
      notifyOrderItemStatus(variables.orderId, variables.itemId, variables.orderItemStatus);
    },
  });
};
