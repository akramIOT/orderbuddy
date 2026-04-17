import React, { useRef } from 'react';
import { IonButton, IonIcon, IonDatetimeButton, IonModal, IonDatetime, IonRow } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';

type DateStepperProps = {
  selectedDate: string;
  onDateChange: (value: string) => void;
  onDateClick?: () => void;
  stopAtToday?: boolean;
};

const DateStepper: React.FC<DateStepperProps> = ({ selectedDate, onDateChange, onDateClick, stopAtToday = true }) => {
  const modalRef = useRef<HTMLIonModalElement>(null);

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().substring(0, 10);

  // Step date by +/- 1 day
  const stepDate = (step: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + step);
    const newDate = currentDate.toISOString().substring(0, 10);
    if (!stopAtToday || new Date(newDate) <= new Date(today)) {
      onDateChange(newDate);
    }
  };

  const handleDateChange = (value: string) => {
    onDateChange(value);
    modalRef.current?.dismiss();
  };

  // Disable forward button if selectedDate is today
  const isForwardDisabled = selectedDate >= today;

  return (
    <IonRow className='ion-justify-content-center ion-padding-top' style={{ alignItems: 'center' }}>
      <IonButton size='small' fill='clear' onClick={() => stepDate(-1)}>
        <IonIcon icon={chevronBack} />
      </IonButton>
      <IonDatetimeButton datetime='item-sales-date'></IonDatetimeButton>
      <IonButton size='small' fill='clear' onClick={() => stepDate(1)} disabled={isForwardDisabled}>
        <IonIcon icon={chevronForward} />
      </IonButton>
      <IonModal ref={modalRef} keepContentsMounted={true}>
        <IonDatetime
          id='item-sales-date'
          presentation='date'
          value={selectedDate}
          onIonChange={(e) => handleDateChange(e.detail.value as string)}
          max={today}
        ></IonDatetime>
      </IonModal>
    </IonRow>
  );
};

export default DateStepper;
