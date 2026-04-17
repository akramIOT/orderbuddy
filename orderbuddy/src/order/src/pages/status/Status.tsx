import { useEffect, useState } from 'react';
import { client } from '../../client';
import { Link, useParams } from 'react-router-dom';
import { useOrderStatus } from '../../queries/useOrderStatus';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/react';
import Banner from './components/NavBar';
import burger from '../../../assets/burger.png';
import { Paths } from '@/routes/paths';
import { arrowForwardOutline } from 'ionicons/icons';
import { OrderStatus } from '@/constants';
import React from 'react';
import { logExceptionError } from '@/utils/errorLogger';

const StatusPage: React.FC = () => {
  const { orderId } = useParams<any>();
  const [completedStatus, setCompletedStatus] = useState(false);
  const [readyForPickUp, setReadyForPickUp] = useState(false);
  const { data: orderData, isLoading } = useOrderStatus(orderId);
  useEffect(() => {
    if (orderData?.status === OrderStatus.ReadyForPickup) {
      setReadyForPickUp(true);
    } else if (orderData?.status === OrderStatus.Completed) {
      setCompletedStatus(true);
    }
  }, [orderData]);

  useEffect(() => {
    if (client.connected) {
      try {
        client.emit('order_joined', orderId);
        // Listen for status updates
        client.on('order_completed', ({ orderId, restaurantId }) => {
          console.log('status order completed message received');
          setCompletedStatus(true);
        });

        client.on('order_ready_for_pickup', ({ orderId, restaurantId }) => {
          console.log('status orderPickup message received');
          setReadyForPickUp(true);
        });
      } catch (error) {
        logExceptionError(error, 'StatusPageSocket', {
          operation: 'setupSocketListeners',
          orderId,
        });
      }

      // Cleanup listeners
      return () => {
        client.off('order_completed');
        client.off('order_ready_for_pickup');
      };
    }
  }, [client.connected, orderId]);
  if (!orderData) null;
  return (
    <IonPage>
      <IonHeader class='navbar-color'>
        {' '}
        <Banner />
      </IonHeader>
      <IonContent fullscreen class='ion-padding hidescrollall'>
        <IonGrid>
          <IonRow className='ion-align-items-center'>
            <IonCol>
              <IonText className=' font-size-14' color='medium'>
                {' '}
                Order: {orderData?.orderCode}
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            {!completedStatus && (
              <p className=' font-size-14'>
                We will let you know once the order is ready for pickup. Please do not close this page, you can check
                the order status here.
              </p>
            )}
          </IonRow>
        </IonGrid>
        {isLoading && <IonSpinner></IonSpinner>}
        {!isLoading && (
          <div>
            {!readyForPickUp && !completedStatus && (
              <div
                style={{
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                Order Placed
              </div>
            )}

            {readyForPickUp && !completedStatus && (
              <div
                style={{
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                Ready for pickup!
              </div>
            )}

            {completedStatus && (
              <div
                style={{
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                Order Completed!
              </div>
            )}
          </div>
        )}

        {!completedStatus && orderData && (
          <IonCard>
            <IonCardContent>
              <div className=' hidescroll'>
                <span style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <span>
                    <span>
                      <IonText>Name</IonText>
                    </span>
                    : <IonText>{orderData.customer.name}</IonText>
                  </span>
                </span>
                <hr></hr>

                <div style={{ height: '16vh', overflowY: 'auto' }}>
                  <IonList className=''>
                    {orderData?.items.map((item, index) => {
                      return (
                        <IonItem key={index} className='ion-no-padding end-gap-cover'>
                          <IonGrid>
                            <IonRow class='ion-align-items-center '>
                              <IonCol class='' size='10'>
                                <IonRow class=' '>
                                  <IonCol size='12'>
                                    <IonRow>
                                      <IonText className='font-size-14 '>{item.name}</IonText>
                                    </IonRow>

                                    <IonRow style={{ maxWidth: '200px' }}>
                                      {item.variants && item.variants.length > 0 && (
                                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                          {item.variants.map((variant) => variant.name).join(', ')}
                                        </div>
                                      )}{' '}
                                    </IonRow>
                                    <IonRow>
                                      {item.modifiers && (
                                        <div>
                                          {item.modifiers?.map((modifiersOptions, index) => (
                                            <span key={index} style={{ fontSize: '12px' }}>
                                              <IonText style={{ fontWeight: 'bold' }}>
                                                {modifiersOptions.name}:{' '}
                                              </IonText>
                                              {modifiersOptions.options?.map((option, optIndex) => (
                                                <React.Fragment key={optIndex}>
                                                  {option.name}
                                                  {optIndex !== (modifiersOptions.options?.length || 0) - 1 && ', '}
                                                </React.Fragment>
                                              ))}
                                              <br />
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </IonRow>
                                    <IonRow>
                                      {item.notes && (
                                        <span style={{ fontSize: '12px', maxWidth: '200px' }}>
                                          <IonText> {item.notes}</IonText>
                                        </span>
                                      )}
                                    </IonRow>
                                  </IonCol>
                                </IonRow>
                              </IonCol>
                              <IonCol class='ion-text-end' size='2'>
                                <IonGrid>
                                  <IonRow className='font-size-14 '>${(item.priceCents / 100).toFixed(2)} </IonRow>
                                </IonGrid>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonItem>
                      );
                    })}
                  </IonList>
                </div>

                <IonGrid className='flex flex-row justify-between mt-3 '>
                  {orderData.discount && orderData.discount.amountCents && orderData.discount.amountCents > 0 && (
                    <IonRow className='ion-align-items-center'>
                      <IonCol className='font-size-14'>
                        Discount {orderData.discount.type && `(${orderData.discount.type})`}
                      </IonCol>
                      <IonCol className='font-size-14 ion-text-end'>
                        <div className='flex flex-col' style={{ color: '#2dd36f' }}>
                          - ${((orderData.discount.amountCents || 0) / 100).toFixed(2)}
                        </div>
                      </IonCol>
                    </IonRow>
                  )}

                  <IonRow className='ion-align-items-center'>
                    <IonCol className='font-size-14 '>Total</IonCol>
                    <IonCol className='font-size-14 ion-text-end'>
                      <div className=' flex flex-col'>
                        <span className='text-xl'>${(orderData.totalPriceCents / 100).toFixed(2)} </span>
                        <span className='pr-2 font-normal' style={{ fontSize: '15px' }}>
                          <br></br> plus tax
                        </span>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>

      {completedStatus && orderData && (
        <IonFooter>
          <IonGrid>
            <IonRow>
              <IonCol class='12'>
                <Link
                  to={Paths.menus(
                    orderData.restaurantId,
                    orderData?.locationSlug,
                    orderData?.locationId,
                    orderData?.origin.id,
                  )}
                  style={{ textDecoration: 'none' }}
                >
                  <IonButton expand='block' className=' solid-button'>
                    Order more!
                    <IonIcon slot='end' icon={arrowForwardOutline} style={{ color: '#fff' }}></IonIcon>
                  </IonButton>
                </Link>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonFooter>
      )}
    </IonPage>
  );
};
export default StatusPage;
