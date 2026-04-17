import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { ApiResponse } from '../api-response';
import { z } from 'zod';
import { format } from 'date-fns';
import { logExceptionError } from '../../utils/errorLogger';

const salesByItemSchema = z.object({
  menuItemId: z.string(),
  itemName: z.string(),
  soldCount: z.number(),
  grossSales: z.number(),
});

export type SalesItem = z.infer<typeof salesByItemSchema>;

const salesByItemResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(salesByItemSchema),
});

export function useSalesItemApi(restaurantId: string, locationId: string, date: string) {
  return useQuery<SalesItem[]>({
    queryKey: ['salesByItem', restaurantId, locationId, date],
    queryFn: async () => {
      // Format date outside try/catch to make it available in catch block
      if (!restaurantId || !locationId || !date) {
        return [];
      }

      try {
        const response = await axiosInstance.get<ApiResponse<SalesItem[]>>(
          `/report/sales_by_item/${restaurantId}/${locationId}/${date}`,
        );
        const validatedData = salesByItemResponseSchema.parse(response.data);
        return validatedData.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Sales by item data validation failed:', error.errors);
          // Log validation error to Application Insights
          logExceptionError(new Error('Invalid sales by item data format'), 'SalesItemApi', {
            zodError: JSON.stringify(error.errors),
            endpoint: `/report/sales_by_item/${restaurantId}/${locationId}/${date}`,
            restaurantId,
            locationId,
            date,
          });
          throw new Error('Invalid sales by item data format');
        }
        // Log other errors to Application Insights
        logExceptionError(error, 'SalesItemApi', {
          endpoint: `/report/sales_by_item/${restaurantId}/${locationId}/${date}`,
          restaurantId,
          locationId,
          date,
        });
        throw error;
      }
    },
    enabled: Boolean(restaurantId && locationId && date),
  });
}
