import React from 'react';
import { IonItem, IonLabel, IonRange, IonText, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import '../../../../style.css';
interface OrderAcceptanceProps {
  startAcceptMinutes: number;
  stopAcceptMinutes: number;
  updateStartAcceptOrders: (e: CustomEvent) => void;
  updateStopAcceptOrders: (e: CustomEvent) => void;
}

const OrderAcceptance: React.FC<OrderAcceptanceProps> = ({
  startAcceptMinutes,
  stopAcceptMinutes,
  updateStartAcceptOrders,
  updateStopAcceptOrders,
}) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol size='12'>
          <IonItem lines='none'>
            <IonLabel position='stacked'>
              <h1>
                Start accepting orders {startAcceptMinutes === 0 && 'immediately'}
                {startAcceptMinutes > 0 && (
                  <>
                    <span style={{ fontWeight: 'bold' }}>{startAcceptMinutes} min</span> after opening
                  </>
                )}
              </h1>
            </IonLabel>
            <IonRange
              min={0}
              max={60}
              step={10}
              pin={true}
              snaps={true}
              pinFormatter={(value: number) => (value === 0 ? 'Now' : `${value} min`)}
              value={startAcceptMinutes}
              onIonChange={updateStartAcceptOrders}
              labelPlacement='start'
            />
          </IonItem>
          <IonRow class='ion-justify-content-between'>
            <IonCol size='6' className='ion-text-start'>
             0 min
            </IonCol>
            <IonCol size='6' className='ion-text-end'>
              60 min
            </IonCol>
          </IonRow>
        </IonCol>
      </IonRow>

      <IonRow>
        <IonCol size='12'>
          <IonItem lines='none'>
            <IonLabel position='stacked'>
              <h1>
                Stop accepting orders {stopAcceptMinutes === 0 && 'at closing time'}
                {stopAcceptMinutes > 0 && (
                  <>
                    <span style={{ fontWeight: 'bold' }}>{stopAcceptMinutes} min</span> before closing
                  </>
                )}
              </h1>
            </IonLabel>
            <IonRange
              min={0}
              max={60}
              step={10}
              pin={true}
              snaps={true}
              pinFormatter={(value: number) => (value === 0 ? 'Closing' : `${value} min`)}
              value={stopAcceptMinutes}
              onIonChange={updateStopAcceptOrders}
              labelPlacement='start'
            />
          </IonItem>
          <IonRow class='ion-justify-content-between'>
            <IonCol size='6' className='ion-text-start'>
            0 min
            </IonCol>
            <IonCol size='6' className='ion-text-end'>
              60 min
            </IonCol>
          </IonRow>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default OrderAcceptance;
