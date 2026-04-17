import { IonCard, IonCol, IonContent, IonGrid, IonIcon, IonPage, IonRow, IonText, IonTitle } from '@ionic/react';
import { IconType } from 'react-icons';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import React from 'react';
import { messaging } from '../../firebase/firebase';
import { onMessage } from 'firebase/messaging';
import { isPlatform } from '@ionic/react';
import { useInitializeNotifications } from '../../queries/useNotification';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { getLaunchPadConfig } from './LaunchPadSection';
import { useLocations } from '../../queries/useLocations';
import { appStore } from '../../store';
import Session from 'supertokens-web-js/recipe/session';
import { useRestaurants } from '../../queries/useRestaurants';
import '../../../style.css';
import { usePrinters } from '../../queries/printers/usePrinter';

const LaunchPadPage: React.FC = (props) => {
  const { restaurantId, locationId } = useParams<{ restaurantId: string; locationId: string }>();
  const { mutate: initializeNotifications } = useInitializeNotifications();
  const { data: locations } = useLocations(restaurantId);
  const { setLocationName, setLocationSlug } = appStore();
  const setPrinters = appStore((state) => state.setPrinters);

  const [userId, setUserId] = useState<string | undefined>();
  const { setRestaurantName } = appStore();
  const { data: printers } = usePrinters(restaurantId, locationId);
  useEffect(() => {
    if (printers) {
      setPrinters(printers);
    }
  }, [printers, setPrinters]);
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
  useEffect(() => {
    if (restaurantsData && restaurantsData.length === 1) {
      setRestaurantName(restaurantsData[0].name);
    } else {
      const currentRestaurant = restaurantsData?.find((restaurant) => restaurant._id === restaurantId);
      if (currentRestaurant) {
        setRestaurantName(currentRestaurant.name);
      }
    }
  }, [restaurantsData, setRestaurantName]);
  useEffect(() => {
    if (locations && locations.length === 1) {
      setLocationName(locations[0].name);
      setLocationSlug(locations[0].locationSlug);
    } else {
      const currentLocation = locations?.find((location) => location._id === locationId);
      if (currentLocation) {
        setLocationName(currentLocation.name);
        setLocationSlug(currentLocation.locationSlug);
      }
    }
  }, [locations, locationId, setLocationName, setLocationSlug]);
  useEffect(() => {
    if (restaurantId) {
      initializeNotifications(restaurantId);

      // Set up web message listener
      if (isPlatform('desktop') || isPlatform('mobileweb')) {
        onMessage(messaging, (payload) => {
          console.log('notification Message received:', payload);
        });
      }
    }
  }, [restaurantId]);

  return (
    <IonPage className='body'>
      <LaunchPadNavBar title='Launch Pad' />
      <IonContent>
        <IonGrid>
          {getLaunchPadConfig(restaurantId, locationId).map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <IonRow className='ion-padding-top '>
                <IonCol size='12'>
                  <IonTitle className='ion-padding-start' style={{ fontSize: '17px' }}>
                    {section.name}
                  </IonTitle>
                </IonCol>
              </IonRow>
              <IonRow className='ion-no-padding   ion-padding-top'>
                {section.apps.map((app, appIndex) => (
                  <IonCol key={appIndex} size='6' size-md='2'>
                    <Link to={app.link}>
                      <IonCard className='card-width ion-padding'>
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: '25%',
                              padding: '9px',
                              marginTop: '10px',
                            }}
                          >
                            {app.isIonIcon ? (
                              <IonIcon icon={app.icon as string} color={app.iconProps?.color} size='large' />
                            ) : (
                              React.createElement(app.icon as IconType, {
                                size: app.iconProps?.size,
                                color: app.iconProps?.color,
                              })
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }} className='ion-padding-top'>
                          {app.name}
                        </div>
                      </IonCard>
                    </Link>
                  </IonCol>
                ))}
              </IonRow>
            </React.Fragment>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default LaunchPadPage;
