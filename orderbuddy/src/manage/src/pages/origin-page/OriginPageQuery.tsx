import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../queries/axiosInstance';
import { logExceptionError } from '../../utils/errorLogger';

// Send QR Code link via email mutation
export const useSendQrCodeLink = (restaurantId: string, locationId: string) => {
  return useMutation({
    mutationFn: async (originId: string) => {
      try {
        const response = await axiosInstance.post(`/origins/${restaurantId}/${locationId}/send-link/${originId}`);
        return response.data;
      } catch (error) {
        logExceptionError(error instanceof Error ? error : new Error(String(error)), 'useSendQrCodeLink', {
          restaurantId,
          locationId,
          originId,
        });
        throw error;
      }
    },
  });
};
