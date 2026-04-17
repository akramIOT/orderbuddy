import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonList,
  IonItemDivider,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import { MdPrint, MdDone } from 'react-icons/md';
import moment from 'moment';
import { UseMutationResult } from '@tanstack/react-query';
import { OrderStatus } from '../../../constants';
import { Order } from '../useOrdersQuery';

interface SelectedOrderProps {
  selectedOrder: Order | null;
  updateOrderStatus?: (orderId: string, orderStatus: string, correlationId: string) => void;
  printOrder?: (order: Order) => void;
}

const OrderDetail: React.FC<SelectedOrderProps> = (props) => {
  const { selectedOrder, updateOrderStatus, printOrder } = props;
  return (
    <>
      {selectedOrder && (
        <div style={{ overflowY: 'auto', paddingBottom: '24px' }}>
          <IonCard>
            <IonCardHeader className='ion-no-padding ion-padding-start ion-padding-end'>
              <IonList>
                <IonItemDivider className='ion-no-padding ion-padding-bottom end-gap-cover'>
                  <IonGrid className='ion-no-padding'>
                    <IonRow className='ion-align-items-center'>
                      <IonCol className='ion-text-start' size='8'>
                        <span style={{ fontSize: '14px' }}>Order: {selectedOrder.orderCode}</span>
                      </IonCol>
                      <IonCol className='ion-text-end' size='4'>
                        <IonButton
                          fill='clear'
                          style={{ margin: 0, height: '35px' }}
                          onClick={() => {
                            if (selectedOrder && printOrder) {
                              printOrder(selectedOrder);
                            }
                          }}
                        >
                          <MdPrint size={24} color='#424242' />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                    <IonRow className='ion-align-items-center'>
                      <IonCol className='ion-text-start' size='6'>
                        <span style={{ fontSize: '14px' }}>Origin: {selectedOrder.origin.name}</span>
                      </IonCol>
                      <IonCol size='6'></IonCol>
                    </IonRow>
                    <IonRow className='ion-align-items-center'>
                      <IonCol className='ion-text-start' size='8' style={{ paddingTop: '10px' }}>
                        <span style={{ fontSize: '14px' }}>Name: {selectedOrder.customer.name}</span>
                      </IonCol>
                      <IonCol className='ion-text-end' size='4'>
                        <span style={{ fontSize: '14px' }}>{moment(selectedOrder.startedAt).format('LT')}</span>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItemDivider>
              </IonList>
            </IonCardHeader>

            <IonCardContent>
              <div className='hidescroll' style={{ maxHeight: '54vh', overflowY: 'scroll' }}>
                {selectedOrder.items.map((item, index) => (
                  <IonItem key={index}>
                    <IonGrid>
                      <IonRow>
                        <IonCol size='8'>
                          <IonLabel>
                            <div style={{ fontSize: '14px' }}>{item.name}</div>
                            {item.variants && item.variants.length > 0 && (
                              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                {item.variants.map((variant) => variant.name).join(', ')}
                              </div>
                            )}
                            {item.modifiers?.map((modifiersOptions, index) => (
                              <span key={index} style={{ fontSize: '12px' }}>
                                <IonText style={{ fontWeight: 'bold' }}>{modifiersOptions.name}: </IonText>
                                {modifiersOptions.options?.map((option, optIndex) => (
                                  <React.Fragment key={optIndex}>
                                    {option.name}
                                    {optIndex !== (modifiersOptions.options?.length || 0) - 1 && ', '}
                                  </React.Fragment>
                                ))}
                                <br />
                              </span>
                            ))}
                            {item.notes && (
                              <div style={{ maxWidth: '300px' }}>
                                <span style={{ fontSize: '12px' }}>
                                  <IonText> {item.notes}</IonText>
                                </span>
                              </div>
                            )}
                          </IonLabel>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.completedAt && (
                        <div>
                          <MdDone size={18} color='green' />
                        </div>
                      )}
                      {!item.completedAt && item.startedAt && <LoadingDots />}
                      <IonLabel slot='end' className='ion-text-end'>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>${(item.priceCents / 100).toFixed(2)}</div>
                      </IonLabel>
                    </div>
                  </IonItem>
                ))}
              </div>
              <OrderSummary selectedOrder={selectedOrder} />
            </IonCardContent>
          </IonCard>

          {selectedOrder.status !== OrderStatus.OrderCompleted && updateOrderStatus && (
            <OrderActions selectedOrder={selectedOrder} updateOrderStatus={updateOrderStatus} />
          )}
          {selectedOrder.status !== OrderStatus.OrderCompleted && <OrderPaymentDetails selectedOrder={selectedOrder} />}

          <OrderTimeline selectedOrder={selectedOrder} />
        </div>
      )}
    </>
  );
};

