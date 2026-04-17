import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from '@/queries/axiosInstance';
import { ApiResponse } from '@/queries/api-response';
import { handleApiResponse } from '../queries/apiHandle';
import { logApiError } from '@/utils/errorLogger';

// Schema for Restaurant API response
const restaurantSchema = z.object({
  _id: z.string(),
  name: z.string(),
  concept: z.string(),
  logo: z.string().optional(),
});

// Schema for Location API response
const locationSchema = z.object({
  _id: z.string(),
  locationSlug: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  acceptPayment: z.boolean(),
  emergepayWalletsPublicId: z.string(),
  isOpen: z.boolean(),
});

// Schema for Origin API response
const originSchema = z.object({
  _id: z.string(),
  label: z.string(),
  restaurantId: z.string(),
  locationId: z.string(),
  type: z.string().optional(),
});

// Schema for Campaign API response
const campaignRewardSchema = z.object({
  flatOffCents: z.number(),
});

const campaignSchema = z.object({
  name: z.string(),
  type: z.string(),
  reward: campaignRewardSchema,
});

export type RestaurantData = z.infer<typeof restaurantSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type OriginData = z.infer<typeof originSchema>;
export type CampaignData = z.infer<typeof campaignSchema>;

// Hook for fetching restaurant data
export function useRestaurant(restaurantId: string, options?: Partial<UseQueryOptions<RestaurantData>>) {
  return useQuery<RestaurantData>({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<RestaurantData>>(`order-app/restaurants/${restaurantId}`);
        const data = handleApiResponse(response);
        const parsedData = restaurantSchema.safeParse(data);
        if (!parsedData.success) {
          console.error('useRestaurant response schema error: ', parsedData.error);
          logApiError(parsedData.error, `order-app/restaurants/${restaurantId}`, {
            operation: 'validateRestaurant',
            restaurantId,
            validationErrors: parsedData.error,
          });
          throw new Error('Invalid restaurant data');
        }
        return parsedData.data;
      } catch (error) {
        logApiError(error, `order-app/restaurants/${restaurantId}`, {
          operation: 'fetchRestaurant',
          restaurantId,
        });
        throw error;
      }
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook for fetching location data
export function useLocation(
  restaurantId: string,
  locationId: string,
  options?: Partial<UseQueryOptions<LocationData>>,
) {
  return useQuery<LocationData>({
    queryKey: ['location', restaurantId, locationId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<LocationData>>(
          `order-app/restaurants/${restaurantId}/locations/${locationId}`,
        );
        const data = handleApiResponse(response);
        const parsedData = locationSchema.safeParse(data);
        if (!parsedData.success) {
          console.error('useLocation response schema error: ', parsedData.error);
          logApiError(parsedData.error, `order-app/restaurants/${restaurantId}/locations/${locationId}`, {
            operation: 'validateLocation',
            restaurantId,
            locationId,
            validationErrors: parsedData.error,
          });
          throw new Error('Invalid location data');
        }
        return parsedData.data;
      } catch (error) {
        logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}`, {
          operation: 'fetchLocation',
          restaurantId,
          locationId,
        });
        throw error;
      }
    },
    enabled: !!restaurantId && !!locationId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook for fetching origin data
export function useOrigin(originId: string, options?: Partial<UseQueryOptions<OriginData>>) {
  return useQuery<OriginData>({
    queryKey: ['origin', originId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<OriginData>>(`order-app/restaurants/origins/${originId}`);
        const data = handleApiResponse(response);

        // Ensure locationId is converted to string if it's an ObjectId
        if (data && typeof data.locationId === 'object' && data.locationId !== null) {
          const objectId = data.locationId as any; // Use any to bypass TypeScript checks
          if (objectId.$oid) {
            data.locationId = objectId.$oid;
          }
        }

        const parsedData = originSchema.safeParse(data);
        if (!parsedData.success) {
          console.error('useOrigin response schema error: ', parsedData.error);
          logApiError(parsedData.error, `order-app/restaurants/origins/${originId}`, {
            operation: 'validateOrigin',
            originId,
            validationErrors: parsedData.error,
          });
          throw new Error('Invalid origin data');
        }
        return parsedData.data;
      } catch (error) {
        logApiError(error, `order-app/restaurants/origins/${originId}`, {
          operation: 'fetchOrigin',
          originId,
        });
        throw error;
      }
    },
    enabled: !!originId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook for fetching campaign data
export function useCampaign(
  restaurantId: string,
  locationId: string,
  originId: string,
  options?: Partial<UseQueryOptions<CampaignData>>,
) {
  return useQuery<CampaignData>({
    queryKey: ['campaign', restaurantId, locationId, originId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<CampaignData>>(
          `order-app/restaurants/${restaurantId}/locations/${locationId}/origins/${originId}/campaign`,
        );
        const data = handleApiResponse(response);
        const parsedData = campaignSchema.safeParse(data);
        if (!parsedData.success) {
          console.error('useCampaign response schema error: ', parsedData.error);
          logApiError(
            parsedData.error,
            `order-app/restaurants/${restaurantId}/locations/${locationId}/origins/${originId}/campaign`,
            {
              operation: 'validateCampaign',
              restaurantId,
              locationId,
              originId,
              validationErrors: parsedData.error,
            },
          );
          throw new Error('Invalid campaign data');
        }
        return parsedData.data;
      } catch (error) {
        logApiError(
          error,
          `order-app/restaurants/${restaurantId}/locations/${locationId}/origins/${originId}/campaign`,
          {
            operation: 'fetchCampaign',
            restaurantId,
            locationId,
            originId,
          },
        );
        throw error;
      }
    },
    enabled: !!restaurantId && !!locationId && !!originId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
