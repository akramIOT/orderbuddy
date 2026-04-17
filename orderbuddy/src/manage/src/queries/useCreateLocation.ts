import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';


export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId }: { restaurantId: string }) => {
      if (!restaurantId) {
        throw new Error('Restaurant ID not found');
      }

      const response = await axiosInstance.post(`/restaurant/${restaurantId}/location/create`);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the locations query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['locations', variables.restaurantId],
      });
    },
    onError: (error: any) => {
      console.error('Failed to create location', error);
      // You might want to add proper error handling/notification here
    },
  });
}
