import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSkeletonText,
} from '@ionic/react';

interface SalesItemMetricsProps {
  loading?: boolean;
  totalSales: number;
  totalItems: number;
  averageSalesPerItem: number;
  topSellingItem: string;
  formatCurrency: (value: number) => string;
}

export const SalesItemMetrics: React.FC<SalesItemMetricsProps> = ({
  loading = false,
  totalSales,
  totalItems,
  averageSalesPerItem,
  topSellingItem,
  formatCurrency,
}) => {
  // Style definitions
  const metricContainerStyle = {
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    marginBottom: '16px',
    textAlign: 'center' as const,
  };

  const metricLabelStyle = {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 500,
  };

  const metricValueStyle = {
    marginTop: 0,
    fontSize: '20px',
    fontWeight: 700,
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Sales Metrics</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {loading ? (
          <IonGrid>
            <IonRow>
              <IonCol size='6'>
                <div style={metricContainerStyle}>
                  <IonSkeletonText animated style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
                  <IonSkeletonText animated style={{ width: '70%', height: '24px' }} />
                </div>
              </IonCol>
              <IonCol size='6'>
                <div style={metricContainerStyle}>
                  <IonSkeletonText animated style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
                  <IonSkeletonText animated style={{ width: '70%', height: '24px' }} />
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol size='6' sizeMd='3'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Total Sales</h3>
                  </IonText>
                  <IonText color='dark'>
                    <h2 style={{ ...metricValueStyle, color: '#3b82f6' }}>{formatCurrency(totalSales)}</h2>
                  </IonText>
                </div>
              </IonCol>

              <IonCol size='6' sizeMd='3'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Items Sold</h3>
                  </IonText>
                  <IonText color='dark'>
                    <h2 style={metricValueStyle}>{totalItems}</h2>
                  </IonText>
                </div>
              </IonCol>

              <IonCol size='6' sizeMd='3'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Avg. Sale per Item</h3>
                  </IonText>
                  <IonText color='success'>
                    <h2 style={metricValueStyle}>{formatCurrency(averageSalesPerItem)}</h2>
                  </IonText>
                </div>
              </IonCol>

              <IonCol size='6' sizeMd='3'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Top Selling Item</h3>
                  </IonText>
                  <IonText color='warning'>
                    <h2 style={{ ...metricValueStyle, fontSize: '16px' }}>{topSellingItem}</h2>
                  </IonText>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonCardContent>
    </IonCard>
  );
};
