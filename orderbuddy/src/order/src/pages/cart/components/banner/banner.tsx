import React from 'react';
import { IonRow, IonText, IonGrid, useIonRouter, IonHeader, IonToolbar, IonBackButton, IonButtons } from '@ionic/react';
import { useOrderStore } from '@/stores/orderStore';

const Banner: React.FC = () => {
  const origin = useOrderStore((s) => s.origin);

  return (
    <IonHeader>
      <IonGrid className='navbar-color '>
        <IonRow class='ion-justify-content-between ion-align-items-center'>
          <IonButtons>
            <IonBackButton />
          </IonButtons>

          <IonText className='font-size-18'>Order Summary</IonText>
          <IonText>
            <IonText>{origin.name ? origin.name : 'Web'}</IonText>
          </IonText>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Banner;
