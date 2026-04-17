import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './api-response';
import { logExceptionError } from '../utils/errorLogger';

const stationSchema = z.object({
  _id: z.string(),
  restaurantId: z.string(),
  locationId: z.string(),
  name: z.string(),
  tags: z.array(z.string()),
});

const stationsResponseSchema = z.object({
  data: z.array(stationSchema),
});

export type Station = z.infer<typeof stationSchema>;

export function useStations(restaurantId: string, locationId: string) {
  return useQuery<Station[]>({
    queryKey: ['stations', restaurantId, locationId],
    queryFn: async () => {
      if (!restaurantId || !locationId) {
        throw new Error('Restaurant ID and Location ID are required');
      }

      const response = await axiosInstance.get<ApiResponse<Station[]>>(`/stations/${restaurantId}/${locationId}`);
      try {
        const validatedData = stationsResponseSchema.parse(response.data);
        return validatedData.data;
      } catch (error) {
        console.error('Stations data validation failed:', error);
        // Log to Application Insights
        logExceptionError(
          new Error('Invalid stations data format'),
          'useStations.validation',
          {
            restaurantId,
            locationId,
            zodError: error instanceof z.ZodError ? JSON.stringify(error.errors) : 'Unknown validation error',
            endpoint: `stations/${restaurantId}/${locationId}`
          }
        );
        throw new Error('Invalid stations data format');
      }
    },
    enabled: Boolean(restaurantId && locationId),
  });
}
