import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonToggle,
  useIonRouter,
} from '@ionic/react';
import { add, addOutline, createOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useMenu } from '../../queries/useMenu';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import { useAvailableMenu } from '../../queries/manage-menu/useAvailableMenu';
import { useState } from 'react';
import '../../../style.css';

//todo menu items api and ui
export const MenuItemsPage: React.FC = () => {
  const { restaurantId, locationId, menuId, categoryId } = useParams<{
    restaurantId: string;
    locationId: string;
    menuId: string;
    categoryId: string;
  }>();
  const { data: menu } = useMenu(restaurantId, locationId, menuId);

  const filteredItems = menu?.items.filter((item) => item.categoryId === categoryId);
  const router = useIonRouter();
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});

  const handleEditClick = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${restaurantId}/${locationId}/apps/menu/${menuId}/${categoryId}/items/${item.id}`);
  };

  const handleAddClick = () => {
    router.push(`/${restaurantId}/${locationId}/apps/menu/${menuId}/${categoryId}/items/new`);
  };
  const { mutate: updateAvailability } = useAvailableMenu();

  const handleAvailabilityToggle = (item: any, isAvailable: boolean) => {
    item.isAvailable = !isAvailable;
    setLoadingItems((prev) => ({ ...prev, [item.id]: true }));

    updateAvailability(
      {
        restaurantId,
        locationId,
        menuId,
        itemId: item.id,
        isAvailable,
      },
      {
        onSettled: () => {
          setLoadingItems((prev) => ({ ...prev, [item.id]: false }));
        },
      }
    );
  };
  return (
    <IonPage>
      <LaunchPadNavBar title='Menu Items' />
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size='12'>
              {filteredItems?.map((item) => (
                <IonCard key={item.id} className='menu-item-card'>
                  <IonGrid className='ion-no-padding'>
                    <IonRow className='ion-align-items-center '>
                      <IonCol size='1'>
                        <img
                          src={item.imageUrls?.[0] ?? ''}
                          alt={item.name.en}
                          className={`menu-item-image ${!item.isAvailable ? 'greyed-out' : ''}`}
                        />{' '}
                      </IonCol>
                      <IonCol size='9' className='ion-padding'>
                        <IonText>
                          <IonText className='ion-no-margin '>{item.name.en}</IonText>
                          <p className='ion-no-margin '>{item.description.en}</p>${(item.priceCents / 100).toFixed(2)}
                        </IonText>
                      </IonCol>
                      <IonCol size='2'>
                        <IonGrid>
                          <IonRow className=' ion-align-items-center'>
                            <IonCol className='ion-text-center'>
                              {loadingItems[item.id] ? (
                                <IonSpinner name='circles' />
                              ) : (
                                <IonToggle
                                  enableOnOffLabels={true}
                                  checked={item.isAvailable || false}
                                  onIonChange={(e) => handleAvailabilityToggle(item, e.detail.checked)}
                                  disabled={loadingItems[item.id]}
                                />
                              )}
                            </IonCol>
                            <IonCol>
                              <IonButton
                                fill='clear'
                                size='small'
                                onClick={(e) => handleEditClick(item, e)}
                                className='ion-float-right'
                              >
                                <IonIcon icon={createOutline} />
                              </IonButton>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCard>
              ))}
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={handleAddClick}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
