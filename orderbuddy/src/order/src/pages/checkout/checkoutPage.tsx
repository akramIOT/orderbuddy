import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  useIonRouter,
  IonSpinner,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { arrowBack, close } from 'ionicons/icons';
import { PaymentForm } from '@/components/gravity/paymentform';
import ApplePay from '@/components/applepay/applepay';
import GooglePay from '@/components/googlepay/googlepay';
import { useOrderStore } from '@/stores/orderStore';
import { Paths } from '@/routes/paths';
import { logExceptionError } from '@/utils/errorLogger';

interface PreviewOrderDetails {
  previewOrderId: string;
  totalPriceCents: number;
}

const CheckoutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewOrderDetails, setPreviewOrderDetails] = useState<PreviewOrderDetails | null>(null);
  const [showPage, setShowPage] = useState(false);
  const router = useIonRouter();

  const location = useOrderStore((s) => s.location);
  const restaurant = useOrderStore((s) => s.restaurant);
  const order = useOrderStore((s) => s.order);

  const searchParams = new URLSearchParams(window.location.search);

  let originId = searchParams.get('originId');

  // Get URL parameters
  const { restaurantId, locationId, menuSlug, menuId, previewOrderId, locationSlug } = useParams<{
    restaurantId: string;
    locationId: string;
    menuSlug: string;
    menuId: string;
    locationSlug: string;
    previewOrderId: string;
  }>();

  useEffect(() => {
    try {
      // First, validate that we have a valid order in the store
      if (!order || !order.previewOrderId) {
        console.error('No valid order found in store', { order });

        logExceptionError(new Error('No valid order in store'), 'CheckoutPageValidation', {
          operation: 'validateOrderExists',
          previewOrderId,
        });

        // Redirect to error page
        router.push('/error?code=invalid-order', 'root');
        return;
      }

      // Then validate that the previewOrderId in URL matches the one in order state
      if (order.previewOrderId !== previewOrderId) {
        console.error('Preview order ID mismatch', {
          statePreviewOrderId: order.previewOrderId,
          urlPreviewOrderId: previewOrderId,
        });

        logExceptionError(new Error('Invalid preview order ID'), 'CheckoutPageValidation', {
          operation: 'validatePreviewOrderId',
          expectedId: order.previewOrderId,
          receivedId: previewOrderId,
        });

        // Redirect back with error
        router.push('/error?code=invalid-preview-order-id', 'back');
        return;
      }

      // If we get here, the order is valid
      setPreviewOrderDetails({
        previewOrderId,
        totalPriceCents: order.totalPriceCents,
      });

      setIsLoading(false);
    } catch (error) {
      logExceptionError(error, 'CheckoutPageLoad', {
        operation: 'loadPreviewOrder',
        previewOrderId,
      });
      router.push('/error?code=checkout-error', 'root');
    }
  }, [previewOrderId, order, router]);
  // Handle cancel
  const handleCancel = () => {
    // Navigate back to cart
    if (router.canGoBack()) {
      router.goBack();
    } else {

      router.push(Paths.cart(restaurantId, locationSlug, locationId, menuSlug, menuId, originId || ''));
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    // console.log('Payment successful');
    // The payment component already handles navigation to status page
  };

  // Handle payment error
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    logExceptionError(error, 'PaymentProcessing', {
      operation: 'paymentProcessing',
      previewOrderId,
    });
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className='ion-padding ion-text-center'>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name='circular' />
            <div style={{ marginLeft: '10px' }}>Loading payment details...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={handleCancel}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className='ion-padding'>
        <IonGrid>
          {/* <IonRow>
            <IonCol>
              <IonText>
                <h2>Complete Payment</h2>
              </IonText>
              <div className='order-summary'>
                <h4>Total: ${(previewOrderDetails?.totalPriceCents || 0) / 100}</h4>
                <p>Order ID: {previewOrderId}</p>
              </div>
            </IonCol>
          </IonRow> */}

          {/* Payment methods section */}
          <IonRow>
            <IonCol>
              <div className='payment-methods'>
                {/* Credit Card Payment */}
                <div className='payment-method-section'>
                  {previewOrderDetails && (
                    <PaymentForm
                      previewOrderId={previewOrderId}
                      amount={(previewOrderDetails.totalPriceCents || 0) / 100}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  )}
                </div>

                {/* Apple Pay */}
                {location.emergepayWalletsPublicId && (
                  <div className='payment-method-section' style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",paddingTop:"120px"}}>
                    {previewOrderDetails && (
                      <ApplePay
                        previewOrderId={previewOrderId}
                        amount={(previewOrderDetails.totalPriceCents || 0) / 100}
                        publicId={location.emergepayWalletsPublicId}
                        emergepayWalletsUrl={`${import.meta.env.VITE_ASSETS_EMERGEPAY_URL}/cip-hosted-wallets.js`}
                        onPaymentComplete={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onCancel={handleCancel}
                      />
                    )}
                  </div>
                )}

                {/* Google Pay */}
                {/* {location.emergepayWalletsPublicId && (
                    <div className='payment-method-section'>
                      <h4>Google Pay</h4>
                      {previewOrderDetails && (
                        <GooglePay
                          amount={(previewOrderDetails.totalPriceCents || 0) / 100}
                          previewOrderId={previewOrderId}
                          publicId={location.emergepayWalletsPublicId}
                          onPaymentComplete={handlePaymentSuccess}
                          onError={handlePaymentError}
                          onCancel={handleCancel}
                        />
                      )}
                    </div>
                  )} */}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
export default CheckoutPage;
