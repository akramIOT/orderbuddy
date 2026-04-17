import {
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonText,
  IonRadio,
  IonRadioGroup,
  IonGrid,
  IonCol,
  IonRow,
} from '@ionic/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateOrigin } from '../../../queries/origin/useOrigin';
import { useParams } from 'react-router-dom';
import { logExceptionError } from '../../../utils/errorLogger';

const schema = z.object({
  name: z.string().min(1, 'Origin name is required'),
  type: z.enum(['table', 'parking'], {
    required_error: 'Please select an origin type',
  }),
});

type FormData = z.infer<typeof schema>;
interface AddOriginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddOriginModal: React.FC<AddOriginModalProps> = ({ isOpen, onClose }) => {
  const { restaurantId, locationId } = useParams<{
    restaurantId: string;
    locationId: string;
  }>();
  const createOrigin = useCreateOrigin();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),

    defaultValues: {
      type: 'table',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createOrigin.mutateAsync({
        name: data.name,
        type: data.type,
        restaurantId,
        locationId,
      });
      reset();
      onClose();
    } catch (error) {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'addOriginPage.onSubmit',
        { restaurantId, locationId, originType: data.type }
      );
      console.error('Error creating origin:', error);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} trigger='add-origin-modal'>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Add New Origin</IonTitle>
            <IonButtons slot='end'>
              <IonButton onClick={onClose}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <form onSubmit={handleSubmit(onSubmit)} className='ion-padding'>
            <IonItem>
              <IonInput
                label='Origin Name'
                labelPlacement='floating'
                {...register('name')}
                className={errors.name ? 'ion-invalid' : ''}
              />
            </IonItem>
            {errors.name && (
              <IonText color='danger' className='ion-padding-start'>
                <small>{errors.name.message}</small>
              </IonText>
            )}

            <IonItem className='ion-margin-top'>
              <IonRadioGroup value={watch('type')} onIonChange={(e) => setValue('type', e.detail.value)}>
                <IonLabel position='stacked'>Origin Type</IonLabel>
                <div className='ion-padding-top'>
                  <IonItem lines='none'>
                    <IonRadio value='table' labelPlacement='end'>
                      Table
                    </IonRadio>
                  </IonItem>
                  <IonItem lines='none'>
                    <IonRadio value='parking' labelPlacement='end'>
                      Parking
                    </IonRadio>
                  </IonItem>
                </div>
              </IonRadioGroup>
            </IonItem>
            {errors.type && (
              <IonText color='danger' className='ion-padding-start'>
                <small>{errors.type.message}</small>
              </IonText>
            )}
            <IonGrid>
              <IonRow>
                <IonCol size='12' className='ion-text-center'>
                  <IonButton type='submit' className='ion-margin-top' fill='outline'>
                    Add Origin
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
        </IonContent>
      </IonModal>
    </>
  );
};

export default AddOriginModal;
