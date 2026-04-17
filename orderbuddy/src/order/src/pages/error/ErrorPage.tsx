import { IonFooter, useIonRouter } from '@ionic/react';
import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { useQueryParams } from '@/hooks/useQueryParams';

export function ErrorPage() {
  const router = useIonRouter();
  const code = useQueryParams().get('code');

  return (
    <IonPage>
      <IonContent class='ion-padding ion-text-center'>
        <IonText className='ion-padding-bottom'>
          <h4>{code}</h4>
        </IonText>

        <IonSpinner name='crescent' />
      </IonContent>

      <IonFooter className='ion-padding ion-text-end'>Powered by OrderBuddy</IonFooter>
    </IonPage>
  );
}

export default ErrorPage;
