import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { CampaignFormData } from '../useCampaign';


interface AddCampaignProps {
  isOpen: boolean;
  onClose: () => void;
  createCampaign: (data: CampaignFormData) => Promise<boolean>;
}

const campaignSchema = z.object({
  name: z.string().min(1, { message: 'Campaign name is required' }),
  type: z.enum(['flat', 'percent', 'bogo', 'free_item']),
  flatOffCents: z
    .string()
    .min(1, { message: 'Discount amount is required' })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: 'Please enter a valid dollar amount',
    }),
  originId: z.string().optional(),
});

type FormData = z.infer<typeof campaignSchema>;

const AddCampaign: React.FC<AddCampaignProps> = ({ isOpen, onClose, createCampaign }) => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      type: 'flat',
      flatOffCents: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const success = await createCampaign(data);

      if (success) {
        reset();
        onClose();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add New Campaign</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={handleClose}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <IonItem>
            <IonLabel position='stacked'>Campaign Name</IonLabel>
            <IonInput type='text' placeholder='Enter your campaign name' {...register('name')} />
            {errors.name && (
              <IonText color='danger' className='error-message'>
                {errors.name.message}
              </IonText>
            )}
          </IonItem>

          <IonItem>
            <IonLabel position='stacked'>Campaign Type</IonLabel>
            <IonSelect {...register('type')}>
              <IonSelectOption value='flat'>Flat Discount</IonSelectOption>
              <IonSelectOption value='percent'>Percentage Discount</IonSelectOption>
              <IonSelectOption value='bogo'>Buy One Get One</IonSelectOption>
              <IonSelectOption value='free_item'>Free Item</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position='stacked'>Discount Amount ($)</IonLabel>
            <IonInput type='number' step='0.01' placeholder='5.00' {...register('flatOffCents')} />
            {errors.flatOffCents && (
              <IonText color='danger' className='error-message'>
                {errors.flatOffCents.message}
              </IonText>
            )}
          </IonItem>

          <div className='form-buttons'>
            <IonButton expand='block' type='submit' disabled={isSubmitting} className='solid-button'>
              {isSubmitting ? <IonSpinner name='dots' /> : 'Save '}
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonModal>
  );
};

export default AddCampaign;
