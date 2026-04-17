import React, { useEffect, useRef, useState } from 'react';
import { useIonRouter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { useOrderStore } from '@/stores/orderStore';
import { useUpiPayment } from '../../queries/useUpiPayment';
import { client } from '@/client';
import { logApiError, logExceptionError } from '@/utils/errorLogger';
import { Paths } from '../../routes/paths';

interface WalletsProps {
  amount: number;
  previewOrderId: string;
  publicId: string;
  emergepayWalletsUrl: string;
  onPaymentComplete?: (response: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    emergepayWallets: any;
  }
}

const ApplePay: React.FC<WalletsProps> = ({
  amount,
  publicId,
  previewOrderId,
  emergepayWalletsUrl,
  onPaymentComplete,
  onError,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const walletsRef = useRef<any>(null);
  const [requestUuid] = useState(() => uuid());
  const router = useIonRouter();

  const cartItems = useOrderStore((s) => s.cart.items);
  const restaurant = useOrderStore((s) => s.restaurant);
  const resetOrderState = useOrderStore((s) => s.resetOrderState);
  const completeUpiPaymentMutation = useUpiPayment();

  const completeUpiPayment = async (transactionDetails: any) => {

    const createOrder = {
      previewOrderId,
      transactionDetails,
    };

    try {
      const result = await completeUpiPaymentMutation.mutateAsync({
        payload: createOrder,
        requestId: requestUuid,
      });

      if (onPaymentComplete) onPaymentComplete(result);
      if (client.connected) client.emit('order_joined', { orderId: result.orderId });
      if (result?.orderId) {
        resetOrderState();
        router.push(Paths.status(restaurant._id, result.orderId), 'forward', 'replace');
      }

      return result;
    } catch (error) {
      console.error('completePayment upi error:', error);
      logApiError(error, 'payments/complete-upi-transaction', {
        operation: 'completeApplePayPayment',
        restaurantId: restaurant._id,
        requestId: requestUuid,
      });
      if (onError) onError(error);
      throw error;
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = emergepayWalletsUrl;
    script.async = true;

    script.onload = async () => {
      try {
        const wallets = new window.emergepayWallets(publicId);
        walletsRef.current = wallets;

        await wallets.setRequiredFields({ billing: { address: true } });
        await wallets.setTransactionDetails({
          total: amount.toFixed(2),
          shippingMethods: [],
          lineItems: [{ label: `Subtotal – ${restaurant.name}`, amount: amount.toFixed(2) }],
        });

        if (containerRef.current) {
          await wallets.appendButtons({
            appendToId: containerRef.current.id,
            color: 'black',
            type: 'normal',
          });
        }

        wallets.oncancel = () => {
          console.log('wallet transaction canceled');
          onCancel?.();
        };

        wallets.onerror = (error: any) => {
          console.error('Apple Pay Wallet Error:', error);
          logExceptionError(error, 'ApplePayProcessing', { operation: 'wallets.onerror' });
          onError?.(error);
        };

        wallets.onuserauthorized = async (response: any) => {
          console.log('User authorized:', response);
          await completeUpiPayment(response);
          await wallets.completePayment({ approved: true });
        };
      } catch (err) {
        console.error('Failed to init wallet SDK:', err);
        logExceptionError(err, 'ApplePayInitialization', {
          operation: 'loadWalletScript',
          publicId: publicId?.substring(0, 8),
        });
        onError?.(err);
      }
    };

    document.body.appendChild(script);
  }, [publicId]);

  return <div id='wallets-container' className='wallets' ref={containerRef}></div>;
};

export default ApplePay;
