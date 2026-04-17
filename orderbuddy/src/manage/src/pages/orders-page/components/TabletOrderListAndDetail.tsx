import { IonGrid, IonRow, IonCol } from '@ionic/react';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import { Order } from '../types';

interface TabletOrderListAndDetailProps {
  orders: Map<string, Order>;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order) => void;
  updateOrderStatus?: (orderId: string, orderStatus: string, correlationId: string) => void;
  printOrder?: (order: Order) => void;
}

const TabletOrderListAndDetail: React.FC<TabletOrderListAndDetailProps> = ({
  orders,
  selectedOrder,
  setSelectedOrder,
  updateOrderStatus,
  printOrder,
}) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol size='4'>
          <OrderList orders={orders} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
        </IonCol>
        <IonCol size='8'>
          <OrderDetail selectedOrder={selectedOrder} updateOrderStatus={updateOrderStatus} printOrder={printOrder} />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TabletOrderListAndDetail;
