import React, { useRef, useState } from 'react';
import DateStepper from '../shared/date-stepper';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { useSalesOrigin } from './useSalesOrigin';
import EmptyState from '../orders-page/components/EmptyState';
import { SalesOriginList } from './components/SalesOriginList';
import '../../../style.css';
import { getYesterdayDateYYYMMDD } from '../../utils/datetimeUtil';

const SalesOriginPage: React.FC = () => {

  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDateYYYMMDD());
  const { salesOrigin, isLoading, refetch, formatCurrency, calculateWidth } = useSalesOrigin(selectedDate);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    refetch().then(() => {
      event.detail.complete();
    });
  };

  return (
    <IonPage>
      <LaunchPadNavBar title='Sales by Origin' />
      <IonContent>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid>
          <DateStepper selectedDate={selectedDate} onDateChange={setSelectedDate} />

          {!isLoading && salesOrigin.length === 0 && (
            <EmptyState title='📊 No Sales Data' subTitle='There were no sales recorded for the selected date.' />
          )}

          {!isLoading && salesOrigin.length > 0 && (
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardContent>
                    <SalesOriginList
                      items={salesOrigin}
                      calculateWidth={calculateWidth}
                      formatCurrency={formatCurrency}
                    />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SalesOriginPage;
