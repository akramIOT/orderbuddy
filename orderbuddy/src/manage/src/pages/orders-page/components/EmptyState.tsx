import React from 'react';
import { IonText, IonCol, IonRow, IonGrid } from '@ionic/react';

interface EmptyStateProps {
  title: string;
  subTitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, subTitle }) => {
  return (
    <IonGrid>
      <IonRow style={{ height: '57vh' }}>
        <IonCol
          size='12'
          className='ion-text-center'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IonGrid>
            <IonRow className='ion-justify-content-center'>
              <IonText
                style={{
                  fontSize: '16px',
                  color: 'var(--ion-color-medium)',
                }}
              >
                {title}
              </IonText>
            </IonRow>

            <IonRow className='ion-justify-content-center ion-padding-top'>
              <IonText
                style={{
                  fontSize: '16px',
                  color: 'var(--ion-color-medium)',
                }}
              >
                {subTitle}
              </IonText>
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default EmptyState;
