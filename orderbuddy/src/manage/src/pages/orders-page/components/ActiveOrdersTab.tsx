import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { Order } from '../types';
import MobileOrderList from './MobileOrderList';
import OrderDetail from './OrderDetail';
import OrderList from './OrderList';
import TabletOrderListAndDetail from './TabletOrderListAndDetail';
import EmptyState from './EmptyState';

interface ActiveOrdersTabProps {
  orders: Map<string, Order>;
  selectedOrder: Order | null;
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
  isMobile: boolean;
}

const ActiveOrdersTab: React.FC<ActiveOrdersTabProps> = ({
  orders,
  selectedOrder,
  setSelectedOrder,
  updateOrderStatus,
  updateOrderItemStatus,
  printOrder,
  isMobile,
}) => {
  return (
    <>
      {!orders.size && (
        <EmptyState
          title='🧾 No orders in the queue.'
          subTitle='You’re in control. Orders will appear here the moment they’re placed.'
        />
      )}
      {isMobile && !!orders.size && (
        <MobileOrderList
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          updateOrderItemStatus={updateOrderItemStatus}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          printOrder={printOrder}
        />
      )}

      {!isMobile && !!orders.size && (
        <TabletOrderListAndDetail
          orders={orders}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          updateOrderStatus={updateOrderStatus}
          printOrder={printOrder}
        />
      )}
    </>
  );
};

export default ActiveOrdersTab;
