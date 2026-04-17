import { IonButton, IonFooter, IonText, IonToolbar } from '@ionic/react';
import React from 'react';

interface CheckoutButtonProps {
  isValidPlaceOrder: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ isValidPlaceOrder }) => (
  <IonFooter>
    <IonToolbar>
      <IonButton
        disabled={!isValidPlaceOrder}
        expand='block'
        className='solid-button'
        style={{
          paddingLeft: '10px',
          paddingRight: '10px',
          color: '#ffff',
        }}
        id='open-payment'
      >
        <IonText style={{ color: '#ffff' }}>Check out</IonText>
      </IonButton>
    </IonToolbar>
  </IonFooter>
);
