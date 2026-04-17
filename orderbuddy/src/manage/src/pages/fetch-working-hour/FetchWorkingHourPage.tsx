import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonModal,
  IonList,
  IonIcon,
  IonChip,
} from '@ionic/react';
import { useMutation } from '@tanstack/react-query';
import { close } from 'ionicons/icons';
import { axiosInstance } from '../../queries/axiosInstance';
import { logExceptionError } from '../../utils/errorLogger';
import '../../../style.css';
interface WorkingHoursPayload {
  restaurantName: string;
  restaurantAddress: string;
}

interface TimePeriod {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  isClosed: boolean;
  periods: TimePeriod[];
}

interface WorkingHoursResponse {
  openHours: DaySchedule[];
}

const FetchWorkingHourPage: React.FC = () => {
  const [restaurantName, setRestaurantName] = useState<string>('Les Schwab Tire Center');
  const [restaurantLocation, setRestaurantLocation] = useState<string>('4933 196th St SW, Lynnwood, WA 98036');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [result, setResult] = useState<WorkingHoursResponse | null>(null);

  const fetchWorkingHoursMutation = useMutation({
    mutationFn: async (data: WorkingHoursPayload) => {
      const response = await axiosInstance.post('/ai/fetch-working-hours', data);
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      setShowModal(true);
    },
    onError: (error) => {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'fetchWorkingHours.mutation',
        { restaurantName, restaurantLocation }
      );
      console.error('Error fetching working hours:', error);
    },
  });

  const handleFetchHours = () => {
    if (!restaurantName || !restaurantLocation) {
      return;
    }

    const payload: WorkingHoursPayload = {
      restaurantName: restaurantName,
      restaurantAddress: restaurantLocation,
    };

    fetchWorkingHoursMutation.mutate(payload);
  };

  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Working Hours</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className='ion-padding'>
        <IonCard className='simple-card'>
          <IonCardHeader>
            <IonCardTitle>Fetch Working Hours</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel className='custom-label'>Name</IonLabel>
              <IonInput
                value={restaurantName}
                onIonChange={(e) => setRestaurantName(e.detail.value?.toString() || '')}
                placeholder='Enter restaurant name'
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel className='custom-label'>Location</IonLabel>
              <IonInput
                value={restaurantLocation}
                onIonChange={(e) => setRestaurantLocation(e.detail.value?.toString() || '')}
                placeholder='Enter restaurant location'
              ></IonInput>
            </IonItem>

            <IonButton
              className='fetch-button'
              expand='block'
              onClick={handleFetchHours}
              disabled={!restaurantName || !restaurantLocation || fetchWorkingHoursMutation.isPending}
            >
              {fetchWorkingHoursMutation.isPending ? (
                <>
                  <IonSpinner name='dots' className='button-spinner' />
                  Fetching...
                </>
              ) : (
                'Fetch Work Hours'
              )}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {fetchWorkingHoursMutation.isPending && (
          <div className='loading-container'>
            <IonSpinner name='circles' />
            <p>Fetching working hours...</p>
          </div>
        )}

        {fetchWorkingHoursMutation.isError && (
          <IonCard className='error-card'>
            <IonCardContent>
              <IonText color='danger'>
                <h2>Error</h2>
                <p>Failed to fetch working hours. Please check the details and try again.</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Working Hours Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className='hours-modal'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2>Working Hours</h2>
              <IonIcon icon={close} onClick={() => setShowModal(false)} className='close-icon' />
            </div>

            <div className='restaurant-info'>
              <h3>{restaurantName}</h3>
              <p>{restaurantLocation}</p>
            </div>

            {result && (
              <IonList className='hours-list'>
                {result.openHours.map((dayData) => (
                  <IonItem key={dayData.day} className='day-item'>
                    <div className='day-container'>
                      <div className='day-name'>{capitalizeDay(dayData.day)}</div>
                      <div className='day-hours'>
                        {dayData.isClosed ? (
                          <IonChip color='medium' className='closed-chip'>
                            Closed
                          </IonChip>
                        ) : (
                          dayData.periods.map((period, index) => (
                            <div key={index} className='period'>
                              {period.start} - {period.end}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            )}

            <IonButton expand='block' onClick={() => setShowModal(false)} className='close-button'>
              Close
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default FetchWorkingHourPage;
