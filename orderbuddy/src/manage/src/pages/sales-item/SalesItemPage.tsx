import React, { useRef, useState } from 'react';
import DateStepper from '../shared/date-stepper';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { useSalesItem } from './useSalesItem';
import EmptyState from '../orders-page/components/EmptyState';
import { SalesItemList } from './components/SalesItemList';
import { SalesItemMetrics } from './components/SalesItemMetrics';
import '../../../style.css';
import { getYesterdayDateYYYMMDD } from '../../utils/datetimeUtil';

const SalesItemPage: React.FC = () => {
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDateYYYMMDD());

  const {
    salesItems,
    isLoading,
    refetch,
    totalSales,
    calculateWidth,
    formatCurrency,
    totalItems,
    averageSalesPerItem,
    topSellingItemName,
  } = useSalesItem(selectedDate);

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    modalRef.current?.dismiss();
  };

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    refetch().then(() => {
      event.detail.complete();
    });
  };

  return (
    <IonPage>
      <LaunchPadNavBar title='Sales by Item' />
      <IonContent>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid>
          <DateStepper selectedDate={selectedDate} onDateChange={setSelectedDate} />
          {isLoading && (
            <IonRow>
              <IonCol>
                {/* Metrics skeleton */}
                <SalesItemMetrics
                  loading={true}
                  totalSales={0}
                  totalItems={0}
                  averageSalesPerItem={0}
                  topSellingItem=''
                  formatCurrency={formatCurrency}
                />

                {/* Sales items list skeleton */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Sales by Item</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className='sales-item-list-loading'>
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className='sales-item-loading'>
                          <div className='sales-item-info-loading'>
                            <div className='sales-item-image-loading'></div>
                            <div className='sales-item-details-loading'>
                              <div className='title-loading'></div>
                              <div className='subtitle-loading'></div>
                            </div>
                            <div className='sales-item-amount-loading'></div>
                          </div>
                          <div className='sales-item-progress-loading'></div>
                        </div>
                      ))}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {!isLoading && salesItems.length === 0 && (
            <EmptyState title='📊 No Sales Data' subTitle='There were no sales recorded for the selected date.' />
          )}

          {!isLoading && salesItems.length > 0 && (
            <IonRow>
              <IonCol>
                <SalesItemMetrics
                  loading={false}
                  totalSales={totalSales}
                  totalItems={totalItems}
                  averageSalesPerItem={averageSalesPerItem}
                  topSellingItem={topSellingItemName}
                  formatCurrency={formatCurrency}
                />

                <IonCard>
                  <IonCardContent>
                    <SalesItemList items={salesItems} calculateWidth={calculateWidth} formatCurrency={formatCurrency} />
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

export default SalesItemPage;
