import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

interface UpdateAvailabilityParams {
  restaurantId: string;
  locationId: string;
  menuId: string;
  itemId: string;
  isAvailable: boolean;
}

export const useAvailableMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, locationId, menuId, itemId, isAvailable }: UpdateAvailabilityParams) => {
      const response = await axiosInstance.patch(
        `restaurant/${restaurantId}/location/${locationId}/menu/${menuId}/item/${itemId}/availability`,
        { isAvailable }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
};
