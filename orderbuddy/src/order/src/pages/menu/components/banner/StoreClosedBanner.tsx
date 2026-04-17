import React from 'react';
import { IonToolbar, IonText, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import { timeOutline } from 'ionicons/icons';
import { t, getUserLang } from '@/utils/localization';



const StoreClosedBanner: React.FC = () => {
  const currentLang = getUserLang();

  return (
    <IonToolbar>
      <IonGrid className='ion-padding-start ion-padding-end'>
        <IonRow className='ion-align-items-center'>
          <IonCol size='2' className='ion-text-center'>
            <IonIcon
              icon={timeOutline}
              style={{
                fontSize: '24px',
              }}
            />
          </IonCol>
          <IonCol size='9' className='ion-text-center'>
            <IonText>
              <h4 style={{ margin: '0', fontWeight: 'bold' }}>{t({ en: 'Store Is Currently Closed' }, currentLang)}</h4>
             
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonToolbar>
  );
};

export default StoreClosedBanner;
