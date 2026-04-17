import {
  IonContent,
  IonPage,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  useIonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/react';
import React, { useState } from 'react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { add, trash } from 'ionicons/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePrinter, usePrinters } from '../../queries/printers/usePrinter';
import { useParams } from 'react-router-dom';
interface PrinterPageParams {
  restaurantId: string;
  locationId: string;
}
const createPrinterSchema = z.object({
  name: z.string().min(1, 'Printer name is required'),
  //ip: z.string().ip('Invalid IP address'), // enable this later
  ip: z.string().min(1,'Invalid IP address'),
});

type CreatePrinterForm = z.infer<typeof createPrinterSchema>;

const PrintersPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<PrinterPageParams>();
  const [isOpen, setIsOpen] = useState(false);
  const [presentToast] = useIonToast();

  const { data: printers = [] } = usePrinters(restaurantId, locationId);
  const createPrinterMutation = useCreatePrinter(restaurantId, locationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePrinterForm>({
    resolver: zodResolver(createPrinterSchema),
  });

  const onSubmit = async (data: CreatePrinterForm) => {
    try {
      await createPrinterMutation.mutateAsync(data);
      setIsOpen(false);
      reset();
      presentToast({
        message: 'Printer added successfully',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: 'Failed to add printer',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  return (
    <IonPage className='stations-page'>
      <LaunchPadNavBar title='Printers' />

      <IonContent>
        <IonGrid>
          <IonRow>
            {printers.map((printer) => (
              <IonCol size-sm='6' size-md='3' key={printer.id}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonText style={{ fontSize: '14px' }}>{printer.name}</IonText>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText color='medium'>IP: {printer.ip}</IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={() => setIsOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add Printer</IonTitle>
              <IonButtons slot='end'>
                <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <form onSubmit={handleSubmit(onSubmit)} className='ion-padding'>
              <IonItem>
                <IonLabel position='stacked'>Printer Name</IonLabel>
                <IonInput {...register('name')} />
                {errors.name && <IonText color='danger'>{errors.name.message}</IonText>}
              </IonItem>

              <IonItem>
                <IonLabel position='stacked'>IP Address</IonLabel>
                <IonInput {...register('ip')} />
                {errors.ip && <IonText color='danger'>{errors.ip.message}</IonText>}
              </IonItem>
              <IonGrid>
                <IonRow>
                  <IonCol className='ion-text-center'>
                    <IonButton type='submit' className='solid-button' disabled={createPrinterMutation.isPending}>
                      {createPrinterMutation.isPending ? 'Adding...' : 'Add Printer'}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PrintersPage;
