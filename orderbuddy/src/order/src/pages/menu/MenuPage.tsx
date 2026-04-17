import React, { use, useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonToolbar,
  useIonActionSheet,
} from '@ionic/react';
import { useParams } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { chevronForward } from 'ionicons/icons';
import { getUserLang, t } from '@/utils/localization';
import { useMenu } from '@/queries/useMenu';
import { useRestaurant, useLocation, useOrigin, useCampaign } from '@/shared/useEntryInfo';
import Banner from './components/banner/Banner';
import StoreClosedBanner from './components/banner/StoreClosedBanner';
import MenuItemModal from './components/menuItemModal/MenuItemModal';
import MenuItem from './MenuItem';
import { useOrderStore } from '@/stores/orderStore';
import { Paths } from '@/routes/paths';
import { CategoriesButton } from './components/categories/categories';
import '../../../style.css';
type MenuParams = {
  restaurantId: string;
  locationId: string;
  menuId: string;
  locationSlug: string;
  menuSlug: string;
};

type LocalizedString = {
  en: string;
  es?: string;
  pt?: string;
};

type Variant = {
  id: string;
  name: string;
  priceCents: number;
  default?: boolean;
};

type ModifierOption = {
  id: string;
  name: LocalizedString;
  priceCents: number;
};

type Modifier = {
  id: string;
  name: LocalizedString;
  type: 'standard' | 'upsell';
  required: boolean;
  selectionMode: 'single' | 'max' | 'multiple';
  maxChoices: number;
  freeChoices: number;
  extraChoicePriceCents: number;
  options: ModifierOption[];
};
interface MenuItemStructure {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrls?: string[] | null;
  categoryId: string;
  priceCents: number;
  makingCostCents: number;
  isAvailable?: boolean | null;
  stationTags?: string[] | null;
  variants?: Variant[] | null;
  modifiers?: Modifier[] | null;
}

