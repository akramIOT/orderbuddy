import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
} from '@ionic/react';
import { usePos } from './usePos';
import { useIonActionSheet } from '@ionic/react';
import CategoriesButton from './components/CategoriesButton';
import { getUserLang, t } from '../../utils/localization';
import MenuItem from './components/MenuItem';
import '../../../style.css';
import MenuItemModal from './modal/MenuItemModal';
import { MenuItemType } from '../../types/menu';
import Cart from './components/Cart';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
const PosPage: React.FC = () => {
  // State for the selected menu
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType>();
  const currentLang = getUserLang();
  const { menusMap, menus, addOrderItem, orderItems, removeOrderItem, onCustomerDataChange, placeOrder, clearOrder } =
    usePos();
  const selectedMenu = selectedMenuId ? menusMap[selectedMenuId] : null;
  const categories = selectedMenu?.categories || [];
  const [presentActionSheet] = useIonActionSheet();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const showCategoriesActionSheet = async () => {
    if (!categories.length) return;
    setIsActionSheetOpen(true);
    await presentActionSheet({
      header: 'Select Category',
      buttons: [
        ...categories.map((category) => ({
          text: `${category.emoji ? category.emoji + ' ' : ''}${category.name.en}`,
          role: selectedCategoryId === category.id ? 'selected' : undefined,
          handler: () => handleCategorySelect(category.id),
        })),
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => setIsActionSheetOpen(false),
        },
      ],
      onDidDismiss: () => setIsActionSheetOpen(false),
      cssClass: 'custom-action-sheet',
    });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setSelectedMenuItem(undefined);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (menus?.length && !selectedMenuId) {
      setSelectedMenuId(menus[0]._id);
    }
  }, [menus, selectedMenuId]);

  useEffect(() => {
    if (categories?.length && selectedMenuId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedMenuId]);

  // Handle menu selection
  const handleMenuSelect = (event: CustomEvent) => {
    setSelectedMenuId(event.detail.value);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const ionContent = document.querySelector('ion-content');
      if (ionContent) {
        const headerHeight = 0;
        const elementTop = element.offsetTop - headerHeight;

        ionContent.scrollToPoint(0, elementTop, 500);
      }
    }
  };

  const handleItemClick = (item: MenuItemType) => {
    setSelectedMenuItem(item);
    setIsModalOpen(true);
  };
  return (
    <IonPage>
      <LaunchPadNavBar title='POS System' />
      <IonContent scrollY={false}>
        <IonGrid>
          <IonRow>
            <IonCol size='7'>
              <div style={{ width: '15%', marginBottom: '10px' }}>
                <IonSelect placeholder='Select Menu' value={selectedMenuId} onIonChange={handleMenuSelect}>
                  {menus &&
                    menus.map((menu) => (
                      <IonSelectOption key={menu._id} value={menu._id}>
                        {menu.name.en}
                      </IonSelectOption>
                    ))}
                </IonSelect>
              </div>

              {/* <CategoriesButton
                categories={categories}
                selectedCategory={selectedCategoryId}
                onShowCategories={showCategoriesActionSheet}
                isOpen={isActionSheetOpen}
              /> */}
              <div className='menu-items-grid' style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                {categories
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((category) => (
                    <div key={category.id} id={`category-${category.id}`} className='menu-category ion-padding-top'>
                      <div>
                        <IonText>
                          {category.emoji}
                          {t(category.name, currentLang)}
                        </IonText>{' '}
                      </div>
                      <sub>{t(category.description, currentLang)}</sub>

                      <div>
                        {selectedMenu && (
                          <IonGrid>
                            <IonRow>
                              {Object.values(selectedMenu.items)
                                .filter((item) => item.categoryId === category.id)
                                .map((item) => (
                                  <IonCol size='4' key={item.id}>
                                    <MenuItem item={item} onClick={handleItemClick} />
                                  </IonCol>
                                ))}
                            </IonRow>
                          </IonGrid>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </IonCol>

            <IonCol size='5' className='ion-padding-top'>
              <IonCard className='ion-padding ' style={{ height: '86vh' }}>
                <Cart
                  clearOrder={clearOrder}
                  orderItems={orderItems}
                  removeOrderItem={removeOrderItem}
                  onCustomerDataChange={onCustomerDataChange}
                  placeOrder={placeOrder}
                />
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <MenuItemModal
        selectedItem={selectedMenuItem}
        onClose={closeModal}
        isOpen={isModalOpen}
        addOrderItem={addOrderItem}
      />
    </IonPage>
  );
};

export default PosPage;
