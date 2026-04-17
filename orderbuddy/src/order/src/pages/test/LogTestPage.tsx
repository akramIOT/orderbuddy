import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton 
} from '@ionic/react';
import { LogTestComponent } from './LogTestComponent';

const LogTestPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Test Application Insights Logging</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <LogTestComponent />
      </IonContent>
    </IonPage>
  );
};

export default LogTestPage;
