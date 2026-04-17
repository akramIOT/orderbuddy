import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonText,
  useIonRouter,
} from '@ionic/react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocations } from '../../queries/useLocations';
import { GiFoodTruck } from 'react-icons/gi';
import { BiStoreAlt } from 'react-icons/bi';
import { appStore } from '../../store';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import '../../../style.css';
import { useCreateLocation } from '../../queries/useCreateLocation';

const LocationsPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { data: locations } = useLocations(restaurantId);
  const { setLocationName, setLocationSlug } = appStore();
  const router = useIonRouter();
  const createLocationMutation = useCreateLocation();

  const getLocationIcon = (isMobile: boolean) => {
    return isMobile ? <GiFoodTruck size={32} color='#424242' /> : <BiStoreAlt size={32} color='#424242' />;
  };

  const handleLocationClick = (location: { _id: string; name: string; isMobile: boolean }) => {
    setLocationName(location.name);
    router.push(`/${restaurantId}/${location._id}/launch-pad`);
    return;
  };

  useEffect(() => {
    setLocationName('');
    if (locations && locations.length === 0) {
      createLocationMutation.mutate(
        { restaurantId },
        {
          onSuccess: (data) => {
            setLocationName(data.name);
            setLocationSlug(data.locationSlug);
            router.push(`/${restaurantId}/${data._id}/apps/location-settings`);
            return;
          },
        },
      );
    } else if (locations?.length === 1) {
      setLocationName(locations[0].name);
      setLocationSlug(locations[0].locationSlug);
      router.push(`/${restaurantId}/${locations[0]._id}/launch-pad`);
      return;

      // if (
      //   locations[0].timezone &&
      //   locations[0].workingHours &&
      //   Array.isArray(locations[0].alertNumbers) && locations[0].alertNumbers.length > 0 &&
      //   locations[0].address &&
      //   locations[0].contact?.email
      // ) {
      //   router.push(`/${restaurantId}/${locations[0]._id}/launch-pad`);
      //   return;
      // } else {
      //   console.warn('Single location found but missing required fields, redirecting to settings');
      //   router.push(`/${restaurantId}/${locations[0]._id}/apps/location-settings`);
      // }
    }
  }, [locations]);

  return (
    <IonPage className='body'>
      <LaunchPadNavBar title='Locations' />
      <IonContent>
        <IonGrid>
          <IonRow class=' ion-padding-top ion-align-items-center'>
            {locations?.map((location) => (
              <IonCol size='6' size-md='3' className='ion-text-center' key={location._id}>
                <IonCard className='card-width ion-padding' onClick={() => handleLocationClick(location)}>
                  <IonCardContent className='ion-text-center'>
                    <div className='ion-text-center'>
                      <div className='location-icon'>{getLocationIcon(location.isMobile)}</div>
                    </div>
                    <div className='ion-text-center ion-padding-top '>
                      <IonText>{location.name}</IonText>
                      {/* <p className='ion-no-margin'>Location ID: {location.locationId}</p> */}
                    </div>{' '}
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

export default LocationsPage;
