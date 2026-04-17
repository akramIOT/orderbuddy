import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { logExceptionError } from   '../utils/errorLogger';
export const STATIONS_ORDERS_QUERY_KEY = (restaurantId: string, stationId: string, locationId: string) => [
  'stationsOrders',
  restaurantId,
  stationId,
  locationId,
];

interface OrderVariant {
  id: string;
  name: string;
  price?: number;
}

interface ModifierOption {
  id: string;
  name: string;
  priceCents: number;
}

interface OrderModifier {
  id: string;
  name: string;
  price?: number;
  options?: ModifierOption[];
}

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  stationTags: string[];
  startedAt: Date;
  completedAt: Date;
  variants?: OrderVariant[];
  modifiers?: OrderModifier[];
  notes?: string;
}

interface MatchedOrder {
  _id: string;
  orderCode: string;
  meta: {
    correlationId: string;
  };
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface StationOrdersResponse {
  locationName: string;
  stationName: string;
  stationTags: string[];
  matchedOrders: MatchedOrder[];
}

export function useStationsOrders(restaurantId: string, stationId: string, locationId: string) {
  if (!locationId) {
    throw new Error('locationId required');
  }
  if (!stationId) {
    throw new Error('stationId required');
  }
  if (!restaurantId) {
    throw new Error('restaurantId required');
  }

  return useQuery<StationOrdersResponse>({
    queryKey: STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<StationOrdersResponse>>(
          `stations/${restaurantId}/${locationId}/${stationId}/orders`
        );
        const processedData = handleApiResponse(response.data);

        if (!processedData) {
          throw new Error('No data received from server');
        }
        return processedData;
      } catch (error) {
        console.error('Error fetching station orders:', error);
        // Log to Application Insights
        logExceptionError(error, 'useStationOrders', {
          endpoint: `stations/orders/${stationId}`,
          stationId
        });
        throw error;
      }
    },
    enabled: !!(restaurantId && stationId),
  });
}
