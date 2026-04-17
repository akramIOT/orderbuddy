import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCard,
  IonCol,
  useIonRouter,
  IonText,
  IonCardContent,
  useIonToast,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useRestaurants } from '../../queries/useRestaurants';
import Session from 'supertokens-web-js/recipe/session';
import { appStore } from '../../store';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { useCreateRestaurant } from '../../queries/useCreateRestaurant';
import { add, close } from 'ionicons/icons';

const RestaurantsPage: React.FC = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const { setRestaurantName } = appStore();
  const { setLocationName } = appStore();
  const { setRestaurantLogo } = appStore();
  const [presentToast] = useIonToast();

  const createRestaurantMutation = useCreateRestaurant();
  useEffect(() => {
    const getJWT = async () => {
      if (await Session.doesSessionExist()) {
        const accessToken = await Session.getUserId();
        setUserId(accessToken);
      }
    };
    getJWT();
  }, []);

  const { data: restaurantsData } = useRestaurants(userId);

  const router = useIonRouter();

  const handleRestaurantClick = (restaurantId: string) => {
    setRestaurantLogo(restaurantsData?.find((r) => r._id === restaurantId)?.logo || '');
    setRestaurantName(restaurantsData?.find((r) => r._id === restaurantId)?.name || '');
    router.push(`/${restaurantId}/locations`);
    return;
  };
  React.useEffect(() => {
    setRestaurantName('');
    setLocationName('');

    if (restaurantsData) {
      if (restaurantsData.length === 0 && userId) {
        createRestaurantMutation.mutate(userId, {
          onSuccess: (data) => {
            const restaurant = data.restaurant;
            setRestaurantLogo(restaurant.logo || '');
            setRestaurantName(restaurant.name || '');
            router.push(`/${restaurant._id}/apps/restaurant-settings`);
            return;
          },
        });
      } else if (restaurantsData.length === 1) {
        setRestaurantLogo(restaurantsData[0].logo || '');

        if (restaurantsData[0].name && restaurantsData[0]._id && restaurantsData[0].logo && restaurantsData[0].concept) {
          handleRestaurantClick(restaurantsData[0]._id);
        }
        else {
          presentToast({
            message: 'Restaurant data is incomplete. Please check the restaurant details.',
            duration: 2000,
            color: 'warning',
          });
            router.push(`/${ restaurantsData[0]._id }/apps/restaurant-settings`);
            return
        }
      }
    }
  }, [restaurantsData]);
  return (
    <IonPage className='body'>
      <LaunchPadNavBar title='Restaurants' showBackButton={false} />
      <IonContent>
        <IonGrid>
          <IonRow class='ion-padding-top ion-align-items-center'>
            {restaurantsData?.map((restaurant) => (
              <IonCol size='6' size-md='3' className='ion-text-center' key={restaurant._id}>
                <IonCard
                  className='card-width ion-padding'
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  key={restaurant._id}
                >
                  <IonCardContent>
                    {restaurant.logo && <img src={restaurant.logo} alt={restaurant.name} style={{ height: '64px' }} />}

                    <IonText
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {restaurant.name}
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RestaurantsPage;
