import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonContent,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonFooter,
  IonText,
  IonToolbar,
  IonTitle,
  IonIcon,
} from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { Order } from './types';
import { useOrders } from './useOrders';

import EmptyState from './components/EmptyState';
import ActiveOrdersTab from './components/ActiveOrdersTab';
import CompletedOrdersTab from './components/CompletedOrdersTab';
import { alarmOutline, hourglassOutline } from 'ionicons/icons';

const OrdersPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<{
    restaurantId: string;
    locationId: string;
  }>();

  const [selectedActiveOrder, setSelectedActiveOrder] = useState<Order | null>(null);
  const [selectedCompletedOrder, setSelectedCompletedOrder] = useState<Order | null>(null);

  const {
    activeOrders,
    completedOrders,
    updateOrderItemStatus,
    updateOrderStatus,
    printOrder,
    isMobile,
    getOrderItemStats,
  } = useOrders(restaurantId, locationId);
  const { inProgress, inQueue } = getOrderItemStats();
  useEffect(() => {
    // if (selectedActiveOrder && activeOrders.has(selectedActiveOrder._id)) return;
    if (selectedActiveOrder && activeOrders.has(selectedActiveOrder._id)) {
      setSelectedActiveOrder(activeOrders.get(selectedActiveOrder._id)!);
      return;
    }
    if (activeOrders.size) {
      const firstActiveOrder = activeOrders.values().next().value!;
      setSelectedActiveOrder(firstActiveOrder);
      return;
    }

    setSelectedActiveOrder(null);
  }, [activeOrders]);

  useEffect(() => {
    if (selectedCompletedOrder && completedOrders.has(selectedCompletedOrder._id)) return;
    if (completedOrders.size) {
      const firstCompletedOrder = completedOrders.values().next().value!;
      setSelectedCompletedOrder(firstCompletedOrder);
      return;
    }

    setSelectedCompletedOrder(null);
  }, [completedOrders]);

  return (
    <IonPage>
      <LaunchPadNavBar title='Orders' />
      <IonContent fullscreen scrollY={false}>
        <IonSegment>
          <IonSegmentButton value='active' contentId='active'>
            <IonLabel style={{ textTransform: 'capitalize' }}>
              Active {activeOrders.size > 0 && `(${activeOrders.size})`}
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value='completed' contentId='completed'>
            <IonLabel style={{ textTransform: 'capitalize' }}>
              Completed {completedOrders.size > 0 && `(${completedOrders.size})`}
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value='future' contentId='future'>
            <IonLabel style={{ textTransform: 'capitalize' }}>Future</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonSegmentView>
          <IonSegmentContent id='active'>
            <ActiveOrdersTab
              orders={activeOrders}
              updateOrderStatus={updateOrderStatus}
              updateOrderItemStatus={updateOrderItemStatus}
              selectedOrder={selectedActiveOrder}
              setSelectedOrder={setSelectedActiveOrder}
              printOrder={printOrder}
              isMobile={isMobile}
            />
          </IonSegmentContent>

          <IonSegmentContent id='completed'>
            <CompletedOrdersTab
              orders={completedOrders}
              selectedOrder={selectedCompletedOrder}
              setSelectedOrder={setSelectedCompletedOrder}
              printOrder={printOrder}
              isMobile={isMobile}
            />
          </IonSegmentContent>

          <IonSegmentContent id='future'>
            <EmptyState
              title='🕒 No upcoming orders just yet.'
              subTitle='You’re all set — we’ll add future orders here as they come in.'
            />
          </IonSegmentContent>
        </IonSegmentView>
      </IonContent>
      {activeOrders.size > 0 && (
        <IonFooter translucent={true}>
          <IonToolbar>
            <IonTitle slot='end' style={{ fontSize: '14px' }}>
              <IonIcon
                icon={alarmOutline}
                style={{ verticalAlign: 'middle', marginRight: '4px' }}
              />{' '}
              <span style={{ fontWeight: 'bold' }}>{inProgress}</span> In Progress
              <IonIcon
                icon={hourglassOutline}
                style={{ verticalAlign: 'middle', marginRight: '4px', paddingLeft: '14px' }}
              />
              <span style={{ fontWeight: 'bold' }}>{inQueue}</span> In Queue
            </IonTitle>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default OrdersPage;
