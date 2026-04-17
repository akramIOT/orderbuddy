import { useParams } from 'react-router-dom';
import { SalesItem, useSalesItemApi } from '../../queries/reports/useSalesItemApi';
import { maxBy, sumBy } from 'lodash';

// Move formatCurrency function here
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export function useSalesItem(selectedDate: string) {
  const { restaurantId = '', locationId = '' } = useParams<{ restaurantId: string; locationId: string }>();

  const {
    data: salesItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSalesItemApi(restaurantId, locationId, selectedDate);

  const maxItem = maxBy(salesItems, 'grossSales');
  const maxSales = maxItem ? maxItem.grossSales : 0;

  const topSellingItem = maxBy(salesItems, 'soldCount');
  const topSellingItemName = topSellingItem ? topSellingItem.itemName : 'N/A';

  const totalSales = sumBy(salesItems, 'grossSales');

  const totalItems = sumBy(salesItems, 'soldCount');

  const averageSalesPerItem = salesItems.length > 0 ? totalSales / salesItems.length : 0;

  const calculateWidth = (sales: number): number => {
    return maxSales > 0 ? (sales / maxSales) * 100 : 0;
  };

  return {
    salesItems,
    isLoading,
    isError,
    error,
    refetch,
    maxSales,
    totalSales,
    calculateWidth,
    formatCurrency,
    topSellingItemName,
    totalItems,
    averageSalesPerItem,
  };
}
