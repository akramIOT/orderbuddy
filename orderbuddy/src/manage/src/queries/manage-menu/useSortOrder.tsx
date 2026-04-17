import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

interface SortOrderUpdate {
  restaurantId: string;
  locationId: string;
  menuId: string;
  categoryId: string;
  sortOrder: number;
}

export const useSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SortOrderUpdate) => {
      const { data } = await axiosInstance.post(
        `/restaurant/${params.restaurantId}/location/${params.locationId}/menu/${params.menuId}/category/sort-order`,
        {
          categoryId: params.categoryId,
          sortOrder: params.sortOrder,
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['menu', variables.restaurantId, variables.locationId, variables.menuId],
      });
    },
  });
};
