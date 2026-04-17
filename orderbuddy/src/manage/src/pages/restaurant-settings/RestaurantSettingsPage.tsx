import React from 'react';
import {
  IonPage,
  IonContent,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { storefront, imageOutline } from 'ionicons/icons';
import { useRestaurantPage } from './useRestaurantPage';
import Profile from './components/Profile';
import Logo from './components/Logo';

const RestaurantSettingsPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<{ restaurantId: string; locationId: string }>();
  const { profile, updateProfile, handleLogoUpload } = useRestaurantPage(restaurantId, locationId);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/restaurants' />
          </IonButtons>
          <IonTitle>Restaurant Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow className='ion-justify-content-center ion-padding'>
            <IonCol size='12'>
              <IonAccordionGroup>
                {/* Restaurant Profile Section */}
                <IonAccordion value='profile'>
                  <IonItem slot='header' color='light'>
                    <IonIcon icon={storefront} slot='start' />
                    <IonLabel>Profile</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <Profile profile={profile} updateProfile={updateProfile} />
                  </div>
                </IonAccordion>
                {/* Restaurant Logo Section */}
                <IonAccordion value='logo'>
                  <IonItem slot='header' color='light'>
                    <IonIcon icon={imageOutline} slot='start' />
                    <IonLabel>Logo</IonLabel>
                  </IonItem>
                  <div slot='content'>
                    <Logo logo={profile.logo} handleLogoUpload={handleLogoUpload} />
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RestaurantSettingsPage;
