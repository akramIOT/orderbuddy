import {  useIonRouter } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { useUpiPayment } from '../../queries/useUpiPayment';
import styled from 'styled-components';
import { FaGooglePay } from 'react-icons/fa';
import { useOrderStore } from '@/stores/orderStore';
import { useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { client } from '@/client';
import {  logExceptionError } from '@/utils/errorLogger';
import { Paths } from '../../routes/paths';

interface WalletsProps {
  amount: number;
  customerData: {
    name: string;
    phone: string;
    getSms: boolean;
  };
  publicId: string;
  emergepayWalletsUrl: string;
  onPaymentComplete?: (response: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

const WalletContainer = styled.div`
  .checkout-button {
    cursor: pointer;
    color: white;
    background-color: black;
    width: 150px;
    height: 40px;
    border: none;
    font-size: 1.1em;
    margin: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: brightness(1.2);
  }
`;

declare global {
  interface Window {
    emergepayWallets: any;
  }
}

const GooglePay: React.FC<WalletsProps> = ({
  amount,
  customerData,
  publicId,
  emergepayWalletsUrl,
  onPaymentComplete,
  onError,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const walletsRef = useRef<any>(null);
  const origin = useOrderStore((s) => s.origin);
  const cartItems = useOrderStore((s) => s.cart.items);
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const restaurant = useOrderStore((s) => s.restaurant);
  const location = useOrderStore((s) => s.location);
  const resetOrderState = useOrderStore((s) => s.resetOrderState);
  // Use the useUpiPayment hook
  const completeUpiPaymentMutation = useUpiPayment();
  const discount = useOrderStore((s) => s.discount);

  const [requestUuid] = useState<string>(uuid());
  const router = useIonRouter();

  const initiateOrder = (orderNumber: string) => {
    const payload = {
      orderId: orderNumber,
    };
    client.emit('order_joined', payload);
  };
  const completeUpiPayment = async (transactionDetails: any) => {
    const orderItems = cartItems.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      notes: item.notes,
      variants:
        item.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceCents: variant.priceCents,
        })) || [],
      modifiers:
        item.modifiers?.map((mod) => ({
          id: mod.id,
          name: mod.name,
          options:
            mod.options?.map((option) => ({
              id: option.id,
              name: option.name,
              priceCents: option.priceCents,
            })) || [],
        })) || [],
      stationTags: item.stationTags,
    }));

    const createOrder = {
      restaurantId: restaurant._id,
      locationId: location._id,
      locationSlug: locationSlug,
      paymentId: transactionDetails.transactionToken,
      origin: origin._id ? { id: origin._id, name: origin.name } : { id: '', name: 'Web' },
      customer: {
        name: customerData.name,
        phone: customerData.phone,
      },
      items: orderItems,
      getSms: customerData.getSms,
      transactionDetails: transactionDetails,
      discount: discount
        ? {
            name: discount.name,
            type: discount.type,
            amountCents: discount.amountCents,
          }
        : undefined,
    };

    // try {
    //   const result = await completeUpiPaymentMutation.mutateAsync({
    //     payload: createOrder,
    //     requestId: requestUuid,
    //   });
    //   if (onPaymentComplete) {
    //     onPaymentComplete(result);
    //   }
    //   if (client.connected) {
    //     initiateOrder(result.orderId);
    //   }
    //   if (result && result.orderId) {
    //     resetOrderState();

    //     router.push(Paths.status(restaurant._id, result.orderId), 'forward', 'replace');
    //   }

    //   return result;
    // } catch (error) {
    //   console.error('completePayment upi error:', error);
    //   logApiError(error, 'payments/complete-upi-transaction', {
    //     operation: 'completeGooglePayPayment',
    //     restaurantId: restaurant._id,
    //     requestId: requestUuid,
    //   });
    //   if (onError) {
    //     onError(error);
    //   }
    //   throw error;
    // }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = emergepayWalletsUrl;
    script.async = true;

    script.onload = async () => {
      try {
        walletsRef.current = new window.emergepayWallets(publicId);

        await walletsRef.current.setRequiredFields({
          billing: {
            address: true,
          },
        });

        await walletsRef.current.setTransactionDetails({
          total: amount,
          shippingMethods: [
            { id: 'S1', label: 'Express Shipping', description: 'Delivery: 3-5 days', amount: '0.00' },
            { id: 'S2', label: 'Priority Shipping', description: 'Delivery: 2 days', amount: '5.00' },
          ],
          lineItems: [{ label: 'Express Shipping', amount: '0.00' }],
        });

        // Append buttons if container is available
        if (containerRef.current) {
          await walletsRef.current.appendButtons({
            appendToId: containerRef.current.id,
            color: 'black',
            type: 'compact',
            inheritDimensionsFromId: 'checkout-button',
          });
        }

        // Set up event handlers
        walletsRef.current.oncancel = () => {
          console.log('wallet transaction canceled');
          onCancel?.();
        };

        walletsRef.current.onerror = (error: any) => {
          console.log(error);
          logExceptionError(error, 'GooglePayProcessing', {
            operation: 'googlePayWalletError',
          });
          onError?.(error);
        };

        walletsRef.current.onuserauthorized = async (response: any) => {
          console.log('User authorized', response);
          const data = await completeUpiPayment(response);
          console.log('Payment response:', data);
        };

        walletsRef.current.onshippinginfoupdate = (shippingInfo: any) => {
          console.log(shippingInfo);
          walletsRef.current.updateShippingInfo({
            total: amount,
            lineItems: [
              { label: 'Subtotal', amount: '15.00' },
              { label: 'Express Shipping', amount: '0.00' },
              { label: 'Estimated Tax', amount: '0.90' },
            ],
            shippingMethods: [
              { id: 'S1', label: 'Express Shipping', description: 'Delivery: 3-5 days', amount: '0.00' },
              { id: 'S2', label: 'Priority Shipping', description: 'Delivery: 2 days', amount: '5.00' },
            ],
          });
        };

        walletsRef.current.onshippingmethodupdate = (shippingMethod: any) => {
          console.log(shippingMethod);
          walletsRef.current.updateShippingMethod({
            total: (15.9 + +shippingMethod.amount).toFixed(2),
            lineItems: [
              { label: 'Subtotal', amount: '15.00' },
              { label: shippingMethod.label, amount: shippingMethod.amount },
              { label: 'Estimated Tax', amount: '0.90' },
            ],
          });
        };
      } catch (err) {
        console.error('Error initializing wallets:', err);
        logExceptionError(err, 'GooglePayInitialization', {
          operation: 'initializeGooglePayWallet',
          publicId: publicId?.substring(0, 8), // Only log part of ID for security
        });
        onError?.(err);
      }
    };

    document.body.appendChild(script);
  }, [publicId]);

  return (
    <WalletContainer>
      <div id='wallets-container' ref={containerRef}>
        <button id='checkout-button' className='checkout-button'>
          <FaGooglePay size={40} className='payment-icon' />
        </button>
      </div>
    </WalletContainer>
  );
};

export default GooglePay;
