import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { logApiError } from '@/utils/errorLogger';

interface Customer {
  name: string;
  phone: string;
}
interface TransactionResponse {
  transaction: {
    resultMessage: string;
    resultStatus: string;
  };
  orderId: string;
}

interface TokenResponse {
  transactionToken: string;
}

interface CreateOrderRequest {
  previewOrderId: string;
  transactionToken: string;
  
}

export function useToken(restaurantId: string, requestUuid: string) {
  if (!restaurantId) {
    throw new Error('restaurantId is required');
  }

  return useQuery<TokenResponse>({
    queryKey: ['token', restaurantId, requestUuid],
    queryFn: async () => {
      try {
        const response = await axiosInstance.post<TokenResponse>(
          `payments/start-transaction/${restaurantId}`,
          {},
          {
            headers: {
              'X-Request-Id': requestUuid,
            },
          }
        );
        return response.data;
      } catch (error) {
        // Add Application Insights logging
        logApiError(error, `payments/start-transaction/${restaurantId}`, {
          operation: 'getTransactionToken',
          restaurantId,
          requestId: requestUuid
        });
        throw error;
      }
    },
    staleTime: Infinity,
  });
}

export function useCompletePayment() {
  return useMutation<TransactionResponse, Error, { order:CreateOrderRequest ; requestUuid: string }>({
    mutationFn: async ({ order, requestUuid }) => {
      try {
        const response = await axiosInstance.post<TransactionResponse>('payments/complete-transaction', order, {
          headers: {
            'X-Request-Id': requestUuid,
          },
        });
        return response.data;
      } catch (error) {
        // Add Application Insights logging
        logApiError(error, 'payments/complete-transaction', {
          operation: 'completePayment',
          restaurantId: order.previewOrderId,
          requestId: requestUuid
        });
        throw error;
      }
    },
    onError: (error) => {
      // Keep existing console.error implicitly called by React Query
      logApiError(error, 'payments/complete-transaction', {
        operation: 'completePaymentMutation'
      });
    }
  });
}
