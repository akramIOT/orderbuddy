import { IonGrid, IonRow, IonCol } from '@ionic/react';
import TabletOrderListAndDetail from './TabletOrderListAndDetail';
import EmptyState from './EmptyState';
import MobileOrderList from './MobileOrderList';
import OrderDetail from './OrderDetail';
import OrderList from './OrderList';
import { Order } from '../types';

interface CompletedOrdersTabProps {
  orders: Map<string, Order>;
  selectedOrder: Order | null;
  tabValue?: string;
  isMobile: boolean;
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

const CompletedOrdersTab: React.FC<CompletedOrdersTabProps> = (props) => {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    isMobile,
    printOrder,
  } = props;

  return (
    <>
      {!orders.size && (
        <EmptyState
          title='✅ No completed orders yet.'
          subTitle='Once an order is finished, it’ll show up here for your records.'
        />
      )}

      {isMobile && (
        <MobileOrderList
          orders={orders}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          printOrder={printOrder}
          tabValue='completed'
        />
      )}

      {!isMobile && !!orders.size && (
        <TabletOrderListAndDetail
          orders={orders}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          printOrder={printOrder}
        />
      )}
    </>
  );
};

export default CompletedOrdersTab;
