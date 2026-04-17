import React from 'react';
import { salesOrigin } from '../../../queries/reports/useSalesOriginApi';

interface SalesOriginProps {
  items: salesOrigin[];
  calculateWidth: (sales: number) => number;
  formatCurrency: (value: number) => string;
}

export const SalesOriginList: React.FC<SalesOriginProps> = ({ items, calculateWidth, formatCurrency }) => {
  return (
    <div className='sales-item-list'>
      {items.map((item, index) => (
        <div className='sales-item' key={index}>
          <div className='sales-item-info'>
            <div className='sales-item-image'>
              <div className='placeholder-image'>{index + 1}</div>
            </div>
            <div className='sales-item-details'>
              <h3>{item.name ? `${item.name}` : `Origin ID: ${item.originId}`}</h3>
              <p>{item.soldCount} sold</p>
            </div>
            <div className='sales-item-amount'>{formatCurrency(item.grossSales)}</div>
          </div>
          <div className='sales-item-progress-container'>
            <div className='sales-item-progress-bar' style={{ width: `${calculateWidth(item.grossSales)}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
