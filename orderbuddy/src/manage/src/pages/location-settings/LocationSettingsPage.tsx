import {
  IonPage,
  IonContent,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonGrid,
  IonCol,
  IonRow,
  IonTextarea,
  IonInput,
  IonToggle,
} from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import WorkingHours from './components/WorkingHours';
import Timezone from './components/Timezone';
import OrderAcceptance from './components/OrderAcceptance';
import AlertNumbers from './components/AlertNumbers';
import { useLocationSettings } from './useLocationSettings';
import Address from './components/Address';
import AutoAccept from './components/AutoAccept';
import EmailAddress from './components/EmailAddress';

const LocationSettingsPage: React.FC = () => {
  const {
    workingHours,
    timezone,
    isLoading,
    isUpdating,
    updateTimezone,
    updateStoreOpen,
    updateWorkingHours,
    timezones,
    startAcceptMinutes,
    stopAcceptMinutes,
    updateStartAcceptOrders,
    updateStopAcceptOrders,
    alertNumbers,
    addAlertNumber,
    removeAlertNumber,
    formatPhoneNumber,
    phoneNumber,
    updatePhoneNumber,
    phoneNumberError,
    address,
    updateAddress,
    autoAccept,
    updateAutoAccept,
    emailAddress,
    updateEmailAddress,
  } = useLocationSettings();

  return (
    <IonPage className='stations-page'>
      <LaunchPadNavBar title='Location Settings' />
      <IonContent>
        <IonGrid>
          <IonRow className='ion-justify-content-center ion-padding'>
            <IonCol size='12'>
              <IonAccordionGroup>
                <IonAccordion value='timezone'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Time Zone</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <Timezone timezone={timezone} updateTimezone={updateTimezone} timezones={timezones} />
                  </div>
                </IonAccordion>
                <IonAccordion value='Hours'>
                  <IonItem slot='header' color='light'>
                    <IonLabel> Working Hours </IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <WorkingHours
                      workingHours={workingHours}
                      updateStoreOpen={updateStoreOpen}
                      updateWorkingHours={updateWorkingHours}
                      isLoading={isLoading}
                    />
                  </div>
                </IonAccordion>
                <IonAccordion value='Acceptance'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Order Acceptance</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <OrderAcceptance
                      startAcceptMinutes={startAcceptMinutes}
                      stopAcceptMinutes={stopAcceptMinutes}
                      updateStartAcceptOrders={updateStartAcceptOrders}
                      updateStopAcceptOrders={updateStopAcceptOrders}
                    />
                  </div>
                </IonAccordion>
                <IonAccordion value='AlertNumbers'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Alert Numbers</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <AlertNumbers
                      alertNumbers={alertNumbers}
                      isLoading={isUpdating}
                      addAlertNumber={addAlertNumber}
                      removeAlertNumber={removeAlertNumber}
                      formatPhoneNumber={formatPhoneNumber}
                      phoneNumber={phoneNumber}
                      updatePhoneNumber={updatePhoneNumber}
                      phoneNumberError={phoneNumberError}
                    />
                  </div>
                </IonAccordion>
                <IonAccordion value='Address'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Address</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <Address address={address} onAddressChange={updateAddress} />
                  </div>
                </IonAccordion>
                <IonAccordion value='AutoAccept'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Auto Accept</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <AutoAccept autoAccept={autoAccept} updateAutoAccept={updateAutoAccept} />
                  </div>
                </IonAccordion>
                 <IonAccordion value='Email Address'>
                  <IonItem slot='header' color='light'>
                    <IonLabel>Email Address</IonLabel>
                  </IonItem>
                  <div className='ion-padding' slot='content'>
                    <EmailAddress address={emailAddress} onAddressChange={updateEmailAddress} />
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

export default LocationSettingsPage;
