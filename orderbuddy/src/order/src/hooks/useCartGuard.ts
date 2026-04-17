import { Paths } from '@/routes/paths';
import { useOrderStore } from '@/stores/orderStore';
import { useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import { useParams } from 'react-router';

type MenuParams = {
  restaurantId: string;
  locationId: string;
  menuId: string;
  locationSlug: string;
  menuSlug: string;
};
export const useCartGuard = () => {
  const router = useIonRouter();
  const restaurantData = useOrderStore((state) => ({
    restaurant: state.restaurant,
    location: state.location,
    origin: state.origin,
  }));
  const { restaurantId, locationId, menuId, locationSlug, menuSlug } = useParams<MenuParams>();
  const searchParams = new URLSearchParams(window.location.search);
  let originId = searchParams.get('originId');

  useEffect(() => {
    if (!restaurantData.restaurant._id || !restaurantData.location._id || !menuId) {
      console.warn('Missing required cart parameters, redirecting to menu');

      // Only redirect if we have minimum required params
      if (restaurantId && locationSlug && locationId && menuSlug && menuId && originId) {
        router.push(Paths.menu(restaurantId, locationSlug, locationId, menuSlug, menuId, originId), 'back');
        return;
      } else {
        console.warn('Insufficient parameters to redirect to menu, redirecting to home');
        // Fallback to home if we don't have required params
        router.push('/', 'root');
        return;
      }
    }
  }, [menuId, restaurantData]);
};
