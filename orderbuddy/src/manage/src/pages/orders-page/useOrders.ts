import { useState, useEffect, useRef } from 'react';
import { client } from '../../Client';
import { debounce, set } from 'lodash';
import { Order } from './types';
import { fetchDashboardOrder } from '../../queries/dashboard/useSingleDasboardOrder';
import { appStore } from '../../store';
import { useOrderStatus } from '../../queries/useOrderstatus';
import { useStatusMutation } from '../../queries/dashboard/useDashboardStatusMutation';
import { OrderStatus } from '../../constants';
import { usePrinterService } from '../../hooks/usePrinterService';
import { logExceptionError } from '../../utils/errorLogger';
import { Printer, usePrinters } from '../../queries/printers/usePrinter';
import { useTodayOrders } from './useOrdersQuery';
import { useNotificationSound } from '../../hooks/useNotificationSound';

interface OrderData {
  orderId: string;
  locationId: string;
  restaurantId: string;
  correlationId: string;
}

interface RestaurantInfo {
  restaurantId: string;
  restaurantName: string;
  locationId: string;
  locationName: string;
}

export const useOrders = (restaurantId: string, locationId: string) => {
  const { data: printersData } = usePrinters(restaurantId, locationId);

  const { printOrder: printOrderService } = usePrinterService();
  const { playNotificationSound } = useNotificationSound();

  const appState = appStore();

  const [activeOrders, setActiveOrders] = useState<Map<string, Order>>(new Map());
  const [completedOrders, setCompletedOrders] = useState<Map<string, Order>>(new Map());
  const [futureOrders, setFutureOrders] = useState<Map<string, Order>>(new Map());
  const [isMobile, setIsMobile] = useState(false);

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer>();
  const { isLoading, data: orders } = useTodayOrders(restaurantId, locationId);
  const hasInitialized = useRef(false);
  const activeOrdersRef = useRef(activeOrders);
  useEffect(() => {
    activeOrdersRef.current = activeOrders;
  }, [activeOrders]);
  useEffect(() => {
    if (printersData && printersData) {
      setPrinters(printersData);
    }
  }, [printersData]);

  useEffect(() => {
    if (printers) {
      const ordersPrinter = printers.find((printer) => printer.name.toLowerCase() === 'orders');
      if (ordersPrinter) {
        setSelectedPrinter(ordersPrinter);
      }
    }
  }, [printers]);

  const sortOrder = (order: Order) => {
    switch (order.status) {
      case OrderStatus.OrderCompleted:
        setCompletedOrders((prev) => new Map(prev).set(order._id, order));
        break;
      case OrderStatus.OrderAccepted:
        setActiveOrders((prev) => new Map(prev).set(order._id, order));
        break;
      case OrderStatus.OrderCreated:
        setActiveOrders((prev) => new Map(prev).set(order._id, order));
        break;
      default:
        setActiveOrders((prev) => new Map(prev).set(order._id, order));
    }
  };

  const restaurantInfo = {
    restaurantId: restaurantId,
    restaurantName: appState.selection.restaurant.name!,
    locationId: locationId,
    locationName: appState.selection.location.name!,
  };
  const printOrder = debounce((order: Order) => {
    if (selectedPrinter) {
      printOrderService(order, restaurantInfo, selectedPrinter, 'manual');
    }
  }, 1000);

  useEffect(() => {
    if (!orders || !printersData || hasInitialized.current) return;

    hasInitialized.current = true;

    for (const order of orders) {
      sortOrder(order);
    }

    // Setup socket listeners here (move your socket setup code into a function and call it here)
    // setupSocketListeners();

    // Optionally, return a cleanup function to remove listeners
    return () => {
      // Remove socket listeners here
    };
  }, [orders, printersData]);

  useEffect(() => {
    setupSocketListeners();
  }, [restaurantId, locationId, selectedPrinter]);

  const setupSocketListeners = () => {
    // Order received
    const handleOrderReceived = async (orderData: OrderData) => {
      try {
        const newOrder = await fetchDashboardOrder(
          orderData.restaurantId,
          orderData.locationId,
          orderData.orderId,
          orderData.correlationId,
        );
        if (newOrder && selectedPrinter) {
          printOrderService(newOrder, restaurantInfo, selectedPrinter, 'socket');
          sortOrder(newOrder);
          playNotificationSound();
        }
      } catch (error) {
        logExceptionError(error instanceof Error ? error : new Error(String(error)), 'useOrders.handleOrderReceived', {
          restaurantId: orderData.restaurantId,
          locationId: orderData.locationId,
          orderId: orderData.orderId,
          correlationId: orderData.correlationId,
        });
        console.error('Error fetching order:', error);
      }
    };

    // Order ready for pickup

    const handleOrderAccepted = ({ orderId, restaurantId }: { orderId: string; restaurantId: string }) => {
      const currentOrders = activeOrdersRef.current;

      if (!currentOrders.has(orderId)) return;
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        order.status = OrderStatus.OrderAccepted;
        return newOrders;
      });
    };

    const handleOrderReadyForPickup = ({ orderId, restaurantId }: { orderId: string; restaurantId: string }) => {
      const currentOrders = activeOrdersRef.current;

      if (!currentOrders.has(orderId)) return;
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        const currentTime = new Date();
        order.items.forEach((item) => {
          if (!item.startedAt) {
            item.startedAt = order.startedAt;
          }
          if (!item.completedAt) {
            item.completedAt = currentTime;
          }
        });
        order.status = OrderStatus.ReadyForPickup;
        return newOrders;
      });
    };

    // Order completed
    const handleOrderCompleted = ({ orderId, restaurantId }: { orderId: string; restaurantId: string }) => {
      const currentOrders = activeOrdersRef.current;
      const order = currentOrders.get(orderId);
      const orderCorrelationId = order?.meta.correlationId || '';
      if (!currentOrders.has(orderId)) return;
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        if (!order) {
          console.warn(`Order not found in state for ID: ${orderId}`);
          return prevOrders;
        }

        order.status = OrderStatus.OrderCompleted;
        newOrders.delete(orderId);
        return newOrders;
      });

      fetchDashboardOrder(restaurantId, locationId, orderId, orderCorrelationId)
        .then((completedOrder) => {
          sortOrder(completedOrder);
        })
        .catch((error) => {
          console.error('Error fetching completed order:', error);
        });
    };

    // Dashboard order item started
    const handleOrderItemStarted = ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
      restaurantId: string;
      locationId: string;
    }) => {
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        const itemToUpdate = order.items.find((item) => item.id === itemId)!;
        itemToUpdate.startedAt = new Date();
        itemToUpdate.completedAt = null;
        return newOrders;
      });
    };

    // Dashboard order item completed
    const handleOrderItemCompleted = ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
      restaurantId: string;
      locationId: string;
    }) => {
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        const itemToUpdate = order.items.find((item) => item.id === itemId)!;
        itemToUpdate.completedAt = new Date();
        itemToUpdate.startedAt = itemToUpdate.startedAt || new Date();
        return newOrders;
      });
    };
    client.off('order_received', handleOrderReceived).on('order_received', handleOrderReceived);
    client.off('order_accepted', handleOrderAccepted).on('order_accepted', handleOrderAccepted);
    client
      .off('order_ready_for_pickup', handleOrderReadyForPickup)
      .on('order_ready_for_pickup', handleOrderReadyForPickup);
    client.off('order_completed', handleOrderCompleted).on('order_completed', handleOrderCompleted);
    client
      .off('dashboard_order_item_started', handleOrderItemStarted)
      .on('dashboard_order_item_started', handleOrderItemStarted);
    client
      .off('dashboard_order_item_completed', handleOrderItemCompleted)
      .on('dashboard_order_item_completed', handleOrderItemCompleted);

    // Cleanup function (return this from your effect)
    return () => {
      client.off('order_received', handleOrderReceived);
      client.off('order_accepted', handleOrderAccepted);
      client.off('order_ready_for_pickup', handleOrderReadyForPickup);
      client.off('order_completed', handleOrderCompleted);
      client.off('dashboard_order_item_started', handleOrderItemStarted);
      client.off('dashboard_order_item_completed', handleOrderItemCompleted);
    };
  };

  const initiateStore = () => {
    client.emit('store_joined', {
      restaurantId,
      locationId,
    });
  };

  useEffect(() => {
    initiateStore();
  }, []);
  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 600px)').matches);
  }, []);

  const notifyAcceptOrder = async (orderId: string) => {
    if (client.connected) {
      const correlationId = activeOrdersRef.current.get(orderId)?.meta.correlationId;
      client.emit('order_accepted', { restaurantId, orderId, correlationId });
    }
  };

  const notifyPickupOrder = async (orderId: string) => {
    if (client.connected) {
      client.emit('order_ready_for_pickup', { restaurantId, orderId });
    }
  };

  const notifyCompleteOrder = async (orderId: string) => {
    if (client.connected) {
      client.emit('order_completed', { restaurantId, orderId });
    }
  };
  const removeOrderFromActive = (orderId: string) => {
    setActiveOrders((prev) => {
      const newOrders = new Map(prev);
      const order = activeOrders.get(orderId)!;
      order.status = OrderStatus.OrderCompleted;
      newOrders.delete(orderId);
      return newOrders;
    });
  };
  const updateOrderToReadyForPickup = (orderId: string) => {
    setActiveOrders((prevOrders) => {
      const newOrders = new Map(prevOrders);
      const order = newOrders.get(orderId)!;
      const currentTime = new Date();
      order.status = OrderStatus.ReadyForPickup;
      order.items.forEach((item) => {
        if (!item.startedAt) {
          item.startedAt = order.startedAt;
        }
        if (!item.completedAt) {
          item.completedAt = currentTime;
        }
      });
      return newOrders;
    });
  };

  const updateOrderToAcceptOrder = (orderId: string) => {
    setActiveOrders((prevOrders) => {
      const newOrders = new Map(prevOrders);
      const order = newOrders.get(orderId)!;
      order.status = OrderStatus.OrderAccepted;
      return newOrders;
    });
  };

  const orderStatusMutation = useOrderStatus({
    activeOrders,
    restaurantId,
    locationId,
    sortOrder,
    notifyAcceptOrder,
    notifyPickupOrder,
    notifyCompleteOrder,
    removeOrderFromActive,
    updateOrderToReadyForPickup,
    updateOrderToAcceptOrder,
  });
  const updateOrderStatus = (orderId: string, orderStatus: string, correlationId: string) => {
    orderStatusMutation.mutate({
      orderId,
      orderStatus,
      correlationId,
    });
  };

  const updateOrderItemStatusMutation = useStatusMutation(restaurantId, locationId, {
    onOrderItemCompleted: ({ orderId, itemId, restaurantId, locationId, stationTags }) => {
      setActiveOrders((prevOrders) => {
        const newOrders = new Map(prevOrders);
        const order = newOrders.get(orderId)!;
        const itemToUpdate = order.items.find((item) => item.id === itemId)!;
        itemToUpdate.completedAt = new Date();
        return newOrders;
      });
    },
  });
  const updateOrderItemStatus = (
    orderId: string,
    itemId: string,
    orderItemStatus: string,
    stationTags: string[],
    correlationId: string,
  ) => {
    updateOrderItemStatusMutation.mutate({
      orderId,
      itemId,
      orderItemStatus,
      stationTags,
      correlationId,
    });
  };
  const getOrderItemStats = () => {
    let inProgress = 0;
    let inQueue = 0;

    for (const order of activeOrders.values()) {
      for (const item of order.items) {
        if (item.startedAt && !item.completedAt) inProgress++;
        if (!item.startedAt) inQueue++;
      }
    }

    return { inProgress, inQueue };
  };

  return {
    activeOrders,
    printOrder,
    completedOrders,
    futureOrders,
    notifyAcceptOrder,
    notifyPickupOrder,
    notifyCompleteOrder,
    isLoading,
    updateOrderItemStatus,
    updateOrderStatus,
    isMobile,
    getOrderItemStats,
  };
};
