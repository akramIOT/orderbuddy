import React, { useState } from 'react';
import { 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText
} from '@ionic/react';
import { 
  alertCircleOutline, 
  bugOutline, 
  analyticsOutline, 
  fingerPrintOutline,
  eyeOutline
} from 'ionicons/icons';
import { logEvent, logException, logPageView } from '../services/appInsightsService';
import axios from 'axios';

/**
 * A component to test Azure Application Insights integration
 * This component provides buttons to trigger different types of telemetry
 * for testing purposes.
 * 
 * Usage:
 * 1. Import this component into any page
 * 2. Add it to the render function
 * 3. Use the buttons to test different telemetry scenarios
 * 4. Check Azure Portal for results (may take a few minutes to appear)
 */
const AppInsightsTester: React.FC = () => {
  const [eventCount, setEventCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [pageViewCount, setPageViewCount] = useState(0);

  // Test custom event
  const handleTestEvent = () => {
    const newCount = eventCount + 1;
    setEventCount(newCount);
    logEvent('TestEvent', { 
      count: newCount, 
      timestamp: new Date().toISOString(),
      source: 'AppInsightsTester'
    });
  };

  // Test error logging
  const handleTestError = () => {
    const newCount = errorCount + 1;
    setErrorCount(newCount);
    try {
      // Intentionally throw an error for testing
      throw new Error(`Test Error #${newCount} from AppInsightsTester`);
    } catch (error) {
      logException(error as Error, { 
        count: newCount, 
        source: 'AppInsightsTester',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Test page view
  const handleTestPageView = () => {
    const newCount = pageViewCount + 1;
    setPageViewCount(newCount);
    logPageView(
      `Test Page View #${newCount}`, 
      `/test-page-view/${newCount}`,
      { 
        count: newCount,
        source: 'AppInsightsTester',
        timestamp: new Date().toISOString()
      }
    );
  };

  // Test uncaught error (will be caught by global handler)
  const handleUncaughtError = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      // @ts-ignore - intentionally accessing undefined property for testing
      const test = undefined.property;
    }, 100);
  };
  
  // Test API error (will be caught by axios interceptor)
  const handleApiError = async () => {
    try {
      // Make a request to a non-existent endpoint to generate an error
      await axios.get('/api/non-existent-endpoint');
    } catch (error) {
      // The axios interceptor should log this automatically
      console.error('API error triggered:', error);
      // We also log it manually for demonstration
      logException(error as Error, { 
        source: 'AppInsightsTester',
        errorType: 'API',
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Azure Application Insights Tester</IonCardTitle>
      </IonCardHeader>
      
      <IonCardContent>
        <IonText color="medium">
          <p>
            Use these buttons to test if Azure Application Insights is correctly configured and 
            capturing telemetry in your environment.
          </p>
        </IonText>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton 
                expand="block" 
                onClick={handleTestEvent}
                color="primary"
              >
                <IonIcon slot="start" icon={analyticsOutline} />
                Test Custom Event
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton 
                expand="block" 
                onClick={handleTestError}
                color="warning"
              >
                <IonIcon slot="start" icon={bugOutline} />
                Test Error Logging
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton 
                expand="block" 
                onClick={handleTestPageView}
                color="tertiary"
              >
                <IonIcon slot="start" icon={eyeOutline} />
                Test Page View
              </IonButton>
            </IonCol>
            {/* <IonCol>
              <IonButton 
                expand="block" 
                onClick={handleApiError}
                color="secondary"
              >
                <IonIcon slot="start" icon={bugOutline} />
                Test API Error
              </IonButton>
            </IonCol> */}
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton 
                expand="block" 
                onClick={handleUncaughtError}
                color="danger"
              >
                <IonIcon slot="start" icon={alertCircleOutline} />
                Test Uncaught Error
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonList>
          <IonItem>
            <IonIcon icon={fingerPrintOutline} slot="start" />
            <IonLabel>
              <h2>Telemetry Counter</h2>
              <p>Events: {eventCount} | Errors: {errorCount} | Page Views: {pageViewCount}</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonText color="medium">
          <p className="ion-padding-top">
            <small>
              Check your browser console and Azure Portal to verify telemetry is being sent.
              Some telemetry may take a few minutes to appear in the Azure Portal.
            </small>
          </p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );
};

export default AppInsightsTester;
