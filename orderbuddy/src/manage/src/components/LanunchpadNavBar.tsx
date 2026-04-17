import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPopover,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import { personOutline, logOutOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { signOut } from 'supertokens-web-js/recipe/session';
import { appStore } from '../store';
import { useParams } from 'react-router-dom';

interface NavBarProps {
  title: string;
  showBackButton?: boolean;
}
async function onLogout() {
  await signOut();
  window.location.href = '/login';
}
const LaunchPadNavBar: React.FC<NavBarProps> = ({ title, showBackButton = true }) => {
  const restaurantName = appStore((s) => s.selection.restaurant.name);
  const locationName = appStore((s) => s.selection.location.name);
  const router = useIonRouter();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { restaurantId, locationId } = useParams<{ restaurantId: string; locationId: string }>();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <IonHeader>
      {!isMobile && (
        <IonToolbar>
          {showBackButton && (
            <IonButtons slot='start'>
              <IonBackButton defaultHref={`/${restaurantId}/${locationId}/launch-pad`} />
            </IonButtons>
          )}
          <IonGrid>
            <IonRow class=' '>
              <IonCol sizeMd='6' sizeXs='12'>
                <IonTitle>
                  <IonText>{title}</IonText>
                </IonTitle>
              </IonCol>

              <IonCol sizeMd='6' sizeXs='9' className='ion-text-end'>
                {restaurantName && <IonText className='ion-margin-end'>{restaurantName}</IonText>}
                {locationName && <IonText className='ion-margin-end'>{locationName}</IonText>}
                <IonIcon id='click-trigger' icon={personOutline} className='profile-icon ' />
                <IonPopover trigger='click-trigger' triggerAction='click'>
                  <IonContent className='ion-padding'>
                    <IonButton size='small' expand='block' fill='clear' onClick={onLogout}>
                      <IonIcon slot='start' icon={logOutOutline} />
                      Logout
                    </IonButton>
                  </IonContent>
                </IonPopover>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      )}

      {isMobile && (
        <IonToolbar>
          {showBackButton && router.canGoBack() && (
            <IonButtons slot='start'>
              <IonBackButton />
            </IonButtons>
          )}
          <IonGrid>
            <IonRow class=' '>
              <IonCol sizeMd='6' sizeXs='12' className='ion-text-center'>
                {restaurantName && <IonText className='ion-margin-end'>{restaurantName}</IonText>}
                {locationName && <IonText className='ion-margin-end'>{locationName}</IonText>}
                <IonIcon id='click-trigger' icon={personOutline} className='profile-icon ' />
                <IonPopover trigger='click-trigger' triggerAction='click'>
                  <IonContent className='ion-padding'>
                    <IonButton size='small' expand='block' fill='clear' onClick={onLogout}>
                      <IonIcon slot='start' icon={logOutOutline} />
                      Logout
                    </IonButton>
                  </IonContent>
                </IonPopover>
              </IonCol>
              <IonCol sizeMd='6' sizeXs='12' className='ion-text-center'>
                <IonTitle>{title}</IonTitle>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      )}
    </IonHeader>
  );
};

export default LaunchPadNavBar;
