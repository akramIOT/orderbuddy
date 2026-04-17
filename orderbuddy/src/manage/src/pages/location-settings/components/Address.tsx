import { IonTextarea,IonItem, IonInput } from "@ionic/react"; 
interface AddressProps {
  address: string;
  onAddressChange: (value: string) => void;
}
const Address: React.FC<AddressProps> = ({ address, onAddressChange }) => {
  return (
    <IonItem>
      <div>
        <IonInput labelPlacement="stacked"
          label="Address"
          placeholder="Enter your address "
          value={address}
          onIonInput={(e) => onAddressChange(e.detail.value!)}
        ></IonInput>
      </div>
    </IonItem>
  );
};

export default Address;
