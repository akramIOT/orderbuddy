import {
  IonPage,
  IonContent,
  IonList,
  IonFooter,
  IonGrid,
  IonCard,
  IonCol,
  IonRow,
  useIonRouter,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import './styles/cart.css';
import useCreatePreviewOrder from './useCreatePreviewOrderQuery';
import React, { useEffect, useState } from 'react';

import { client } from '../../client';
import { useParams } from 'react-router-dom';
import Banner from './components/banner/banner';
import { CartItem } from './components/cart-item/CartItem';
import { InputField } from './components/input-field/input';
import { useOrderStore } from '@/stores/orderStore';
import { Paths } from '@/routes/paths';
import { useQueryParams } from '@/hooks/useQueryParams';
import { addOutline } from 'ionicons/icons';
import '../../../style.css';
import { useCreateOrder } from '@/queries/useCreateOrder';
import { logApiError, logExceptionError } from '@/utils/errorLogger';

const CartPage: React.FC = () => {
  // const { isValid, error, isLoading } = useOrderGuard();
  // useCartGuard();
  const originId = useQueryParams().get('originId') || 'web';

  const cartItems = useOrderStore((s) => s.cart.items);
  const location = useOrderStore((s) => s.location);
  const origin = useOrderStore((s) => s.origin);
  const restaurant = useOrderStore((s) => s.restaurant);
  const isStoreOpen = useOrderStore((s) => s.location.isOpen);
  const discount = useOrderStore((s) => s.discount);
  const [isValidPlaceOrder, setIsValidPlaceOrder] = useState(false);
  const { restaurantId, locationSlug, locationId, menuSlug, menuId } = useParams<{
    restaurantId: string;
    locationSlug: string;
    locationId: string;
    menuSlug: string;
    menuId: string;
  }>();
  const router = useIonRouter();
  const cartTotalCents = useOrderStore((s) => s.cart.totalPriceCents);
  const cartTaxCents = useOrderStore((s) => s.cart.tax);
  const subtotalCents = useOrderStore((s) => s.cart.subtotalCents);
  const discountInDollars = discount ? (discount.amountCents / 100).toFixed(2) : 0;
  const totalInDollars = (cartTotalCents / 100).toFixed(2);
  const taxInDollars = (cartTaxCents / 100).toFixed(2);
  const setOrder = useOrderStore((s) => s.setOrder);
  const resetOrderState = useOrderStore((s) => s.resetOrderState);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    getSms: false,
  });
  const acceptPayment = useOrderStore((s) => s.location.acceptPayment);
  const createOrderMutation = useCreateOrder();

  function initiateOrder(orderNumber: string) {
    try {
      const payload = {
        orderId: orderNumber,
      };
      client.emit('order_joined', payload);
    } catch (error) {
      logExceptionError(error, 'InitiateOrder', {
        operation: 'emitOrderJoined',
        orderNumber,
        restaurantId,
      });
    }
  }

  useEffect(() => {
    if (cartItems.length === 0) {
      console.warn('Cart is empty, redirecting to menu page');

      router.push(Paths.menu(restaurantId, locationSlug, locationId, menuSlug, menuId, originId), 'back');

      return;
    }
  }, [cartItems.length]);

  const RedirectMenu = () => {
    router.push(Paths.menu(restaurantId, locationSlug, locationId, menuSlug, menuId, originId), 'back');
  };

  const createPreviewOrderMutation = useCreatePreviewOrder();
  const placePreviewOrder = async () => {
    const orderItems = cartItems.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      notes: item.notes,
      variants:
        item.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceCents: variant.priceCents,
        })) || [],
      modifiers:
        item.modifiers?.map((mod) => ({
          id: mod.id,
          name: mod.name,
          options:
            mod.options?.map((option) => ({
              id: option.id,
              name: option.name,
              priceCents: option.priceCents,
            })) || [],
        })) || [],
      stationTags: item.stationTags,
    }));

    const previewOrderData = {
      restaurantId: restaurant._id,
      locationId: location._id,
      locationSlug: locationSlug,
      origin: origin._id ? { id: origin._id, name: origin.name } : { id: '', name: 'Web' },
      customer: {
        name: customerData.name,
        phone: customerData.phone,
      },
      items: orderItems,
      getSms: customerData.getSms,
      discount: discount
        ? {
            name: discount.name,
            type: discount.type,
            amountCents: discount.amountCents,
          }
        : undefined,
    };

    try {
      const previewResult = await createPreviewOrderMutation.mutateAsync(previewOrderData);

      setOrder({
        previewOrderId: previewResult.previewOrderId,
        totalPriceCents: previewResult.totalPriceCents,
      });
      if (location.acceptPayment) {
        router.push(
          Paths.checkout(
            restaurant._id,
            locationSlug,
            location._id,
            menuSlug,
            menuId,
            previewResult.previewOrderId,
            originId || '',
          ),
          'forward',
        );
      } else if (!location.acceptPayment) {
        const orderresult = await createOrderMutation.mutateAsync(previewResult.previewOrderId);
        if (client.connected) {
          initiateOrder(orderresult.orderId);
        }
        resetOrderState();
        router.push(Paths.status(restaurant._id, orderresult.orderId), 'forward');
      }
    } catch (error) {
      console.error('Failed to create preview order:', error);
      logApiError(error, 'order-app/cart/preview-order', {
        operation: 'createPreviewOrder',
        restaurantId: restaurant._id,
        locationId: location._id,
      });
    }
  };
  return (
    <IonPage>
      <Banner />
      <IonContent>
        <IonList>
          <IonCard className='ion-margin'>
            <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <IonCardContent>
              <IonButton onClick={RedirectMenu} expand='full' className='force-outline-button'>
                Add More
                <IonIcon slot='end' icon={addOutline}></IonIcon>
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonList>
        <div className='ion-no-padding ion-padding-start ion-padding-end'>
          <IonGrid>
            {discount && (
              <IonRow>
                <IonCol className='font-size-14'>Sub-total </IonCol>
                <IonCol class='ion-text-end'>
                  <span className='font-size-14'>$ {(subtotalCents / 100).toFixed(2)}</span>
                </IonCol>
              </IonRow>
            )}

            {discount && (
              <IonRow>
                <IonCol className='font-size-14'>Discount {discount?.type && `(${discount.type})`}</IonCol>
                <IonCol class='ion-text-end'>
                  <span className='font-size-14 discount-text'>- $ {discountInDollars}</span>
                </IonCol>
              </IonRow>
            )}

            <IonRow className='cart-total-row'>
              <IonCol className='font-size-14 font-weight-bold'>Total (Tax)</IonCol>
              <IonCol class='ion-text-end'>
                <span className='font-size-14 font-weight-bold'>
                  $ {totalInDollars} (${taxInDollars})
                </span>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <InputField
          onValidityChange={(isValid) => setIsValidPlaceOrder(isValid)}
          onCustomerDataChange={setCustomerData}
        />{' '}
      </IonContent>
      {isStoreOpen && (
        <IonFooter>
          {Number(totalInDollars) > 0 && (
            <IonButton
              disabled={!isValidPlaceOrder}
              expand='block'
              className='solid-button'
              style={{ paddingLeft: '10px', paddingRight: '10px', fontWeight: '700' }}
              onClick={placePreviewOrder}
            >
              {location.acceptPayment && <IonText style={{ color: 'white' }}>checkout</IonText>}{' '}
              {!location.acceptPayment && <IonText style={{ color: 'white' }}>Place Order</IonText>}
            </IonButton>
          )}
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CartPage;
