import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  useIonRouter,
} from '@ionic/react';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStations } from '../../queries/useStations';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { enterOutline } from 'ionicons/icons';
import '../../../style.css';

const KdsPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<{
    restaurantId: string;
    locationId: string;
  }>();
  const router = useIonRouter();
  const { data: stations } = useStations(restaurantId, locationId);
  const handleStationClick = (stationId: string) => {
    router.push(`/${restaurantId}/${locationId}/apps/station/${stationId}`, 'forward', 'push');
  };
  return (
    <IonPage className='stations-page'>
      <LaunchPadNavBar title='Stations' />

      <IonContent>
        <IonGrid>
          <IonRow>
            {stations?.map((station, index) => (
              <IonCol size-sm='6' size-md='3' key={index}>
                <IonCard key={station._id}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '16px' }}>{station.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size='12'>
                          <IonButton
                            expand='block'
                            fill='outline'
                            size='small'
                            onClick={() => handleStationClick(station._id)}
                          >
                            <IonIcon icon={enterOutline} slot='start' />
                            Go to Station
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
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

export default KdsPage;
