import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { axiosInstance } from './axiosInstance';
import { logApiError } from '@/utils/errorLogger';
import { v4 as uuid } from 'uuid';

export function useCreateOrder() {
  const requestUuid = uuid();

  return useMutation<any, Error, any>({
    mutationFn: async (previewOrderId: any) => {
      try {
        const response = await axiosInstance.post<ApiResponse<any>>('payments/place-order-without-payment', {previewOrderId}, {
          headers: {
            'X-Request-Id': requestUuid,
          },
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onError: (error) => {
      logApiError(error, 'payments/place-order-without-payment', { 
        operation: 'createOrderMutation',
        requestId: requestUuid
      });
    }
  });
}
