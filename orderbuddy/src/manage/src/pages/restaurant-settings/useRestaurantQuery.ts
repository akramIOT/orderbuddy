import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../../queries/api-response';
import { handleApiResponse } from '../../queries/apiHandle';
import { axiosInstance } from '../../queries/axiosInstance';
import { logExceptionError } from '../../utils/errorLogger';
import { Profile } from './useRestaurantPage';

// Define schema for restaurant data
const restaurantSchema = z.object({
  _id: z.string(),
  name: z.string(),
  concept: z.string().optional(),
  logo: z.string().optional(),
  tagline: z.string().optional(),
  website: z.string().optional(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  updatedAt: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
});

export type Restaurant = z.infer<typeof restaurantSchema>;

// Get restaurant data
export function useRestaurantApi(restaurantId: string, locationId?: string) {
  return useQuery<Restaurant>({
    queryKey: ['restaurant', restaurantId, locationId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<Restaurant>>(
          `restaurant/restaurants/${restaurantId}/locationId/${locationId}/restaurantDetails`,
        );
        // Make sure we're accessing the nested data property correctly
        if (!response.data || !response.data.data) {
          throw new Error('No restaurant data received');
        }

        // Validate the data
        const validatedData = restaurantSchema.parse(response.data.data);
        return validatedData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Restaurant data validation failed:', error.errors);
          // Log validation error
          logExceptionError(new Error('Invalid restaurant data format'), 'useRestaurantApi.validation', {
            restaurantId,
            zodError: JSON.stringify(error.errors),
          });
          throw new Error('Invalid restaurant data format');
        }
        // Log general error
        logExceptionError(error, 'useRestaurantApi.fetch', {
          restaurantId,
          endpoint: `restaurant/restaurants/${restaurantId}`,
        });
        throw error;
      }
    },
    enabled: Boolean(restaurantId),
  });
}

// Update restaurant
export function useUpdateRestaurant() {
  return useMutation({
    mutationFn: async ({
      restaurantId,
      locationId,
      ...profileData
    }: {
      restaurantId: string;
      locationId?: string;
    } & Partial<Profile>) => {
      try {
        console.log('Updating restaurant with data:', profileData);
        const response = await axiosInstance.patch<ApiResponse<Restaurant>>(
          `restaurant/restaurants/${restaurantId}/locationId/${locationId}/update-restaurantDetails`,
          profileData,
        );
        return handleApiResponse(response);
      } catch (error) {
        console.error('Failed to update restaurant:', error);
        // Log to Application Insights
        logExceptionError(error, 'useUpdateRestaurant', {
          restaurantId,
          locationId,
          endpoint: `restaurant/restaurants/${restaurantId}?locationId=${locationId}`,
        });
        throw error;
      }
    },
  });
}
