import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../api-response';
import { v4 as uuid } from 'uuid';
import { axiosInstance } from '../axiosInstance';


export function useCreateOrder() {
  const requestUuid = uuid();

  return useMutation<any, Error, any>({
    mutationFn: async (orderData: any) => {
      try {
        const response = await axiosInstance.post<ApiResponse<any>>('menu-app/restaurant/order', orderData, {
          headers: {
            'X-Request-Id': requestUuid,
          },
        });
     
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
}
