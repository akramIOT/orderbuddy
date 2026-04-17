import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonSkeletonText } from '@ionic/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SalesDay } from '../../../queries/reports/useSalesReportSummary';

interface SalesSummaryChartProps {
  data: SalesDay[];
  loading?: boolean;
}

const currencyFormatter = (value: number) => `$${value.toFixed(2)}`;

// Format dates for better display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const SalesSummaryChart: React.FC<SalesSummaryChartProps> = ({ data, loading = false }) => {
  const formattedData =
    data?.map((day) => ({
      ...day,
      formattedDate: formatDate(day.date),
      grossSalesBase: day.grossSales - day.tax, // The base part (excluding tax)
      tax: day.tax,
    })) || [];

  return (
    <IonCard style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <IonCardHeader>
      </IonCardHeader>
      <IonCardContent>
        {loading && (
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <IonSkeletonText animated style={{ width: '100%', height: '30px' }} />
            <IonSkeletonText animated style={{ width: '90%', height: '200px' }} />
            <IonSkeletonText animated style={{ width: '100%', height: '30px' }} />
          </div>
        )}

        {!loading && formattedData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No sales data available for this period
          </div>
        )}

        {!loading && formattedData.length > 0 && (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey='formattedDate' />
              <YAxis tickFormatter={currencyFormatter} />
              <Tooltip
                formatter={(value, name) => {
                  switch (name) {
                    case 'Gross Sales':
                      return [currencyFormatter(value as number), 'Net Amount'];
                    default:
                      return [currencyFormatter(value as number), name];
                  }
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {/* Stacked bar chart - each value is stacked on top of the previous one */}
              <Bar dataKey='grossSalesBase' stackId='a' fill='#3b82f6' name='Gross Sales' />
              <Bar dataKey='tax' stackId='a' fill='#fbbf24' name='Taxes & Fees' />
            </BarChart>
          </ResponsiveContainer>
        )}
      </IonCardContent>
    </IonCard>
  );
};
