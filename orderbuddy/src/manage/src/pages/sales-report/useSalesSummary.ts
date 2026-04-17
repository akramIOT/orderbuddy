import { useParams } from 'react-router-dom';
import { useSalesReportSummary, SalesDay } from '../../queries/reports/useSalesReportSummary';
import { sumBy } from 'lodash';
import { logExceptionError } from '../../utils/errorLogger';

export function useSalesSummary() {
  const { restaurantId = '', locationId = '' } = useParams<{ restaurantId: string; locationId: string }>();

  const { data: salesData, isLoading, isError, error, refetch } = useSalesReportSummary(restaurantId, locationId);

  const calculateTotals = (
    data: SalesDay[] = [],
  ): {
    totalGrossSales: number;
    totalTax: number;
  } => {
    try {
      if (!data || data.length === 0) {
        return {
          totalGrossSales: 0,
          totalTax: 0,
        };
      }

      return {
        totalGrossSales: sumBy(data, 'grossSales'),
        totalTax: sumBy(data, 'tax'),
      };
    } catch (error) {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'useSalesSummary.calculateTotals',
        { restaurantId, locationId }
      );
      return {
        totalGrossSales: 0,
        totalTax: 0,
      };
    }
  };

  const totals = calculateTotals(salesData);

  return {
    salesData,
    isLoading,
    isError,
    error,
    refetch,
    totals,
  };
}
