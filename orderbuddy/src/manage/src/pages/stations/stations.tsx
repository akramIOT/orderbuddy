import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonFab,
  IonGrid,
  IonRow,
  IonCol,
  IonFabButton,
  IonText,
} from '@ionic/react';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useStations } from '../../queries/useStations';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { add } from 'ionicons/icons';
import AddStationModal from './components/addStation';
import '../../../style.css';
const StationsPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<{
    restaurantId: string;
    locationId: string;
  }>();
  const router = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: stations } = useStations(restaurantId, locationId);

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
                    <IonCardTitle>
                      <IonText style={{ fontSize: '14px' }}>{station.name}</IonText>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent></IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            {' '}
            <IonIcon icon={add} />
          </IonFabButton>
          <AddStationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />{' '}
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default StationsPage;
