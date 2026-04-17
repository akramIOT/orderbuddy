import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonText } from '@ionic/react';
import React from 'react';
import { getUserLang, t } from '@/utils/localization';
import { MenuItemType } from './components/types/menu';

export interface MenuItemProps {
  item: MenuItemType;
  onClick?: (item: MenuItemType) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => {
  const currentLang = getUserLang();
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div>
      <IonCard onClick={handleClick}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            overflow: 'hidden',
          }}
        >
          <img
            alt={t(item.name, currentLang)}
            src={
              item?.imageUrls
                ? item?.imageUrls[0]
                : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/No_image_3x4.svg/640px-No_image_3x4.svg.png'
            }
            style={{ objectFit: 'cover' }}
          />
        </div>
        <IonCardHeader>
          <IonCardTitle>
            <IonText className='font-size-14'> {t(item.name, currentLang)}</IonText>
          </IonCardTitle>
          <IonCardSubtitle className='font-size-14'>${(item?.priceCents / 100).toFixed(2)}</IonCardSubtitle>
        </IonCardHeader>
      </IonCard>
    </div>
  );
};

export default MenuItem;
