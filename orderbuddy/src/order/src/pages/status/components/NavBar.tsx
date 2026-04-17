import React from 'react';
import { IonRow, IonText, IonGrid, useIonRouter, IonHeader, IonToolbar, IonBackButton, IonButtons } from '@ionic/react';
import { useOrderStore } from '@/stores/orderStore';

const Banner: React.FC = () => {
  const origin = useOrderStore((s) => s.origin);

  return (
    <IonHeader>
      <IonGrid className='navbar-color ion-padding'>
        <IonRow class='ion-justify-content-center'>
          <IonText className='font-size-18 '>Order Status Page</IonText>
        </IonRow>
      </IonGrid>
    </IonHeader>
  );
};

export default Banner;
