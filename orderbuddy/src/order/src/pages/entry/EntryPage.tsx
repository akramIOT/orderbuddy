import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonFooter, useIonRouter } from '@ionic/react';
import { useRestaurant, useLocation, useOrigin, useCampaign } from '@/shared/useEntryInfo';
import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useMenus } from '@/queries/useMenus';
import { Paths } from '@/routes/paths';
import { logApiError } from '@/utils/errorLogger';

export function EntryPage() {
  const { originId } = useParams<{ originId: string }>();
  const nameParam = useQueryParams().get('name');
  const restaurantName = nameParam ? decodeURIComponent(nameParam) : null;
  const router = useIonRouter();

  // Fetch origin data
  const { data: origin, isError: isOriginError, error: originError } = useOrigin(originId);

  // Get data based on origin
  const {
    data: restaurant,
    isError: isRestaurantError,
    error: restaurantError,
  } = useRestaurant(origin?.restaurantId || '');

  const {
    data: location,
    isError: isLocationError,
    error: locationError,
  } = useLocation(origin?.restaurantId || '', origin?.locationId || '');

  const {
    data: menus,
    isError: isMenusError,
    error: menusError,
  } = useMenus(origin?.restaurantId || '', origin?.locationId || '');

  const allDataLoaded = restaurant && location && origin && menus;
  const hasError = isRestaurantError || isLocationError || isOriginError || isMenusError;

  const init = useCallback(async () => {
    if (!restaurant || !location || !origin) return;
    if (!menus || menus.length === 0) return;

    // Use IonRouter to navigate with route replacement
    const path = Paths.menus(origin?.restaurantId || '', location.locationSlug, origin?.locationId || '', originId);
    router.push(path, 'forward', 'replace');

    return;
  }, [restaurant, location, origin, menus, origin?.restaurantId, origin?.locationId, originId, router]);

  useEffect(() => {
    // Only initialize once we have all the data
    if (allDataLoaded) {
      init();
    }
  }, [allDataLoaded, init]);

  useEffect(() => {
    if (isRestaurantError) {
      console.error('Restaurant error:', restaurantError);
      router.push('/error?code=invalid-restaurant', 'forward');
    } else if (isLocationError) {
      console.error('Location error:', locationError);
      router.push('/error?code=invalid-location', 'forward');
    } else if (isOriginError && origin?._id && origin._id.length < 0) {
      console.error('Origin error:', originError);
      router.push('/error?code=invalid-origin', 'forward');
    } else if (isMenusError) {
      console.error('Menus error:', menusError);
      router.push('/error?code=menus-load-failed', 'forward');
    }
  }, [
    isRestaurantError,
    restaurantError,
    isLocationError,
    locationError,
    isOriginError,
    originError,
    isMenusError,
    menusError,

    router,
    origin,
  ]);

  // General error handling
  if (hasError) {
    let errorObj = restaurantError || locationError || originError || menusError;
    console.error('Error loading entry data:', errorObj);
    logApiError(errorObj, `entry/${origin?.restaurantId || ''}/${origin?.locationId || ''}/${originId}`, {
      operation: 'loadEntryPageData',
      restaurantId: origin?.restaurantId || '',
      locationId: origin?.locationId || '',
      originId,
      isCampaign: origin?.type === 'campaign',
    });
    return null;
  }

  return (
    <IonPage>
      <IonContent class='ion-padding ion-text-center'>
        <IonText className='ion-padding-bottom'>
          <h1>Welcome to {restaurantName || 'your restaurant'}</h1>
        </IonText>

        <IonText className='ion-padding-bottom'>
          <h4>We’re preparing your menu…</h4>
        </IonText>

        <IonSpinner name='crescent' />
      </IonContent>

      <IonFooter className='ion-padding ion-text-end'>
        <IonText>Powered by OrderBuddy</IonText>
      </IonFooter>
    </IonPage>
  );
}

export default EntryPage;
