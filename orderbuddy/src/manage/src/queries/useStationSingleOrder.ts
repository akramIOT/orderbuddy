import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { z } from 'zod';

// Zod schema for validation
export const OrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  name: z.string(),
  priceCents: z.number(),
  stationTags: z.array(z.string()),
  isStarted: z.date().optional().nullable(),
  isCompleted: z.date().optional().nullable(),
  variants: z.array(z.any()).optional(),
  modifiers: z.array(z.any()).optional(),
  notes: z.string().optional(),
});

export const OrderSchema = z.object({
  _id: z.string(),
  status: z.string(),
  orderCode: z.string(),
  meta: z
    .object({
      correlationId: z.string().optional(),
    })
    .optional(),
  startedAt: z.string(),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  items: z.array(OrderItemSchema),
  totalPriceCents: z.number(),
});

type StationOrder = z.infer<typeof OrderSchema>;

export const fetchStationOrder = async (
  restaurantId: string,
  locationId: string,
  orderId: string,
  stationTags: string[],
  correlationId?: string,
): Promise<StationOrder> => {
  const { data } = await axiosInstance.get(`/stations/${restaurantId}/${locationId}/orders/${orderId}`, {
    params: {
      stationTags: stationTags.join(','),
    },
    headers: {
      'X-Request-Id': correlationId,
    },
    paramsSerializer: (params) => {
      return Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    },
  });
  return OrderSchema.parse(data.data);
};

// Hook for component usage
export const useStationSingleOrder = (
  restaurantId: string,
  locationId: string,
  orderId: string,
  stationTags: string[],
  correlationId: string,
) => {
  return useQuery({
    queryKey: ['station-order', orderId, stationTags],
    queryFn: () => fetchStationOrder(restaurantId, locationId, orderId, stationTags, correlationId),
    enabled: !!orderId && !!stationTags.length,
  });
};
