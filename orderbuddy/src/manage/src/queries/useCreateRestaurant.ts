import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';

export function useCreateRestaurant() {
  return useMutation({
    mutationFn: async (userId:string) => {
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axiosInstance.post(`/restaurant/create/${userId}`);
      return response.data.data;
    },
  
 
  });
}
