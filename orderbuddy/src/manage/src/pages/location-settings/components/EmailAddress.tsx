import { IonItem, IonInput } from "@ionic/react"; 
interface EmailAddressProps {
  address: string;
  onAddressChange: (value: string) => void;
}
const EmailAddress: React.FC<EmailAddressProps> = ({ address, onAddressChange }) => {
  return (
    <IonItem>
      <div>
        <IonInput labelPlacement="stacked"
          label="Email Address"
          placeholder="Enter your email address"
          value={address}
          onIonInput={(e) => onAddressChange(e.detail.value!)}
        ></IonInput>
      </div>
    </IonItem>
  );
};

export default EmailAddress;
