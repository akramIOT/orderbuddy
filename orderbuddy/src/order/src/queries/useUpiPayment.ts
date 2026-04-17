import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { logApiError } from '@/utils/errorLogger';

interface Variant {
  id: string;
  name: string;
  priceCents: number;
}

interface ModifierOption {
  name: string;
  priceCents: number;
}

interface Modifier {
  id: string;
  name: string;
  options?: ModifierOption[];
}


interface CreateOrderRequest {
  previewOrderId: string;
  transactionDetails: any;
}

export interface UpiPaymentError {
  message: string;
  code?: string;
  details?: any;
}

export const useUpiPayment = () => {
  return useMutation<any, UpiPaymentError, { payload: CreateOrderRequest; requestId?: string }>({
    mutationFn: async ({ payload, requestId }) => {
      try {
        const response = await axiosInstance.post<any>('payments/complete-upi-transaction', payload, {
          headers: {
            'X-Request-Id': requestId,
          },
        });

        return response.data;
      } catch (error) {
        logApiError(error, 'payments/complete-upi-transaction', {
          operation: 'completeUpiPayment',
          restaurantId: payload.previewOrderId,
          requestId: requestId,
        });
        throw error;
      }
    },
    onError: (error) => {
      console.error('UPI Payment failed:', error);

      logApiError(error, 'payments/complete-upi-transaction', {
        operation: 'upiPaymentMutation',
        errorMessage: error.message,
        errorCode: error.code,
      });
    },
  });
};
