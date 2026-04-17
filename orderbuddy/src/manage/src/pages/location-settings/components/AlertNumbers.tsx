import React, { useRef } from 'react';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonSpinner,
  IonText,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { addCircleOutline, closeCircle } from 'ionicons/icons';

interface AlertNumber {
  _id?: string;
  phoneNumber: string;
}

interface AlertNumbersProps {
  alertNumbers: AlertNumber[];
  isLoading: boolean;
  addAlertNumber: (phoneNumber: string) => void;
  removeAlertNumber: (id: string) => void;
  formatPhoneNumber: (phoneNumber: string) => string;
  phoneNumber: string;
  updatePhoneNumber: (value: string) => void;
  phoneNumberError: string;
}

const AlertNumbers: React.FC<AlertNumbersProps> = ({
  alertNumbers,
  isLoading,
  addAlertNumber,
  removeAlertNumber,
  formatPhoneNumber,
  phoneNumber,
  updatePhoneNumber,
  phoneNumberError,
}) => {
  const inputRef = useRef<HTMLIonInputElement>(null);

  return (
    <div className='alert-numbers-container'>
      <IonGrid>
        <IonRow>
          <IonCol size='8'>
            <IonItem className='ion-margin-bottom'>
              <IonInput
                ref={inputRef}
                maxlength={10}
                label='Phone Number'
                labelPlacement='stacked'
                type='tel'
                placeholder='Enter phone number'
                value={phoneNumber}
                onIonInput={(e) => updatePhoneNumber(e.detail.value || '')}
                className={phoneNumberError ? 'phone-input error-input' : 'phone-input'}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    addAlertNumber(phoneNumber);
                  }
                }}
              />
            </IonItem>

            {phoneNumberError && (
              <IonText color='danger'>
                <p className='error-text'>
                  <strong>{phoneNumberError}</strong>
                </p>
              </IonText>
            )}
          </IonCol>
          <IonCol size='4' className='ion-align-self-end'>
            <IonButton
              expand='block'
              onClick={() => addAlertNumber(phoneNumber)}
              disabled={isLoading}
              className='solid-button'
            >
              {isLoading ? <IonSpinner name='dots' /> : <IonIcon icon={addCircleOutline} slot='start' color='light' />}
              Add
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      <div className='alert-numbers-list'>
        <IonText>
          <h5>Alert Phone Numbers</h5>
        </IonText>

        {alertNumbers.length === 0 && (
          <IonText color='medium'>
            <p>No alert numbers added yet</p>
          </IonText>
        )}

        {alertNumbers.length > 0 && (
          <IonList>
            {alertNumbers.map((alertNumber, index) => (
              <IonChip key={alertNumber._id || index} className='number-chip' outline={true} color='primary'>
                <IonLabel>{formatPhoneNumber(alertNumber.phoneNumber)}</IonLabel>
                <IonIcon icon={closeCircle} onClick={() => removeAlertNumber(alertNumber._id || '')} />
              </IonChip>
            ))}
          </IonList>
        )}
      </div>
    </div>
  );
};

export default AlertNumbers;
