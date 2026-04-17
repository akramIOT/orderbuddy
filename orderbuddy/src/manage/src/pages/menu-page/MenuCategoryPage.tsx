import {
  IonButton,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSpinner,
  IonText,
  ItemReorderEventDetail,
  useIonRouter,
} from '@ionic/react';
import { add, chevronForwardOutline, createOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSortOrder } from '../../queries/manage-menu/useSortOrder';
import { useManageMenu } from '../../queries/manage-menu/useManageMenu';
import { CategoryFormData, MenuCategoryModal } from './components/modals/MenuCategoryModel';
import { useMenu } from '../../queries/useMenu';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';

export const MenuCategoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { restaurantId, locationId, menuId } = useParams<{
    restaurantId: string;
    locationId: string;
    menuId: string;
  }>();
  const { mutateAsync: updateSortOrder } = useSortOrder();
  const [isReordering, setIsReordering] = useState(false);
  const { data: menu } = useMenu(restaurantId, locationId, menuId);
  const categories = menu?.categories || [];
  const { upsertCategory } = useManageMenu({
    restaurantId,
    locationId,
    menuId,
  });
  const router = useIonRouter();

  const handleEditClick = (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleUpsertCategory = async (data: CategoryFormData) => {
    await upsertCategory.mutateAsync(data);
  };
  const handleReorder = async (event: CustomEvent<ItemReorderEventDetail>) => {
    setIsReordering(true);
    const { from, to } = event.detail;
    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    const item = sortedCategories[from];
    sortedCategories.splice(from, 1);
    sortedCategories.splice(to, 0, item);

    const updates = sortedCategories.map((category, index) =>
      updateSortOrder({
        restaurantId,
        locationId,
        menuId,
        categoryId: category.id,
        sortOrder: index + 1,
      })
    );

    try {
      await Promise.all(updates);
      event.detail.complete();
    } catch (error) {
      console.error('Error updating sort order:', error);
      event.detail.complete(false);
    } finally {
      setIsReordering(false);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <IonPage>
      <LaunchPadNavBar title='Categories' />
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size='12'>
              <IonList>
                <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
                  {sortedCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/${restaurantId}/${locationId}/apps/menu/${menuId}/${category.id}/items`}
                      className='category-item-link'
                      onClick={(e) => isReordering && e.preventDefault()}
                    >
                      <IonItem disabled={isReordering}>
                        <IonText style={{ fontSize: '14px' }}>
                          {category.emoji} {category.name.en}
                        </IonText>
                        <IonReorder slot='start'></IonReorder>
                        {isReordering && <IonSpinner slot='end' name='dots' />}
                        {!isReordering && (
                          <>
                            <IonButton
                              fill='clear'
                              size='small'
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditClick(category, e);
                              }}
                              slot='end'
                            >
                              <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonIcon icon={chevronForwardOutline} slot='end' color='medium' />
                          </>
                        )}
                      </IonItem>
                    </Link>
                  ))}
                </IonReorderGroup>
              </IonList>
            </IonCol>
          </IonRow>

          <MenuCategoryModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSubmit={handleUpsertCategory}
          />
        </IonGrid>
        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={() => setIsModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
