import React from 'react';
import { IonCol, IonGrid, IonIcon, IonRow, IonText } from '@ionic/react';
import { getUserLang, t } from '@/utils/localization';
import '../../../../../style.css';
import { chevronDown, chevronUp } from 'ionicons/icons';

interface Category {
  id: string;
  name: {
    en: string;
    es: string;
    pt: string;
  };
  description: {
    en: string;
    es: string;
    pt: string;
  };
  emoji?: string;
}

interface CategoriesButtonProps {
  categories: Category[];
  selectedCategory?: string;
  onShowCategories: () => void;
  isOpen: boolean;
}

export const CategoriesButton: React.FC<CategoriesButtonProps> = ({
  categories,
  selectedCategory,
  onShowCategories,
  isOpen,
}) => {
  const currentLang = getUserLang();
  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <IonGrid className='ion-no-padding ion-text-center '>
      <IonRow className='ion-no-padding ion-text-center ion-padding-bottom  ' onClick={onShowCategories}>
        <IonCol>
          <IonText className='categories-button '>
            {selectedCategoryData ? (
              <>
                {selectedCategoryData.emoji}
                {t(selectedCategoryData.name, currentLang)}
              </>
            ) : (
              'Select Category'
            )}
          </IonText>
          <IonIcon
            className=''
            icon={isOpen ? chevronUp : chevronDown}
            style={{
              fontSize: '14px',
            }}
          />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
