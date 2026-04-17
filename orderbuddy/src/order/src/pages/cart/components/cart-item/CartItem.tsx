import { IonButton, IonIcon, IonItem, IonLabel, IonText } from '@ionic/react';
import { closeCircleSharp, closeOutline, trashOutline } from 'ionicons/icons';
import React from 'react';
import { useOrderStore } from '@/stores/orderStore';

interface ModifierOption {
  name: string;
}

interface Modifier {
  name: string;
  options: ModifierOption[];
}

interface Variant {
  name: string;
}
interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    notes?: string;
    variants?: Variant[];
    modifiers?: Modifier[];
  };
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const removeOrderItemState = useOrderStore((s) => s.removeOrderItem);

  const removeOrderItem = (orderItemId: string) => {
    removeOrderItemState(orderItemId);
  };

  return (
    <IonItem key={item.id}>
      <IonLabel>
        <IonText className='font-size-14'>{item.name}</IonText>
        {item.variants && item.variants.length > 0 && (
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {item.variants.map((variant) => variant.name).join(', ')}
          </div>
        )}{' '}
        {item.modifiers && (
          <div>
            {item.modifiers?.map((modifiersOptions, index) => (
              <span key={index} style={{ fontSize: '12px' }}>
                <IonText style={{ fontWeight: 'bold' }}>{modifiersOptions.name}: </IonText>
                {modifiersOptions.options?.map((option, optIndex) => (
                  <React.Fragment key={optIndex}>
                    {option.name}
                    {optIndex !== (modifiersOptions.options?.length || 0) - 1 && ', '}
                  </React.Fragment>
                ))}
                <br />
              </span>
            ))}
          </div>
        )}
        {item.notes &&<div style={{maxWidth:"80%"}}><IonText  style={{fontSize:"11px",textTransform:"capitalize"}}>{item.notes}</IonText></div> }
      </IonLabel>
      <IonLabel slot='end'>
        {' '}
        <p>
          <IonText>${(item.price / 100).toFixed(2)}</IonText>
        </p>
      </IonLabel>
      <IonButton fill='clear' slot='end' onClick={() => removeOrderItem(item.id)}>
        <IonIcon slot='icon-only' icon={closeOutline} />
      </IonButton>
    </IonItem>
  );
};
