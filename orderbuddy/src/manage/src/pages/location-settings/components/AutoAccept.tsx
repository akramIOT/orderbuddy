import { IonToggle } from '@ionic/react';

interface AutoAcceptProps {
  autoAccept: boolean;
  updateAutoAccept: (value: boolean) => void;
}

const AutoAccept: React.FC<AutoAcceptProps> = ({ autoAccept, updateAutoAccept }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <IonToggle checked={autoAccept} onIonChange={(e) => updateAutoAccept(e.detail.checked)} color='primary' />
      Auto Accept Orders
    </label>
  );
};
export default AutoAccept;
