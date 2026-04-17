import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLabel,
  IonCheckbox,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonSpinner,
  IonItem,
  IonChip,
  IonCard,
} from '@ionic/react';
import { WorkingHour } from '../../../queries/location-settings/useLocationSettingsApi';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface WorkingHoursProps {
  workingHours: WorkingHour[];
  updateStoreOpen: (index: number) => void;
  updateWorkingHours: (index: number, key: 'startTime' | 'endTime', value: string) => void;
  isLoading?: boolean;
}

const WorkingHours: React.FC<WorkingHoursProps> = ({
  workingHours = [],
  updateStoreOpen,
  updateWorkingHours,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <IonGrid>
        <IonRow className='ion-justify-content-center ion-padding'>
          <IonSpinner name='circular' />
        </IonRow>
      </IonGrid>
    );
  }

  return (
    <IonGrid>
      <IonRow className='ion-padding-bottom ion-text-center'>
        <IonCol size='3'>
          <IonText color='medium'>
            <strong>Day</strong>
          </IonText>
        </IonCol>
        <IonCol size='2'>
          <IonText color='medium'>
            <strong>Open</strong>
          </IonText>
        </IonCol>
        <IonCol size='3'>
          <IonText color='medium'>
            <strong>Start Time</strong>
          </IonText>
        </IonCol>
        <IonCol size='3'>
          <IonText color='medium'>
            <strong>End Time</strong>
          </IonText>
        </IonCol>
        <IonCol size='1'></IonCol>
      </IonRow>

      {workingHours.map((hour: WorkingHour, index: number) => (
        <div key={hour.day}>
          <IonRow className='ion-align-items-center ion-padding-vertical'>
            <IonCol size='3' className='ion-text-center'>
              <IonLabel>{capitalize(hour.day)}</IonLabel>
            </IonCol>

            <IonCol size='2' className='ion-text-center'>
              <IonCheckbox checked={hour.isOpen} onIonChange={() => updateStoreOpen(index)}></IonCheckbox>
            </IonCol>

            <IonCol size='3' className='ion-text-center'>
              {hour.isOpen && (
                <>
                  <IonDatetimeButton datetime={`start-${hour.day}`} />
                  <IonModal keepContentsMounted={true}>
                    <IonDatetime
                      id={`start-${hour.day}`}
                      presentation='time'
                      onIonChange={(e) => updateWorkingHours(index, 'startTime', e.detail.value as string)}
                      value={hour.startTime || undefined}
                    />
                  </IonModal>
                </>
              )}
              {!hour.isOpen && <IonText color='medium'>--</IonText>}
            </IonCol>

            <IonCol size='3' className='ion-text-center'>
              {hour.isOpen && (
                <>
                  <IonDatetimeButton datetime={`end-${hour.day}`} />
                  <IonModal keepContentsMounted={true}>
                    <IonDatetime
                      id={`end-${hour.day}`}
                      presentation='time'
                      onIonChange={(e) => updateWorkingHours(index, 'endTime', e.detail.value as string)}
                      value={hour.endTime || undefined}
                    />
                  </IonModal>
                </>
              )}
              {!hour.isOpen && <IonText color='medium'>--</IonText>}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <hr style={{ borderTop: '1px solid #ddd', width: '100%', margin: '0' }} />
            </IonCol>
          </IonRow>
        </div>
      ))}
    </IonGrid>
  );
};

export default WorkingHours;
