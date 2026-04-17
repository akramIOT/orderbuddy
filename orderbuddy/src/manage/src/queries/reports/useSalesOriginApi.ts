import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { ApiResponse } from '../api-response';
import { z } from 'zod';
import { format } from 'date-fns';
import { logExceptionError } from '../../utils/errorLogger';

const salesByOriginSchema = z.object({
  originId: z.string(),
  soldCount: z.number(),
  grossSales: z.number(),
  name: z.string(),
});

export type salesOrigin = z.infer<typeof salesByOriginSchema>;

const salesByOriginResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(salesByOriginSchema),
});

export function useSalesOriginApi(restaurantId: string, locationId: string, date: string) {
  return useQuery<salesOrigin[]>({
    queryKey: ['salesByOrigin', restaurantId, locationId, date],
    queryFn: async () => {
      // Format date outside try/catch to make it available in catch block
      if (!restaurantId || !locationId || !date) {
        return [];
      }
      //const formattedDate = format(new Date(date), 'yyyy-MM-dd');

      try {
        const response = await axiosInstance.get<ApiResponse<salesOrigin[]>>(
          `/report/sales_by_origin/${restaurantId}/${locationId}/${date}`,
        );

        const validatedData = salesByOriginResponseSchema.parse(response.data);
        return validatedData.data;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Sales by item data validation failed:', error.errors);
          // Log validation error to Application Insights
          logExceptionError(new Error('Invalid sales by item data format'), 'SalesOriginApi', {
            zodError: JSON.stringify(error.errors),
            endpoint: `/report/sales_by_origin/${restaurantId}/${locationId}/${date}`,
            restaurantId,
            locationId,
            date,
          });
          throw new Error('Invalid sales by item data format');
        }
        // Log other errors to Application Insights
        logExceptionError(error, 'SalesOriginApi', {
          endpoint: `/report/sales_by_origin/${restaurantId}/${locationId}/${date}`,
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
