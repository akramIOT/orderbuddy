import { useEffect, useRef, useState } from 'react';
import { IonSpinner, IonText, useIonRouter } from '@ionic/react';
import { useCompletePayment, useToken } from '../../queries/usePayment';
import { useOrderStore } from '@/stores/orderStore';
import { Paths } from '../../routes/paths';
import { v4 as uuid } from 'uuid';
import { client } from '@/client';
import '../../../style.css';
import { logApiError, logExceptionError } from '@/utils/errorLogger';
declare global {
  interface Window {
    emergepayFormFields: any;
    hosted?: {
      process: () => void;
    };
  }
}

interface PaymentFormProps {
  amount: number;
  previewOrderId: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: any) => void;
  onFieldsLoaded?: (isLoaded: boolean) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  previewOrderId,
  onPaymentSuccess,
  onPaymentError,
  onFieldsLoaded,
}) => {
  const [requestUuid] = useState<string>(uuid());
  const hostedRef = useRef<any>(null);
  const initialized = useRef(false);
  const restaurant = useOrderStore((s) => s.restaurant);
  const resetOrderState = useOrderStore((s) => s.resetOrderState);
  const initiateOrder = (orderNumber: string) => {
    const payload = {
      orderId: orderNumber,
    };
    client.emit('order_joined', payload);
  };

  const [transcationErrorText, setTranscationErrorText] = useState('');
  const [isDisabledPayment, setIsDisabledPayment] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const completePaymentMutation = useCompletePayment();
  const router = useIonRouter();
  const discount = useOrderStore((s) => s.discount);

  const { data: tokenData } = useToken(restaurant._id, requestUuid);

  useEffect(() => {
    const initPaymentFields = async () => {
      if (tokenData?.transactionToken && !initialized.current) {
        initialized.current = true;
        await initializePaymentFields();
      }
    };
    initPaymentFields();
  }, [tokenData]);

  const completePayment = async (transactionToken: string) => {
    const createOrder = {
      previewOrderId: previewOrderId,
      transactionToken,

    };

    try {
      const data = await completePaymentMutation.mutateAsync({
        order: createOrder,
        requestUuid,
      });
      return data;
    } catch (error) {
      console.error('completePayment error:', error);
      throw error;
    }
  };

  const initializePaymentFields = async () => {
    if (!tokenData?.transactionToken) {
      throw new Error('Token data is not available');
    }
    try {
      const token = tokenData?.transactionToken;

      if (!window.emergepayFormFields) {
        throw new Error('Error: emergepayFormFields is not available');
      }

      hostedRef.current = window.emergepayFormFields.init({
        transactionToken: token,
        transactionType: 'CreditSale',
        fieldSetUp: {
          cardNumber: {
            appendToSelector: 'cardNumberContainer',
            useField: true,
            autoIframeHeight: false,
            iframeStyles: {
              width: '80%',
              height: '40px',
              minHeight: '40px',
              overflow: 'hidden',
              color: 'red',
            },
            attributes: {
              placeholder: 'Card Number',
              // maxLength: 16,
              autoComplete: 'cc-number',
            },
          },
          cardExpirationDate: {
            appendToSelector: 'expirationDateContainer',
            useField: true,
          },
          cardSecurityCode: {
            appendToSelector: 'securityCodeContainer',
            useField: true,
          },
          totalAmount: {
            useField: false,
            appendToSelector: null,

            value: amount,
          },
          externalTranId: { useField: false },
        },
        fieldErrorStyles: {
          border: '2px solid red',
          'box-shadow': 'none',
        },

        onFieldsLoaded: () => {
          setIsFieldsLoading(false);
          setIsDisabledPayment(false);
          if (onFieldsLoaded) {
            onFieldsLoaded(true);
          }
          console.log('All fields loaded');
        },
        onFieldErrorCleared: function (data: any) {
          console.log(data);
        },
        onUserAuthorized: async (transactionToken: string) => {
          try {
            const data = await completePayment(transactionToken);
            const paymentDetails = {
              resultMessage: data.transaction.resultMessage,
              isPayed: data.transaction.resultStatus === 'true',
            };
            if (data.transaction.resultMessage === 'Decline') {
              initializePaymentFields();
              setTranscationErrorText('Your payment was declined.');
              setIsDisabledPayment(false);
              return;
            }
            if (data.transaction.resultMessage === 'Do not honor') {
              initializePaymentFields();
              setTranscationErrorText('Your bank declined the transaction');
              setIsDisabledPayment(false);
              return;
            }
            if (data.transaction.resultMessage === 'Insufficient funds') {
              initializePaymentFields();
              setTranscationErrorText('Insufficient funds.');
              setIsDisabledPayment(false);
              return;
            }
            setIsDisabledPayment(false);
            if (client.connected) {
              initiateOrder(data.orderId);
            }
            onPaymentSuccess();
            resetOrderState();
            router.push(Paths.status(restaurant._id, data.orderId), 'forward', 'replace');
          } catch (error) {
            console.log('error', error);
          }
        },
        onFieldError: (error: any) => {
          console.error('Field error:', error);
          logExceptionError(error, 'PaymentFormFieldError', {
            formType: 'gravity',
            transactionToken: token,
          });
          onPaymentError(error);
          setIsDisabledPayment(false);
        },
        onTransactionSuccess: (response: any) => {
          console.log('Transaction successful: payment form', response);
        },
        onTransactionFailure: (error: any) => {
          console.error('Transaction failed:', error);
          logApiError(error, 'paymentTransaction', {
            operation: 'processPayment',
            formType: 'gravity',
            transactionToken: token,
          });
          onPaymentError(error);
        },
        onabort: (error: any) => {
          console.error('Transaction aborted:', error);
          logApiError(error, 'paymentTransaction', {
            operation: 'abortedPayment',
            formType: 'gravity',
          });
          onPaymentError(error);
        },
      });
    } catch (error) {
      console.error('Error initializing payment fields:', error);
      onPaymentError(error);
    }
  };
  const handlePayButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setTranscationErrorText('');
    setIsDisabledPayment(true);
    event.preventDefault();

    if (!hostedRef.current) {
      console.error('Payment form not initialized');
      onPaymentError(new Error('Payment form not initialized'));
      return;
    }

    try {
      hostedRef.current.process();
    } catch (error) {
      setIsDisabledPayment(false);
      console.log('Error processing payment:', error);
      console.error('Error processing payment:', error);
      logExceptionError(error, 'PaymentProcessing', {
        operation: 'processPaymentClick',
        formType: 'gravity',
      });
      onPaymentError(error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative' }}>
          {isFieldsLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <IonSpinner name='lines-sharp' color='primary' />
            </div>
          )}
          <div
            style={{
              opacity: isFieldsLoading ? '0' : '1',
              transition: 'opacity 0.3s',
            }}
          >
            <div className='payment-label'>
              <IonText>Card Number</IonText>
            </div>
            <div id='cardNumberContainer'></div>
            <div className='payment-label'>
              <IonText>MM/YY</IonText>
            </div>
            <div id='expirationDateContainer'></div>
            <div className='payment-label'>
              <IonText>CVV</IonText>
            </div>
            <div id='securityCodeContainer'></div>
            <div style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{transcationErrorText}</div>
            {!isDisabledPayment && (
              <button
                className='violet-background'
                id='payBtn'
                style={{
                  width: '300px',
                  height: '40px',
                  marginTop: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '1000',
                  fontSize: '14px',
                  color: '#fff',
                  backgroundColor: '#262626',
                }}
                onClick={handlePayButtonClick}
              >
                PAY ${amount.toFixed(2)}
              </button>
            )}
            {isDisabledPayment && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '10px',
                }}
              >
                <IonSpinner name='dots' />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
