import React from 'react';
import { SalesItem } from '../../../queries/reports/useSalesItemApi';

interface SalesItemListProps {
  items: SalesItem[];
  calculateWidth: (sales: number) => number;
  formatCurrency: (value: number) => string;
}

export const SalesItemList: React.FC<SalesItemListProps> = ({ items, calculateWidth, formatCurrency }) => {
  return (
    <div className='sales-item-list'>
      {items.map((item, index) => (
        <div className='sales-item' key={index}>
          <div className='sales-item-info'>
            <div className='sales-item-image'>
              <div className='placeholder-image'>{item.itemName.charAt(0)}</div>
            </div>
            <div className='sales-item-details'>
              <h3>{item.itemName}</h3>
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
