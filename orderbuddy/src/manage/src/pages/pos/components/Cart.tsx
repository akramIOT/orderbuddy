import React, { use, useEffect, useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonLabel,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
  IonItem,
  IonBadge,
  IonCheckbox,
  IonInput,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { CustomerData, OrderItem } from '../usePos';

import { AiTwotoneDelete } from 'react-icons/ai';

interface CartProps {
  orderItems: OrderItem[];
  removeOrderItem: (itemId: string) => void;
  onCustomerDataChange: (data: CustomerData) => void;
  placeOrder: () => void;
  clearOrder: () => void;
}

const Cart: React.FC<CartProps> = ({ orderItems, removeOrderItem, onCustomerDataChange, placeOrder, clearOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhoneNumberInput, setShowPhoneNumberInput] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const taxRate = parseFloat(import.meta.env.VITE_TAX_RATE || '0.10');
  useEffect(() => {
    if (orderItems.length === 0) {
      setCustomerName('');
      setPhone('');
      setIsValid(false);
      setShowPhoneNumberInput(false);
    }
  }, [orderItems]);

  useEffect(() => {
    onCustomerDataChange({
      name: customerName,
      phone: phone,
      getSms: showPhoneNumberInput,
    });
  }, [customerName, phone, showPhoneNumberInput]);

  useEffect(() => {
    const isValid = customerName.length > 0 && (!showPhoneNumberInput || phone.length === 10);
    setIsValid(isValid);
  }, [customerName, phone, showPhoneNumberInput, isValid]);
  useEffect(() => {
    if (!showPhoneNumberInput) {
      setPhone('');
    }
  }, [showPhoneNumberInput]);
  const handleNameInput = (e: CustomEvent) => {
    const value = ((e.target as HTMLIonInputElement).value as string) || '';
    setCustomerName(value);
  };

  const handlePhoneInput = (e: CustomEvent) => {
    const originalValue = (e.target as HTMLIonInputElement).value as string;
    const validPhoneRegex = /^[0-9\s-]*$/;

    if (!originalValue || typeof originalValue !== 'string' || !validPhoneRegex.test(originalValue)) {
      console.warn('Invalid phone number input');
      setPhone('');
      return;
    }

    if (originalValue.length === 10) {
      setPhone(originalValue);
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = orderItems.reduce((sum, item) => sum + item.price * taxRate, 0);
  const totalWithTax = subtotal * (1 + taxRate);

  return (
    <IonGrid style={{ height: '100%' }}>
      <IonRow>
        <IonCol>
          <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            {orderItems.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #ccc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IonBadge className='cart-header' style={{ marginRight: '8px' }}>
                    <div style={{ color: 'white' }}>{orderItems.length}</div>
                  </IonBadge>
                  <IonText className='font-size-14'>Items</IonText>
                </div>
                <IonButton
                  size='small'
                  className='solid-button'
                  disabled={orderItems.length === 0}
                  onClick={clearOrder}
                  style={{ minWidth: '32px', paddingBottom: '4px', paddingTop: '4px' }}
                >
                  <AiTwotoneDelete fontSize={20} />
                  <IonText style={{ marginLeft: '4px', color: 'white' }}> clear</IonText>
                </IonButton>
              </div>
            )}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '15px' }}>
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <IonItem key={item.id}>
                    <IonLabel>
                      <IonText className='font-size-14'>{item.name}</IonText>
                      {item.variants?.length > 0 && (
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          {item.variants.map((variant) => variant.name).join(', ')}
                        </div>
                      )}
                      {item.modifiers && (
                        <div>
                          {item.modifiers.map((modifiersOptions, index) => (
                            <span key={index} style={{ fontSize: '12px' }}>
                              <IonText style={{ fontWeight: 'bold' }}>{modifiersOptions.name}: </IonText>
                              {modifiersOptions.options?.map((option, optIndex) => (
                                <React.Fragment key={optIndex}>
                                  {option.name}
                                  {optIndex !== (modifiersOptions.options?.length || 0) - 1 && ', '}
                                </React.Fragment>
                              ))}
                              <br />
                            </span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div style={{ maxWidth: '80%' }}>
                          <IonText style={{ fontSize: '11px', textTransform: 'capitalize' }}>{item.notes}</IonText>
                        </div>
                      )}
                    </IonLabel>
                    <IonLabel slot='end'>
                      <p>
                        <IonText>${(item.price / 100).toFixed(2)}</IonText>
                      </p>
                    </IonLabel>
                    <IonButton fill='clear' slot='end' onClick={() => removeOrderItem(item.id)}>
                      <IonIcon slot='icon-only' icon={closeOutline} />
                    </IonButton>
                  </IonItem>
                ))
              ) : (
                <div style={{ paddingTop: '40px', display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
                  Your cart is empty
                </div>
              )}
            </div>
            {orderItems.length > 0 && (
              <IonRow style={{ margin: '10px 0', alignItems: 'center' }}>
                <IonCol size='8'>
                  <IonText className='font-size-16'>Total (Tax)</IonText>
                </IonCol>
                <IonCol size='4' className='ion-text-end'>
                  <IonText className='font-size-14 '>
                    ${(totalWithTax / 100).toFixed(2)} ( ${(taxAmount / 100).toFixed(2)})
                  </IonText>
                </IonCol>
              </IonRow>
            )}
            {orderItems.length > 0 && (
              <div style={{ paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                <IonInput
                  clearInput
                  disabled={orderItems.length === 0}
                  aria-label='Customer Name'
                  class='custom'
                  placeholder='What name should we put on your order?'
                  onIonInput={handleNameInput}
                  value={customerName}
                />

                {showPhoneNumberInput && (
                  <IonInput
                    maxlength={10}
                    type='tel'
                    style={{ marginTop: '10px' }}
                    disabled={orderItems.length === 0}
                    clearInput
                    class='custom'
                    placeholder="What's the best number to reach you?"
                    onIonInput={handlePhoneInput}
                    value={phone}
                  />
                )}

                <IonCheckbox
                  value={showPhoneNumberInput}
                  labelPlacement='end'
                  style={{ paddingTop: '10px' }}
                  onIonChange={(e: CustomEvent) => {
                    setShowPhoneNumberInput(e.detail.checked);
                  }}
                >
                  <IonText className='font-size-14'>Get a text message when your order is ready</IonText>
                </IonCheckbox>
                <div>
                  {' '}
                  <IonButton
                    disabled={!isValid}
                    expand='block'
                    className='solid-button'
                    style={{ marginTop: '10px', fontWeight: '700' }}
                    onClick={placeOrder}
                  >
                    Place order
                  </IonButton>
                </div>
              </div>
            )}
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Cart;
