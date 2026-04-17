import React from 'react';
import { IonRow, IonCol, IonText, IonGrid, useIonRouter, IonBadge, IonIcon, IonAvatar } from '@ionic/react';
import { bagOutline } from 'ionicons/icons';
import { useOrderStore } from '@/stores/orderStore';
import { useParams } from 'react-router-dom';
import { Paths } from '@/routes/paths';
import { useQueryParams } from '@/hooks/useQueryParams';
import '../../../../../style.css';
interface BannerProps {
  restaurantId: string;
  restaurantName: string;
  restaurantLogo?: string;
  origin: string;
  locationName?: string;
}

const Banner: React.FC<BannerProps> = (props) => {
  const router = useIonRouter();
  const isStoreOpen = useOrderStore((s) => s.location.isOpen);
  const originId = useQueryParams().get('originId') || 'web';
  const cartItems = useOrderStore((s) => s.cart.items);
  const { locationSlug, menuSlug, restaurantId, locationId,menuId } = useParams<{
    locationSlug: string;
    menuSlug: string;
    restaurantId: string;
    locationId: string;
    menuId: string;
  }>();
  const navigateCart = () => {
    if (cartItems.length > 0 && isStoreOpen) {
      router.push(Paths.cart(restaurantId, locationSlug, locationId, menuSlug, menuId, originId));
      return;
    }
  };

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol size='10'>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {props.restaurantLogo && (
                <IonAvatar style={{ width: '40px', height: '40px' }}>
                  <img src={props.restaurantLogo} style={{ objectFit: 'cover' }} />
                </IonAvatar>
              )}
              <IonText className='font-size-17'>
                {props.restaurantName} <br></br>
                <IonText className='font-size-14'>({props.locationName})</IonText>
              </IonText>
            </div>
          </IonCol>
          <IonCol size='2' className='ion-text-end'>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                paddingBottom: '5px',
              }}
              onClick={navigateCart}
            >
              <IonIcon icon={bagOutline} style={{ fontSize: '24px' }} />

              {isStoreOpen && cartItems.length > 0 && (
                <IonBadge
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-8px',
                    padding: '4px',
                    fontSize: '11px',
                    borderRadius: '50%',
                    minWidth: '18px',
                    minHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 0,
                  }}
                >
                  {cartItems.length}
                </IonBadge>
              )}
            </div>
            <div>
              {' '}
              <span className='font-size-14'> {props.origin}</span>
            </div>
          </IonCol>
        </IonRow>

        {/* <IonRow>
          <IonCol size='6'>
            <IonText className='font-size-18 ion-padding-start ' style={{ marginLeft: '34px' }}>
              {props.locationName}
            </IonText>
          </IonCol>

          <IonCol size='6' className='ion-text-right'>
            <IonText>{props.origin}</IonText>
          </IonCol>
        </IonRow> */}
      </IonGrid>
    </div>
  );
};

export default Banner;
