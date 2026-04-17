import React, { useEffect, useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { Order } from '../types';
import moment from 'moment';
import EmptyDashboard from './EmptyState';
import { MdDone } from 'react-icons/md';
import { close } from 'ionicons/icons';
import MobileOrderDetail from './MobileOrderDetail';
import { OrderStatus } from '../../../constants';

interface OrderItem {
  id: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

interface MobileOrderListProps {
  orders: Map<string, Order>;
  selectedOrder?: Order | null;
  tabValue?: string;
  setSelectedOrder: (order: Order) => void;
  updateOrderStatus?: (orderId: string, orderStatus: string, correlationId: string) => void;
  updateOrderItemStatus?: (
    orderId: string,
    itemId: string,
    orderItemStatus: string,
    stationTags: string[],
    correlationId: string,
  ) => void;
  printOrder?: (order: Order) => void;
}

const MobileOrderList: React.FC<MobileOrderListProps> = (props) => {
  const { orders, selectedOrder, tabValue, setSelectedOrder, updateOrderStatus, updateOrderItemStatus, printOrder } =
    props;
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (!selectedOrder) {
      setShowModal(false);
    }
    if (selectedOrder && selectedOrder.status === OrderStatus.OrderCompleted && tabValue !== 'completed') {
      setShowModal(false);
    }
  }, [selectedOrder, orders]);
  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <>
      {!!orders.size && (
        <IonList>
          {[...orders.keys()]
            .sort()
            .reverse()
            .map((key) => {
              const order = orders.get(key);
              if (!order) return null;

              return (
                <IonItem key={key} id='order-detail' onClick={() => handleOrderSelect(order)}>
                  <span style={{ paddingRight: '4px', fontSize: '14px' }}>{order.orderCode} -</span>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px',
                    }}
                    title={order.customer.name}
                  >
                    {order.customer.name}
                  </span>

                  <IonLabel slot='end' style={{ fontSize: '14px' }}>
                    {order.items.every((item: OrderItem) => item.completedAt) ? (
                      <div>
                        <MdDone fontWeight={'bold'} size={18} />
                      </div>
                    ) : (
                      order.items.some((item: OrderItem) => item.startedAt) && (
                        <div>
                          <svg xmlns='http://www.w3.org/2000/svg' width='1.2rem' height='1.2rem' viewBox='0 0 24 24'>
                            <circle cx='4' cy='12' r='3' fill='currentColor'>
                              <animate
                                attributeName='cy'
                                begin='0s'
                                dur='0.6s'
                                values='12;6;12'
                                repeatCount='indefinite'
                              />
                            </circle>
                            <circle cx='12' cy='12' r='3' fill='currentColor'>
                              <animate
                                attributeName='cy'
                                begin='0.2s'
                                dur='0.6s'
                                values='12;6;12'
                                repeatCount='indefinite'
                              />
                            </circle>
                            <circle cx='20' cy='12' r='3' fill='currentColor'>
                              <animate
                                attributeName='cy'
                                begin='0.4s'
                                dur='0.6s'
                                values='12;6;12'
                                repeatCount='indefinite'
                              />
                            </circle>
                          </svg>
                        </div>
                      )
                    )}
                  </IonLabel>
                </IonItem>
              );
            })}
        </IonList>
      )}

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonButton onClick={() => setShowModal(false)}>
                <IonText>cancel</IonText>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <div style={{ height: 'calc(100% - 56px)', overflowY: 'auto', padding: '16px 0' }}>
          {selectedOrder && (
            <MobileOrderDetail
              selectedOrder={selectedOrder}
              updateOrderStatus={updateOrderStatus}
              updateOrderItemStatus={updateOrderItemStatus}
              printOrder={printOrder}
            />
          )}
        </div>
      </IonModal>
    </>
  );
};

export default MobileOrderList;
