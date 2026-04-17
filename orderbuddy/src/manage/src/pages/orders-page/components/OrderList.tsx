import React from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { IonItemGroup, IonList, IonItem, IonText } from '@ionic/react';
import { Order } from '../types';
import moment from 'moment';
import { OrderStatus } from '../../../constants';

interface DashboardProps {
  orders: Map<string, Order>;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order) => void;
}

const OrderList: React.FC<DashboardProps> = (props) => {
  const { orders, selectedOrder, setSelectedOrder } = props;
  const onSelectedOrderChange = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      {orders.size && (
        <>
          <IonItemGroup>
            <IonList>
              <div
                className='hidescroll'
                style={{
                  maxHeight: '90vh',
                  overflowY: 'scroll',
                }}
              >
                {[...orders.keys()]
                  .sort()
                  .reverse()
                  .map((key) => (
                    <IonItem
                      key={key}
                      onClick={() => {
                        const order = orders.get(key);
                        if (order) {
                          onSelectedOrderChange(order);
                        }
                      }}
                      style={{
                        fontSize: '14px',
                        color: '#424242',
                        fontWeight: orders.get(key)?._id === selectedOrder?._id ? 'bold' : 'normal',
                      }}
                    >
                      <span style={{ paddingRight: '4px' }}>{orders.get(key)?.orderCode} -</span>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: orders.get(key)?._id === selectedOrder?._id ? 'bold' : 'normal',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100px',
                        }}
                      >
                        {orders.get(key)?.customer.name}
                      </span>

                      {orders.get(key)!.status !== OrderStatus.OrderCompleted && (
                        <IonText slot='end' style={{ fontSize: '14px' }}>
                          {moment().diff(moment(orders.get(key)?.startedAt), 'minutes')} mins{' '}
                        </IonText>
                      )}
                    </IonItem>
                  ))}
              </div>
            </IonList>
          </IonItemGroup>
        </>
      )}
    </div>
  );
};

export default OrderList;
