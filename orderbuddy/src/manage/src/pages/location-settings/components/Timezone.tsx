import { IonSelect, IonSelectOption } from '@ionic/react';
interface TimezoneItem {
  id: string;
  name: string;
  group: string;
}

interface TimezoneProps {
  timezone: string;
  updateTimezone: (value: string) => void;
  timezones: {
    common: TimezoneItem[];
  };
}

const Timezone: React.FC<TimezoneProps> = ({ timezone, updateTimezone, timezones }) => {
  return (
    <IonSelect
      label='Select Timezone'
      labelPlacement='floating'
      value={timezone}
      onIonChange={(e) => updateTimezone(e.detail.value)}
      interface='action-sheet'
      cancelText='Cancel'
    >
      <IonSelectOption value='' disabled>
        Select a timezone
      </IonSelectOption>

      {timezones.common.map((tz: TimezoneItem) => (
        <IonSelectOption key={tz.id} value={tz.id}>
          {tz.name}
        </IonSelectOption>
      ))}
    </IonSelect>
  );
};

export default Timezone;
