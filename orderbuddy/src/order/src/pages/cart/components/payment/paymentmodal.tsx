import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { PaymentForm } from '../../../../components/gravity/paymentform';
import GooglePay from '../../../../components/googlepay/googlepay';
import ApplePay from '../../../../components/applepay/applepay';
import React, { RefObject, useState, useEffect } from 'react';

interface PaymentModalProps {
  modalRef: RefObject<HTMLIonModalElement>;
  amount: number;
  customerData: {
    name: string;
    phone: string;
    getSms: boolean;
  };
  emergepayWalletsPublicId: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: any) => void;
  onCancel: () => void;
  onPaymentComplete?: (response: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  modalRef,
  amount,
  customerData,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  onPaymentComplete,
  emergepayWalletsPublicId,
}) => {
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [showDigitalPayments, setShowDigitalPayments] = useState(false);

  const handleCancel = () => {
    setFieldsLoaded(false);
    onCancel();
  };

  useEffect(() => {
    const menuEndpoint = import.meta.env.VITE_MENU_ENDPOINT || '';
    const currentHostname = window.location.hostname;

    // const isDevelopment = menuEndpoint.includes('localhost');
    // const isDev = currentHostname.includes('dev.orderbuddyapp.com') || menuEndpoint.includes('dev.orderbuddyapp.com');
    // setShowDigitalPayments(isDevelopment || isDev);
    setShowDigitalPayments(true);
  }, []);

  useEffect(() => {
    if (modalRef.current) {
      const modal = modalRef.current;

      const handleDismiss = () => {
        setFieldsLoaded(false);
      };

      modal.addEventListener('ionModalDidDismiss', handleDismiss);

      return () => {
        modal.removeEventListener('ionModalDidDismiss', handleDismiss);
      };
    }
  }, [modalRef]);

  return (
    <IonModal id='example-modal' ref={modalRef} trigger='open-payment' canDismiss={true}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={handleCancel}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Payment Information</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding-top'>
        {/* <PaymentForm
          amount={amount}
          customerData={customerData}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onFieldsLoaded={setFieldsLoaded}
        /> */}

        <div style={{ padding: '20px 0', margin: '10px 0' }}>
          <hr style={{ borderTop: '1px solid #ddd', margin: '0 16px' }} />
        </div>

        <IonGrid className='ion-padding'>
          <IonRow>
            <IonCol size='12' className='ion-text-center'>
              <GooglePay
                amount={amount}
                publicId={emergepayWalletsPublicId}
                emergepayWalletsUrl={`${import.meta.env.VITE_ASSETS_EMERGEPAY_URL}/cip-hosted-wallets.js`}
                customerData={customerData}
                onPaymentComplete={onPaymentComplete || onPaymentSuccess}
                onError={onPaymentError}
                onCancel={handleCancel}
              />
            </IonCol>
            <IonCol size='12' className='ion-text-center'>
              {/* <ApplePay
                amount={amount}
                publicId={emergepayWalletsPublicId}
                emergepayWalletsUrl={`${import.meta.env.VITE_ASSETS_EMERGEPAY_URL}/cip-hosted-wallets.js`}
                customerData={customerData}
                onPaymentComplete={onPaymentComplete || onPaymentSuccess}
                onError={onPaymentError}
                onCancel={handleCancel}
              /> */}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};
