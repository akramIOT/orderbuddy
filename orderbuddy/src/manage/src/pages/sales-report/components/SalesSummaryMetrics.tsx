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
  IonSpinner,
  IonSkeletonText,
} from '@ionic/react';

interface SalesSummaryMetricsProps {
  loading?: boolean;
  totalGrossSales: number;
  totalTax: number;
  days?: number;
}

// Format currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

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

export const SalesSummaryMetrics: React.FC<SalesSummaryMetricsProps> = ({
  loading = false,
  totalGrossSales,
  totalTax,
}) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Sales Metrics </IonCardTitle>
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
              <IonCol size='6'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Gross Sales</h3>
                  </IonText>
                  <IonText color='dark'>
                    <h2 style={{ ...metricValueStyle, color: '#3b82f6' }}>{formatCurrency(totalGrossSales)}</h2>
                  </IonText>
                </div>
              </IonCol>

              <IonCol size='6'>
                <div style={metricContainerStyle}>
                  <IonText color='medium'>
                    <h3 style={metricLabelStyle}>Taxes</h3>
                  </IonText>
                  <IonText color='warning'>
                    <h2 style={metricValueStyle}>{formatCurrency(totalTax)}</h2>
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
