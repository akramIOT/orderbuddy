import { IonCol, IonContent, IonGrid, IonPage, IonRow, IonSpinner, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { appStore } from './store';
import Session from 'supertokens-web-js/recipe/session';
export const useAuth = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const setAuthToken = appStore((state) => state.setAuthToken);

  useEffect(() => {
    const getToken = async () => {
      try {
        if (await Session.doesSessionExist()) {
          const token = await Session.getAccessToken();
          if (token) {
            setJwt(token);
            setAuthToken(token);
          } else {
            console.warn('No session token found');
          }
        }
      } catch (error) {
        console.error('Failed to get session token:', error);
      } finally {
        setLoading(false);
      }
    };

    getToken();
  }, []);

  return { jwt, loading };
};
const RootPage: React.FC = () => {
  const router = useIonRouter();
  const { jwt, loading } = useAuth();
  const { setLocationName } = appStore();
  const { setRestaurantName } = appStore();

  useEffect(() => {
    if (!loading) {
      if (jwt) {
        setLocationName('');
        setRestaurantName('');

        router.push('/restaurants');
        return;
      } else {
        router.push('/login');
        return;
      }
    }
  }, [loading, jwt, router]);

  return (
    <IonPage className='body'>
      <IonContent className='IonContent'>
        <IonGrid className='spinner-container' style={{ height: '100vh' }}>
          <IonRow className='ion-justify-content-center ion-align-items-center' style={{ height: '100%' }}>
            <IonCol className='ion-text-center IonCol'>
              <IonSpinner className='spinner-icon' color='tertiary' name='lines-sharp' style={{ width: '300px' }} />
              <div style={{ marginTop: '20px' }}>Loading...</div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RootPage;