const LoadingDots: React.FC = () => (
  <div>
    <svg xmlns='http://www.w3.org/2000/svg' width='1.2rem' height='1.2rem' viewBox='0 0 24 24'>
      <circle cx='4' cy='12' r='3' fill='currentColor'>
        <animate
          id='svgSpinners3DotsBounce0'
          attributeName='cy'
          begin='0;svgSpinners3DotsBounce1.end+0.25s'
          calcMode='spline'
          dur='0.6s'
          keySplines='.33,.66,.66,1;.33,0,.66,.33'
          values='12;6;12'
        />
      </circle>
      <circle cx='12' cy='12' r='3' fill='currentColor'>
        <animate
          attributeName='cy'
          begin='svgSpinners3DotsBounce0.begin+0.1s'
          calcMode='spline'
          dur='0.6s'
          keySplines='.33,.66,.66,1;.33,0,.66,.33'
          values='12;6;12'
        />
      </circle>
      <circle cx='20' cy='12' r='3' fill='currentColor'>
        <animate
          id='svgSpinners3DotsBounce1'
          attributeName='cy'
          begin='svgSpinners3DotsBounce0.begin+0.2s'
          calcMode='spline'
          dur='0.6s'
          keySplines='.33,.66,.66,1;.33,0,.66,.33'
          values='12;6;12'
        />
      </circle>
    </svg>
  </div>
);

const OrderSummary: React.FC<{ selectedOrder: Order }> = (props) => {
  const { selectedOrder } = props;

  return (
    <div className='ion-padding-top'>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '14px' }}>Total</span>
          <span style={{ fontSize: '14px', paddingLeft: '5px' }}>({selectedOrder.items.length} items)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'flex-end' }}>
            ${(selectedOrder.totalPriceCents / 100).toFixed(2)}{' '}
          </div>
          <div style={{ fontSize: '14px' }}>tax included</div>
        </div>
      </div>
    </div>
  );
};

const OrderActions: React.FC<{
  selectedOrder: Order;
  updateOrderStatus?: (orderId: string, orderStatus: string, correlationId: string) => void;
}> = (props) => {
  const { selectedOrder, updateOrderStatus } = props;

  const handleUpdateOrderStatus = (orderStatus: string) => {
    if (updateOrderStatus) updateOrderStatus(selectedOrder._id, orderStatus, selectedOrder.meta.correlationId);
  };

  return (
    <IonCard className='ion-padding'>
      <IonCardContent className='ion-text-center'>

        {selectedOrder.status === OrderStatus.OrderCreated && (
          <IonButton
            fill='outline'
            style={{ textTransform: 'capitalize' }}
            onClick={() => handleUpdateOrderStatus(OrderStatus.OrderAccepted)}
          >
            Accept Order
          </IonButton>
        )}
        {selectedOrder.status === OrderStatus.OrderAccepted && (
          <IonButton
            fill='outline'
            style={{ textTransform: 'capitalize' }}
            onClick={() => handleUpdateOrderStatus(OrderStatus.ReadyForPickup)}
          >
            Ready for pickup
          </IonButton>
        )}
        {selectedOrder.status === OrderStatus.ReadyForPickup && (
          <IonButton
            fill='outline'
            style={{ textTransform: 'capitalize' }}
            onClick={() => handleUpdateOrderStatus(OrderStatus.OrderCompleted)}
          >
            Complete Order
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

const OrderPaymentDetails: React.FC<{ selectedOrder: Order }> = (props) => {
  const { selectedOrder } = props;

  return (
    <IonCard>
      <IonCardContent className='ion-text-center'>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonText>Payment Details</IonText>
              <IonRow className='ion-justify-content-between ion-align-items-center'>
                <span>Tax</span>
                <span>${((selectedOrder.totalPriceCents * 0.1) / 100).toFixed(2)}</span>
              </IonRow>
              <IonRow className='ion-justify-content-between ion-align-items-center'>
                <span>Total</span>
                <span>${selectedOrder.totalPriceCents / 100}</span>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

const TimelineItem: React.FC<{
  color: string;
  title: string;
  time: string;
}> = (props) => {
  const { color, title, time } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <div>
        <div style={{ fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#666' }}>{time}</div>
      </div>
    </div>
  );
};

const OrderTimeline: React.FC<{ selectedOrder: Order }> = (props) => {
  const { selectedOrder } = props;

  return (
    <IonCard>
      <IonCardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Order Timeline</h4>
          <TimelineItem color='#4cb775' title='Order Received' time={moment(selectedOrder.startedAt).format('LT')} />
          {selectedOrder.items.some((item) => item.startedAt) && (
            <TimelineItem
              color='#873a97'
              title='Order Preparation Started'
              time={moment(selectedOrder.items.find((item) => item.startedAt)?.startedAt).format('LT')}
            />
          )}
          {selectedOrder.items.every((item) => item.completedAt) && (
            <TimelineItem
              color='#2b9348'
              title='All Items Completed'
              time={moment(
                Math.max(
                  ...selectedOrder.items.map((item) => (item.completedAt ? new Date(item.completedAt).getTime() : 0)),
                ),
              ).format('LT')}
            />
          )}
          {selectedOrder.status === OrderStatus.OrderCompleted && (
            <TimelineItem color='#1e88e5' title='Order Completed' time={moment(selectedOrder.endedAt).format('LT')} />
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default OrderDetail;
