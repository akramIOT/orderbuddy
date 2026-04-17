import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { logApiError } from '@/utils/errorLogger';
import { axiosInstance } from '@/queries/axiosInstance';



interface PreviewOrderInput {
  restaurantId: string;
  locationId: string;
  locationSlug: string;
  origin: { id: string; name: string };
  customer: { name: string; phone: string };
  items: any[];
  getSms: boolean;
  discount?: {
    name: string;
    type: string;
    amountCents: number;
  };
}

interface PreviewOrderResponse {
  previewOrderId: string;
  totalPriceCents: number;
}


export const useCreatePreviewOrder = () => {
  const requestId = uuid(); // Generate a unique ID for request tracking

  return useMutation<PreviewOrderResponse, Error, PreviewOrderInput>({
    mutationFn: async (data) => {
      try {
        const response = await axiosInstance.post('/order-app/cart/preview-order', data, {
          headers: {
            'X-Request-ID': requestId,
          },
        });
        return response.data.data;
      } catch (error) {
        logApiError(error, 'order-app/cart/preview-order', {
          operation: 'createPreviewOrder',
          restaurantId: data.restaurantId,
          locationId: data.locationId,
          requestId,
        });
        throw error;
      }
    },
  });
};

export default useCreatePreviewOrder;
