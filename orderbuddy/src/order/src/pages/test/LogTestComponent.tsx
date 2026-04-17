import React from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonText
} from '@ionic/react';
import { 
  testLogging, 
  simulateNetworkError, 
  generateUncaughtError, 
  generateUnhandledPromiseRejection 
} from '../../utils/logTester';

interface LogTestComponentProps {
  visible?: boolean;
}

export const LogTestComponent: React.FC<LogTestComponentProps> = ({ visible = true }) => {
  // Only render if visible is true
  if (!visible) return null;
  
  const handleTestClick = () => {
    testLogging();
  };
  
  const handleNetworkErrorClick = async () => {
    try {
      await simulateNetworkError();
    } catch (error) {
      console.error('Network error simulation completed');
    }
  };
  
  const handleUncaughtErrorClick = () => {
    generateUncaughtError();
  };
  
  const handlePromiseRejectionClick = () => {
    generateUnhandledPromiseRejection();
  };
  
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Application Insights Logging Test</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText>
          <p>Use these buttons to test Application Insights logging. Check your console and Application Insights for results.</p>
        </IonText>
        
        <IonList>
          <IonItem>
            <IonButton onClick={handleTestClick} expand="block">
              Test Basic Logging
            </IonButton>
          </IonItem>
          
          <IonItem>
            <IonButton onClick={handleNetworkErrorClick} expand="block">
              Test Network Error
            </IonButton>
          </IonItem>
          
          <IonItem>
            <IonButton onClick={handleUncaughtErrorClick} expand="block" color="warning">
              Test Uncaught Error
            </IonButton>
            <IonLabel>
              <p className="ion-text-wrap ion-padding-start">
                <small>This will generate an uncaught error to test global error handling</small>
              </p>
            </IonLabel>
          </IonItem>
          
          <IonItem>
            <IonButton onClick={handlePromiseRejectionClick} expand="block" color="warning">
              Test Promise Rejection
            </IonButton>
            <IonLabel>
              <p className="ion-text-wrap ion-padding-start">
                <small>This will generate an unhandled promise rejection</small>
              </p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};
