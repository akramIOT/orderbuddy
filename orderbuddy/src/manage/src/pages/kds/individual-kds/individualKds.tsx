import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonSkeletonText,
  IonCol,
  IonGrid,
  IonRow,
  IonButton,
  IonFooter,
  IonItemDivider,
  IonItemGroup,
  IonText,
} from '@ionic/react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { STATIONS_ORDERS_QUERY_KEY, useStationsOrders } from '../../../queries/useStationsOrder';
import { client } from '../../../Client';
import { fetchStationOrder } from '../../../queries/useStationSingleOrder';
import { useQueryClient } from '@tanstack/react-query';
import { useStatusMutation } from '../../../queries/usestatus';
import LaunchPadNavBar from '../../../components/LanunchpadNavBar';
import '../../../../style.css';
import { OrderItemStatus, OrderStatus } from '../../../constants';
import { logExceptionError } from '../../../utils/errorLogger';
interface OrderData {
  orderId: string;
  stationTags: string[];
  correlationId: string;
  locationId: string;
}

interface StationOrdersResponse {
  locationName: string;
  stationName: string;
  stationTags: string[];
  matchedOrders: Array<{
    _id: string;
    status: string;
    orderCode: string;
    startedAt?: Date;
    meta: {
      correlationId?: string;
    };
    items: Array<{
      id: string;
      name: string;
      startedAt: Date;
      completedAt: Date;
      variants?: Array<{
        id: string;
        name: string;
      }>;
      notes?: string;
    }>;
  }>;
}
const IndividualKdsPage: React.FC = () => {
  const { locationId, stationId, restaurantId } = useParams<{
    locationId: string;
    stationId: string;
    restaurantId: string;
  }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useStationsOrders(restaurantId, stationId, locationId);
  const statusMutation = useStatusMutation(restaurantId, stationId, locationId, data?.stationTags || []);

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
    if (!data?.stationTags) return;
    console.debug('Joining station room with tags:', {
      restaurantId,
      locationId,
      stationId,
      stationTags: data.stationTags,
    });
    // Join station room with tags
    client.emit('station_joined', {
      restaurantId,
      locationId,
      stationId,
      stationTags: data.stationTags,
    });

    const handleNewOrder = async (orderData: OrderData) => {
      console.debug('New order received:', orderData);
      const hasMatchingTags = orderData.stationTags.some((tag) => data?.stationTags.includes(tag));

      if (hasMatchingTags) {
        console.debug('Matching tags found:', orderData.stationTags);
        try {
          const orderDetails = await fetchStationOrder(
            restaurantId,
            locationId,
            orderData.orderId,
            data.stationTags,
            orderData.correlationId,
          );
          console.debug('Fetched order details:', orderDetails);
          // Update the cache with the new order
          queryClient.setQueryData(
            STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
            (oldData: StationOrdersResponse | undefined) => {
              // If no existing data, create initial structure
              if (!oldData) {
                return {
                  locationName: data?.locationName || '',
                  stationName: data?.stationName || '',
                  stationTags: data?.stationTags || [],
                  matchedOrders: [orderDetails],
                };
              }

              // Check for duplicate orders
              const isDuplicate = oldData.matchedOrders.some((order) => order._id === orderDetails._id);

              if (isDuplicate) {
                return oldData;
              }

              return {
                ...oldData,
                matchedOrders: [...oldData.matchedOrders, orderDetails],
              };
            },
          );
        } catch (error) {
          logExceptionError(error instanceof Error ? error : new Error(String(error)), 'individualKds.handleNewOrder', {
            restaurantId,
            locationId,
            orderId: orderData.orderId,
            stationId,
            correlationId: orderData.correlationId,
          });
          console.error('Error fetching order details:', error);
        }
      }
    };

    const handleOrderItemStarted = ({
      orderId,
      itemId,
      restaurantId,
      locationId,
      stationId,
      stationTags,
    }: {
      orderId: string;
      itemId: string;
      restaurantId: string;
      locationId: string;
      stationId: string;
      stationTags: string[];
    }) => {
      console.debug('handleOrderItemStarted received:', {
        orderId,
        itemId,
        restaurantId,
        locationId,
        stationId,
        stationTags,
      });
      queryClient.setQueryData(
        STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
        (oldData: StationOrdersResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            matchedOrders: oldData.matchedOrders.map((order) => {
              if (order._id === orderId) {
                return {
                  ...order,
                  items: order.items.map((item) => {
                    if (item.id === itemId) {
                      return { ...item, startedAt: new Date() };
                    }
                    return item;
                  }),
                };
              }
              return order;
            }),
          };
        },
      );
    };

    // Handle order item completed
    const handleOrderItemCompleted = ({
      orderId,
      itemId,
      restaurantId,
      locationId,
      stationId,
      stationTags,
    }: {
      orderId: string;
      itemId: string;
      restaurantId: string;
      locationId: string;
      stationId: string;
      stationTags: string[];
    }) => {
      console.debug('handleOrderItemStarted received:', {
        orderId,
        itemId,
        restaurantId,
        locationId,
        stationId,
        stationTags,
      });

      queryClient.setQueryData(
        STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
        (oldData: StationOrdersResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            matchedOrders: oldData.matchedOrders.map((order) => {
              if (order._id === orderId) {
                return {
                  ...order,
                  items: order.items.map((item) => {
                    if (item.id === itemId) {
                      return { ...item, completedAt: new Date() };
                    }
                    return item;
                  }),
                };
              }
              return order;
            }),
          };
        },
      );
    };
    const handleOrderAccepted = async ({
      orderId,
      restaurantId: orderRestaurantId,
      correlationId,
    }: {
      orderId: string;
      restaurantId: string;
      correlationId?: string;
    }) => {

      if (orderRestaurantId === restaurantId) {
        try {
          const orderDetails = await fetchStationOrder(restaurantId, locationId, orderId, data.stationTags, correlationId);


          // Update the cache with the updated order
          queryClient.setQueryData(
            STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
            (oldData: StationOrdersResponse | undefined) => {
              // If no existing data, create initial structure
              if (!oldData) {
                return {
                  locationName: data?.locationName || '',
                  stationName: data?.stationName || '',
                  stationTags: data?.stationTags || [],
                  matchedOrders: [orderDetails],
                };
              }

              // Check for duplicate orders
              const isDuplicate = oldData.matchedOrders.some((order) => order._id === orderDetails._id);

              if (isDuplicate) {
                return oldData;
              }

              return {
                ...oldData,
                matchedOrders: [...oldData.matchedOrders, orderDetails],
              };
            },
          );
        } catch (error) {
          logExceptionError(
            error instanceof Error ? error : new Error(String(error)),
            'individualKds.handleOrderAccepted',
            {
              restaurantId,
              locationId,
              orderId,
              stationId,
            },
          );
          console.error('Error updating accepted order:', error);
        }
      }
    };

    const handleOrderCompleted = ({
      orderId,
      restaurantId: orderRestaurantId,
    }: {
      orderId: string;
      restaurantId: string;
    }) => {
      console.debug('Order completed:', { orderId, restaurantId: orderRestaurantId });

      if (orderRestaurantId === restaurantId) {
        queryClient.setQueryData(
          STATIONS_ORDERS_QUERY_KEY(restaurantId, stationId, locationId),
          (oldData: StationOrdersResponse | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              matchedOrders: oldData.matchedOrders.map((order) => {
                if (order._id === orderId) {
                  return {
                    ...order,
                    status: OrderStatus.OrderCompleted,
                    items: order.items.map((item) => ({
                      ...item,
                      startedAt: order.startedAt || new Date(),
                      completedAt: item.completedAt || new Date(),
                    })),
                  };
                }
                return order;
              }),
            };
          },
        );
      }
    };

    // Subscribe to new_order event instead of station_order_received
    client.on('new_order', handleNewOrder);
    client.on('order_item_started', handleOrderItemStarted);
    client.on('order_item_completed', handleOrderItemCompleted);
    client.on('order_accepted', handleOrderAccepted);
    client.on('order_ready_for_pickup', handleOrderCompleted);

    // Listen for connection confirmation
    client.on('station_connected', (response) => {
      console.debug('Station connected:', response);
    });
    console.debug('Subscribed to station events:', {
      restaurantId,
      locationId,
      stationId,
      stationTags: data.stationTags,
    });
    return () => {
      client.off('new_order', handleNewOrder);
      client.off('order_item_started', handleOrderItemStarted);
      client.off('order_item_completed', handleOrderItemCompleted);
      client.off('order_accepted', handleOrderAccepted);
      client.off('order_ready_for_pickup', handleOrderCompleted);
      client.off('station_connected');
    };
  }, [data, restaurantId, locationId, stationId]);

  // Handle order completed event

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className='ion-padding'>
          <IonCard>
            <IonCardContent>
              <IonSkeletonText animated style={{ width: '60%' }} />
              <IonSkeletonText animated style={{ width: '80%' }} />
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className='station-page'>
      <LaunchPadNavBar title={`${data?.stationName!} - ${data?.matchedOrders.length}`} />
      <IonContent className='ion-padding' scrollY={false}>
        <IonGrid>
          <IonRow style={{ height: '100vh' }}>
            <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', boxSizing: 'border-box' }}>
              {data?.matchedOrders.map((order) => {
                const hasIncompleteItems = order.items.some((item) => !item.completedAt);
                return hasIncompleteItems ? (
                  <IonCol
                    sizeLg='4'
                    sizeXs='12'
                    sizeXl='3'
                    sizeSm='12'
                    key={order._id}
                    style={{
                      minWidth: '350px',
                      flex: '0 0 auto',
                      padding: '10px',
                    }}
                  >
                    <IonCard
                      className='rounded'
                      style={{
                        display: hasIncompleteItems ? 'block' : 'none',
                        height: '85vh',
                        visibility: hasIncompleteItems ? 'visible' : 'hidden',
                      }}
                    >
                      <IonList>
                        <IonItemGroup>
                          <IonItemDivider>
                            <IonGrid>
                              <IonRow class=''>
                                <IonCol>
                                  <IonText className='ion-text-end bold font-size-16' color='dark'>
                                    {order.orderCode}
                                  </IonText>
                                </IonCol>
                              </IonRow>
                            </IonGrid>
                          </IonItemDivider>
                          <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                            {order.items.map(
                              (item, index) =>
                                !item.completedAt && (
                                  <IonItem
                                    key={index}
                                    lines={index !== order.items.length - 1 ? 'full' : 'none'}
                                    className=''
                                  >
                                    <IonGrid>
                                      <IonRow className='ion-align-items-center'>
                                        <IonCol size='7'>
                                          <IonGrid>
                                            <IonRow>
                                              <IonText style={{ fontSize: '14px' }}>{item.name}</IonText>
                                            </IonRow>
                                            {item.variants && item.variants?.length > 0 && (
                                              <IonRow>
                                                <IonCol className='ion-no-padding'>
                                                  <IonText style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                    variants:
                                                  </IonText>
                                                  <span>
                                                    {item.variants?.map((variant, index) => (
                                                      <span
                                                        key={index}
                                                        className='text-[#873a97] text-xs'
                                                        style={{ fontSize: '12px' }}
                                                      >
                                                        {variant.name}
                                                        {index !== item.variants!.length - 1 && ', '}
                                                      </span>
                                                    ))}
                                                  </span>
                                                </IonCol>
                                              </IonRow>
                                            )}

                                            <IonRow>
                                              <IonCol className='ion-no-padding'>
                                                {item.modifiers?.map((modifiersOptions, index) => (
                                                  <span key={index} style={{ fontSize: '12px' }}>
                                                    <IonText style={{ fontWeight: 'bold' }}>
                                                      {modifiersOptions.name}:{' '}
                                                    </IonText>
                                                    {modifiersOptions.options?.map((option, optIndex) => (
                                                      <React.Fragment key={option.id}>
                                                        {option.name}
                                                        {optIndex !== (modifiersOptions.options?.length || 0) - 1 &&
                                                          ', '}
                                                      </React.Fragment>
                                                    ))}
                                                    <br></br>
                                                  </span>
                                                ))}
                                              </IonCol>
                                            </IonRow>
                                            <IonRow>
                                              <IonText
                                                className='text-xs grid grid-cols-1'
                                                style={{ wordBreak: 'break-word', fontSize: '11px' }}
                                              >
                                                {item.notes}
                                              </IonText>
                                            </IonRow>
                                          </IonGrid>
                                        </IonCol>
                                        <IonCol size='5' className='ion-text-end ion-self-center'>
                                          {item.startedAt && (item.completedAt == null || !item.completedAt) && (
                                            <IonButton
                                              size='small'
                                              fill='outline'
                                              onClick={() =>
                                                statusMutation.mutate({
                                                  orderId: order._id,
                                                  itemId: item.id,
                                                  orderItemStatus: OrderItemStatus.Completed,
                                                  correlationId: order.meta.correlationId,
                                                })
                                              }
                                            >
                                              <IonText color={'dark'} style={{ textTransform: 'capitalize' }}>
                                                Complete
                                              </IonText>
                                            </IonButton>
                                          )}
                                          {!item.startedAt && (
                                            <IonButton
                                              fill='outline'
                                              onClick={() =>
                                                statusMutation.mutate({
                                                  orderId: order._id,
                                                  itemId: item.id,
                                                  orderItemStatus: OrderItemStatus.Started,
                                                  correlationId: order.meta.correlationId,
                                                })
                                              }
                                            >
                                              <IonText color={'dark'} style={{ textTransform: 'capitalize' }}>
                                                Accept
                                              </IonText>
                                            </IonButton>
                                          )}
                                        </IonCol>
                                      </IonRow>
                                    </IonGrid>
                                  </IonItem>
                                ),
                            )}
                          </div>
                        </IonItemGroup>
                      </IonList>

                      <IonFooter
                        className='ion-text-end '
                        style={{
                          background: 'none',
                          boxShadow: 'none',
                          position: 'absolute',
                          bottom: 8,
                          width: '100%',
                          right: 10,
                        }}
                      ></IonFooter>
                    </IonCard>
                  </IonCol>
                ) : null;
              })}
            </div>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default IndividualKdsPage;
