import { useParams } from 'react-router-dom';
import { salesOrigin, useSalesOriginApi } from '../../queries/reports/useSalesOriginApi';
import { maxBy, sumBy } from 'lodash';

// Move formatCurrency function here
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export function useSalesOrigin(selectedDate: string) {
  const { restaurantId = '', locationId = '' } = useParams<{ restaurantId: string; locationId: string }>();

  const {
    data: salesOrigin = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSalesOriginApi(restaurantId, locationId, selectedDate);

  const maxItem = maxBy(salesOrigin, 'grossSales');
  const maxSales = maxItem ? maxItem.grossSales : 0;

  const calculateWidth = (sales: number): number => {
    return maxSales > 0 ? (sales / maxSales) * 100 : 0;
  };

  return {
    salesOrigin,
    isLoading,
    isError,
    error,
    refetch,
    maxSales,
    formatCurrency,
    calculateWidth,
  };
}
