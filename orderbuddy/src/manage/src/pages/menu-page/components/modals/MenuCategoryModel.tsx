import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonButtons,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import EmojiPicker, { Categories } from 'emoji-picker-react';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.object({
    en: z.string().min(1, 'Name is required'),
    es: z.string().optional(),
    pt: z.string().optional(),
  }),
  description: z.object({
    en: z.string().min(1, 'Description is required'),
    es: z.string().optional(),
    pt: z.string().optional(),
  }),
  emoji: z.string().min(1, 'Emoji is required'),
  sortOrder: z.number(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface MenuCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export const MenuCategoryModal: React.FC<MenuCategoryModalProps> = ({ isOpen, onClose, category, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category?.id || '',
      name: {
        en: category?.name?.en || '',
        es: category?.name?.es || '',
        pt: category?.name?.pt || '',
      },
      description: {
        en: category?.description?.en || '',
        es: category?.description?.es || '',
        pt: category?.description?.pt || '',
      },
      emoji: category?.emoji || '',
      sortOrder: category?.sortOrder || 0,
    },
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  useEffect(() => {
    if (category) {
      reset({
        id: category.id,
        name: {
          en: category.name.en,
          es: category.name.es || '',
          pt: category.name.pt || '',
        },
        description: {
          en: category.description.en,
          es: category.description.es || '',
          pt: category.description.pt || '',
        },
        emoji: category.emoji,
        sortOrder: category.sortOrder,
      });
    } else {
      reset({
        id: '',
        name: {
          en: '',
          es: '',
          pt: '',
        },
        description: {
          en: '',
          es: '',
          pt: '',
        },
        emoji: '',
        sortOrder: 0,
      });
    }
  }, [category, reset]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{category ? 'Edit Category' : 'Add Category'}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='ion-padding'>
          <EmojiPicker
            categories={[{ category: Categories.FOOD_DRINK, name: 'Food & Drink' }]}
            onEmojiClick={(emojiObject) => {
              setValue('emoji', emojiObject.emoji);
            }}
          />
          <IonItem lines='none'>
            <IonInput
              label='Emoji'
              labelPlacement='stacked'
              placeholder='Enter emoji'
              {...register('emoji')}
              readonly
            />
          </IonItem>
          <IonItem lines='none'>{errors.emoji && <IonText color='danger'>{errors.emoji.message}</IonText>}</IonItem>
          <IonItem lines='none'>
            <IonInput
              label='Name '
              labelPlacement='stacked'
              placeholder='Enter Category name '
              {...register('name.en')}
            />
          </IonItem>
          <IonItem lines='none'>
            {errors.name?.en && <IonText color='danger'>{errors.name.en.message}</IonText>}
          </IonItem>
          <IonItem lines='none'>
            <IonInput
              label='Description '
              labelPlacement='stacked'
              placeholder='Enter Category description '
              {...register('description.en')}
            />
          </IonItem>
          <IonItem lines='none'>
            {errors.description?.en && <IonText color='danger'>{errors.description.en.message}</IonText>}
          </IonItem>

          <IonGrid>
            <IonRow>
              <IonCol size='12' className='ion-text-center'>
                <IonButton type='submit' fill='solid' className='solid-button'>
                  {category ? 'Update Category' : 'Create Category'}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </form>
      </IonContent>
    </IonModal>
  );
};