const MenuPage: React.FC = () => {
  const { restaurantId, locationId, menuId, locationSlug, menuSlug } = useParams<MenuParams>();
  const [presentActionSheet] = useIonActionSheet();
  const isStoreOpen = useOrderStore((s) => s.location.isOpen);

  const searchParams = new URLSearchParams(window.location.search);
  let originId = searchParams.get('originId');
  if (!originId) {
    originId = 'web';
  }

  const setRestaurant = useOrderStore((s) => s.setRestaurant);
  const cartItems = useOrderStore((s) => s.cart.items);

  // Fetch origin data
  const { data: origin } = useOrigin(originId);

  // Fetch restaurant data using the restaurantId from params or from origin
  const { data: restaurant } = useRestaurant(restaurantId);

  // Fetch location data using the restaurantId and locationId from params or from origin
  const { data: location } = useLocation(restaurantId, locationId);
  const { data: campaign } = useCampaign(restaurantId, locationId, originId, {
    enabled: origin?.type === 'campaign',
  });

  useEffect(() => {
    if (campaign) {
      setCampaign({
        name: campaign.name,
        type: campaign.type,
        reward: {
          flatOffCents: campaign.reward.flatOffCents,
        },
      });
    }
  }, [origin, campaign]);

  // Fetch menu data for the specific menu ID
  const { data: menuData, isLoading, isError: isMenuError } = useMenu(restaurantId, locationId, menuId);
  const currentLang = getUserLang();

  const [selectedItem, setSelectedItem] = useState<MenuItemStructure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const validateSession = useOrderStore((s) => s.validateSession);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const setCampaign = useOrderStore((s) => s.setCampaign);
  // useEffect(() => {
  //   const isValid = validateSession();
  //   if (!isValid) {
  //     console.warn('Session is invalid, resetting state');
  //     const newUrl = new URL(window.location.href);
  //     newUrl.searchParams.set('originId', 'web');
  //     window.history.replaceState({}, '', newUrl.toString());
  //   }
  // }, [validateSession]);

 

  useEffect(() => {
    if (restaurant && location && origin && menuData) {
      const transformedData = {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          logo: restaurant.logo,
        },
        location: {
          _id: location._id,
          name: location.name,
          acceptPayment: location.acceptPayment,
          emergepayWalletsPublicId: location.emergepayWalletsPublicId,
          isOpen: location.isOpen,
          salesTax: menuData.salesTax, 
        },
        origin: {
          _id: origin._id,
          name: origin.label,
        },
      };

      setRestaurant(transformedData);
    }
  }, [restaurant, location, origin, setRestaurant, menuData]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!menuData?.categories) return;
    const headerHeight = document.querySelector('ion-header')?.clientHeight || 0;

    const options = {
      root: document.querySelector('ion-content'),
      rootMargin: `-${headerHeight}px 0px -70% 0px`,
      threshold: [0.1, 0.5, 0.8],
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id.replace('category-', '');
          setSelectedCategory(categoryId);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    menuData.categories.forEach((category) => {
      const element = document.getElementById(`category-${category.id}`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [menuData?.categories]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const ionContent = document.querySelector('ion-content');
      if (ionContent) {
        const headerHeight = 10;
        const elementTop = element.offsetTop - headerHeight;
        ionContent.scrollToPoint(0, elementTop, 500);
      }
    }
  };

  const handleItemClick = (item: MenuItemStructure) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  const showCategoriesActionSheet = async () => {
    if (!menuData) return;
    setIsActionSheetOpen(true);

    const sortedCategories = [...menuData.categories].sort((a, b) => a.sortOrder - b.sortOrder);

    await presentActionSheet({
      header: 'Select Category',
      buttons: [
        ...sortedCategories.map((category) => ({
          text: `${category.emoji} ${t(category.name, currentLang)}`,
          role: selectedCategory === category.id ? 'selected' : undefined,
          handler: () => {
            handleCategorySelect(category.id);
          },
        })),
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            setIsActionSheetOpen(false);
          },
        },
      ],
      onDidDismiss: () => setIsActionSheetOpen(false),

      cssClass: 'custom-action-sheet',
    });
  };
  return (
    <IonPage>
      <IonHeader>
        <IonGrid class='navbar-color'>
          {restaurant && location && origin && (
            <Banner
              restaurantName={restaurant.name}
              restaurantLogo={restaurant.logo}
              origin={origin.label}
              restaurantId={restaurant._id}
              locationName={location.name}
            />
          )}
        </IonGrid>

        <CategoriesButton
          categories={menuData?.categories || []}
          selectedCategory={selectedCategory}
          onShowCategories={showCategoriesActionSheet}
          isOpen={isActionSheetOpen}
        />
      </IonHeader>

      <IonContent class='hidescrollall'>
        <div className='ion-padding'>
          {menuData?.categories
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
                  {menuData.items
                    .filter((item) => item.categoryId === category.id)
                    .map((item) => (
                      <MenuItem key={item.id} item={item} onClick={handleItemClick} />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </IonContent>

      <MenuItemModal selectedItem={selectedItem} onClose={closeModal} isOpen={isModalOpen} />

      {isStoreOpen && cartItems && cartItems.length > 0 && (
        <IonFooter className='ion-no-border'>
          <IonToolbar>
            {cartItems?.length > 0 && (
              <Link
                to={Paths.cart(restaurantId, locationSlug, locationId, menuSlug, menuId, originId)}
                style={{ textDecoration: 'none' }}
              >
                <IonButton
                  expand='block'
                  className=' ion-no-padding  solid-button'
                  style={{ paddingLeft: '10px', paddingRight: '10px' }}
                >
                  <IonGrid className='ion-padding-start ion-padding-end'>
                    <IonRow class='ion-align-items-center'>
                      <IonCol size='10' className='ion-text-start' style={{ textTransform: 'capitalize' }}>
                        <IonText style={{ color: '#ffff' }}>
                          {cartItems.length} item(<IonText style={{ color: '#ffff', fontSize: '11px' }}>s</IonText>)
                          added
                        </IonText>
                      </IonCol>
                      <IonCol size='2' className='ion-align-items-center ion-text-center'>
                        <IonText
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textTransform: 'capitalize',
                            color: '#ffff',
                          }}
                        >
                          Cart
                          <IonIcon
                            icon={chevronForward}
                            style={{
                              color: '#ffff',
                            }}
                          />
                        </IonText>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonButton>
              </Link>
            )}
          </IonToolbar>
        </IonFooter>
      )}

      {!isStoreOpen && (
        <IonFooter className='ion-no-border'>
          <StoreClosedBanner />
        </IonFooter>
      )}
    </IonPage>
  );
};

export default MenuPage;
