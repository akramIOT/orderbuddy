import React from 'react';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonAlert,
  IonSkeletonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  RefresherEventDetail,
} from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { SalesSummaryChart } from './components/SalesSummaryChart';
import { SalesSummaryMetrics } from './components/SalesSummaryMetrics';
import { useSalesSummary } from './useSalesSummary';

const SalesSummaryReport: React.FC = () => {
  // Using default 7 days from the backend
  const { salesData, isLoading, isError, error, refetch, totals } = useSalesSummary();

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    // Use refetch from the hook to refresh data
    refetch();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  };

  return (
    <IonPage>
      <LaunchPadNavBar title='Sales Summary' />

      <IonContent>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div style={{ padding: '16px' }}>
          {isLoading && !salesData && (
            <>
              {/* Skeleton for Metrics Card */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonSkeletonText animated style={{ width: '60%', height: '24px' }} />
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size='6'>
                        <div style={{ padding: '10px' }}>
                          <IonSkeletonText animated style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
                          <IonSkeletonText animated style={{ width: '70%', height: '24px' }} />
                        </div>
                      </IonCol>
                      <IonCol size='6'>
                        <div style={{ padding: '10px' }}>
                          <IonSkeletonText animated style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
                          <IonSkeletonText animated style={{ width: '70%', height: '24px' }} />
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>

              {/* Skeleton for Chart Card */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonSkeletonText animated style={{ width: '50%', height: '24px' }} />
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div
                    style={{
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <IonSkeletonText animated style={{ width: '100%', height: '30px' }} />
                    <IonSkeletonText animated style={{ width: '90%', height: '200px' }} />
                    <IonSkeletonText animated style={{ width: '100%', height: '30px' }} />
                  </div>
                </IonCardContent>
              </IonCard>
            </>
          )}

          {salesData && (
            <>
              <SalesSummaryMetrics
                loading={isLoading}
                totalGrossSales={totals.totalGrossSales}
                totalTax={totals.totalTax}
              />

              <SalesSummaryChart loading={isLoading} data={salesData} />
            </>
          )}
        </div>

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => {}}
          header='Error'
          message={error?.message || 'An unexpected error occurred'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default SalesSummaryReport;
