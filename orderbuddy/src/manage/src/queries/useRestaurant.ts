import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { logApiError } from '../utils/errorLogger';

export type Restaurant = {
  _id: string;
  name: string;
  concept: string;
  locations: Location[];
};

export type Location = {
  id: string;
  name: string;
  address: string;
  timezone: string;
  contact: {
    phone: string;
    email: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  menus: getMenu[];
  origins: Origins[];
  stations: Station[];
};
interface Station {
  id: string;
  name: string;
  stationtags: string[];
}
export type Origins = {
  id: string;
  name: string;
  url: string;
};
export type getMenu = {
  id: string;
  name: string;
  schedule: {
    type: string;
    rules: {
      timezone: string;
      windows: TimeWindow[];
    };
  };
};

export type TimeWindow = {
  days: string[];
  start: string;
  end: string;
};
export function useRestaurant(restaurantId: string) {
  if (!restaurantId) {
    throw new Error('restaurantId required');
  }

  return useQuery<Restaurant>({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      if (!restaurantId) throw new Error('Missing restaurant ID');
      try {
        const response = await axiosInstance.get<ApiResponse<Restaurant>>(`menu-app/${restaurantId}`);
        return handleApiResponse(response.data);
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);      
        logApiError(error, `menu-app/${restaurantId}`, {
          operation: 'fetchRestaurant',
          restaurantId
        });
        throw error;
      }
    },
    enabled: !!restaurantId,
  });
}
