import { useMenus } from '@/queries/useMenus';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  useIonRouter,
} from '@ionic/react';
import { chevronForwardOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import Banner from '../menu/components/banner/Banner';
import { useRestaurant, useLocation, useOrigin } from '@/shared/useEntryInfo';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getUserLang, t } from '@/utils/localization';
import { useOrderStore } from '@/stores/orderStore';
import { Paths } from '@/routes/paths';
import React, { useEffect } from 'react';
import '../../../style.css';

export const MenusPage: React.FC = () => {
  const originId = useQueryParams().get('originId') || 'web';
  // Fetch origin data
  const { data: origin } = useOrigin(originId);
  const { restaurantId, locationSlug, locationId } = useParams<{
    restaurantId: string;
    locationSlug: string;
    locationId: string;
  }>();

  // Fetch restaurant data using the restaurantId from params or from origin
  const { data: restaurant } = useRestaurant(restaurantId);

  // Fetch location data using the restaurantId and locationId from params or from origin
  const { data: location } = useLocation(restaurantId, locationId);

  // Fetch menus using the same pattern
  const { data: menus } = useMenus(restaurantId, locationId);
  const currentLang = getUserLang();
  const router = useIonRouter();

  const handleMenuClick = (menu: any) => {
    router.push(Paths.menu(restaurantId, locationSlug, locationId, menu.menuSlug, menu._id, originId), 'forward');
  };
  useEffect(() => {
    if (menus && menus.length === 1) {
      const menu = menus[0];
      router.push(Paths.menu(restaurantId, locationSlug, locationId, menu.menuSlug, menu._id, originId), 'forward');
    }
  }, [menus, restaurantId, locationSlug, locationId, originId, router]);

  return (
    <IonPage>
      <IonHeader>
        <IonGrid class='navbar-color'>
          {restaurant && location && origin && (
            <Banner
              restaurantName={restaurant.name}
              restaurantLogo={restaurant.logo}
              origin={origin.label}
              restaurantId={restaurant._id}
              locationName={location.name}
            />
          )}
        </IonGrid>
      </IonHeader>

      <IonContent class='hidescrollall'>
        <IonGrid>
          <IonRow>
            <IonCol size='12'>
              <IonList>
                {menus?.map((menu) => (
                  <IonItem onClick={() => handleMenuClick(menu)} key={menu._id} className='font-size-14'>
                    {t(menu.name, currentLang)}
                    <IonIcon icon={chevronForwardOutline} slot='end' />
                  </IonItem>
                ))}
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MenusPage;
