import { IonCheckbox, IonInput, IonText } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useOrderStore } from '@/stores/orderStore';
interface CustomerData {
  name: string;
  phone: string;
  getSms: boolean;
}
interface InputFieldProps {
  onValidityChange?: (isValid: boolean) => void;
  onCustomerDataChange: React.Dispatch<React.SetStateAction<CustomerData>>;
}

export const InputField: React.FC<InputFieldProps> = ({ onValidityChange, onCustomerDataChange }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhoneNumberInput, setShowPhoneNumberInput] = useState(false);
  const cartItems = useOrderStore((s) => s.cart.items);
  useEffect(() => {
    onCustomerDataChange({
      name: customerName,
      phone: phone,
      getSms: showPhoneNumberInput,
    });
  }, [customerName, phone, showPhoneNumberInput]);

  useEffect(() => {
    const isValid = customerName.length > 0 && (!showPhoneNumberInput || phone.length === 10);
    onValidityChange?.(isValid);
  }, [customerName, phone, showPhoneNumberInput, onValidityChange]);
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
      setPhone('');
      return;
    }

    if (originalValue.length === 10) {
      setPhone(originalValue);
    }
  };

  return (
    <div className='ion-no-padding ion-padding-start ion-padding-end ion-padding-bottom'>
      <IonInput
        disabled={cartItems.length === 0}
        clearInput={true}
        aria-label='Custom input'
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
          disabled={cartItems.length === 0}
          clearInput={true}
          aria-label='Custom input'
          class='custom'
          placeholder="What's the best number to reach you?"
          onIonInput={handlePhoneInput}
          value={phone}
        />
      )}

      <IonCheckbox
        labelPlacement='end'
        style={{
          paddingTop: '10px',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
        }}
        onIonChange={(e: CustomEvent) => {
          setShowPhoneNumberInput(e.detail.checked);
        }}
      >
        <IonText className='font-size-14'>Get a text message when your order is ready</IonText>
      </IonCheckbox>

      <p>
        <sub>
          By providing your phone number and checking this box, you consent to receiving text messages from OrderBuddy
          informing you on updates on your order. Message and data rates may apply. Reply HELP for help or STOP to
          cancel. View our{' '}
          <a href={`${import.meta.env.VITE_MENU_ENDPOINT}/privacy`} target='_blank' className='link-color'>
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href={`${import.meta.env.VITE_MENU_ENDPOINT}/terms`} target='_blank' className='link-color'>
            Terms of Service
          </a>
          .
        </sub>
      </p>
    </div>
  );
};
