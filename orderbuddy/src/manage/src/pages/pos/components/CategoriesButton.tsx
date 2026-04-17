import React from 'react';
import { IonButton, IonIcon, IonChip, IonLabel, IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import { caretDown, chevronDown, chevronUp } from 'ionicons/icons';
import { getUserLang, t } from '../../../utils/localization';

interface Category {
  id: string;
  name: { en: string; es?: string; pt?: string };
  emoji?: string | null;
}

interface CategoriesButtonProps {
  categories: Category[];
  selectedCategory: string | null;
  onShowCategories: () => void;
  isOpen: boolean;
}

const CategoriesButton: React.FC<CategoriesButtonProps> = ({
  categories,
  selectedCategory,
  onShowCategories,
  isOpen,
}) => {
      const selectedCategoryData = categories.find((c) => c.id === selectedCategory);
  const currentLang = getUserLang();

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

export default CategoriesButton;
