import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { CheckoutButton } from '../checkoutbutton/checkoutbutton';
import { PaymentModal } from '../payment/paymentmodal';

interface CheckoutContainerProps {
  isValidPlaceOrder: boolean;
  calculateTotal: number;
  customerData: {
    name: string;
    phone: string;
    getSms: boolean;
  };
  emergepayWalletsPublicId: string;
}

export const CheckoutContainer: React.FC<CheckoutContainerProps> = ({
  isValidPlaceOrder,
  calculateTotal,
  customerData,
  emergepayWalletsPublicId,
}) => {
  
  const paymentModal = useRef<HTMLIonModalElement>({} as HTMLIonModalElement);

  const amount = calculateTotal;
  const handlePaymentSuccess = () => {
    paymentModal.current?.dismiss();
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
  };

  const handleCancel = () => {
    paymentModal.current?.dismiss();
  };

  return (
    <>
      <CheckoutButton isValidPlaceOrder={isValidPlaceOrder} />
      <PaymentModal
        modalRef={paymentModal}
        amount={amount}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={handleCancel}
        customerData={customerData}
        emergepayWalletsPublicId={emergepayWalletsPublicId}
      />
    </>
  );
};
