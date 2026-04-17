import React, { use, useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonCheckbox,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { getUserLang, t } from '@/utils/localization';
import ObjectID from 'bson-objectid';
import { MenuItemType, Modifier, ModifierOption, SelectedModifier } from '../types/menu';
type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  notes?: string;
  variants: Array<{
    id: string;
    name: string;
    priceCents: number;
  }>;
  modifiers: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      priceCents: number;
    }>;
  }>;
  stationTags: string[];
};
export interface MenuItemModalProps {
  selectedItem: MenuItemType | null;
  isOpen: boolean;
  onClose: () => void;
}

import { useOrderStore } from '@/stores/orderStore';
import _ from 'lodash';
import './../../../../../style.css';
const initialOrderState: OrderItem = {
  id: '',
  menuItemId: '',
  name: '',
  price: 0,
  variants: [],
  modifiers: [],
  stationTags: [],
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({ selectedItem, onClose, isOpen }) => {
  if (!selectedItem) return null;
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(selectedItem?.variants?.[0]);
  const [notes, setNotes] = useState<string | undefined>('');
  const addOrderItem = useOrderStore((s) => s.addOrderItem);
  const isStoreOpen = useOrderStore((s) => s.location.isOpen);

  const currentLang = getUserLang();
  const calculateTotalPrice = (): number => {
    let totalCents = selectedItem.priceCents;

    if (selectedVariant) {
      totalCents = selectedVariant.priceCents;
    }

    if (selectedModifiers) {
      totalCents += _.sumBy(selectedModifiers, 'totalPrice');
    }

    return totalCents;
  };

  const [orderItem, setOrderItem] = useState<OrderItem>(initialOrderState);
  const handleIonChange = (e: CustomEvent) => {
    setNotes(e.detail.value);
  };
  useEffect(() => {
    setOrderItem({
      ...orderItem,
      notes: notes,
    });
  }, [notes]);

  useEffect(() => {
    if (selectedItem && isOpen) {
      setOrderItem({
        id: new ObjectID().toString(),
        menuItemId: selectedItem.id,
        name: t(selectedItem.name, currentLang),
        price: selectedItem.priceCents,
        variants: [],
        modifiers: [],
        notes: notes,
        stationTags: selectedItem.stationTags || [],
      });

      setSelectedModifiers([]);
      if (selectedItem.variants && selectedItem.variants.length > 0) {
        const defaultVariant = selectedItem.variants.find((v) => v.default);
        setSelectedVariant(defaultVariant || selectedItem.variants[0]);
      }
    }
  }, [selectedItem, isOpen]);
  useEffect(() => {
    if (orderItem.id) {
      setOrderItem((prev) => ({
        ...prev,
        price: calculateTotalPrice(),
        variants: selectedVariant
          ? [
              {
                id: selectedVariant.id,
                name: selectedVariant.name,
                priceCents: selectedVariant.priceCents,
              },
            ]
          : [],
        modifiers: selectedModifiers
          .map((mod) => {
            const modifier = selectedItem?.modifiers?.find((m) => m.id === mod.modifierId);
            if (!modifier) return null;
            return {
              id: modifier.id,
              name: t(modifier.name || { en: '' }, currentLang),
              options: mod.selectedOptions.map((optionId) => {
                const option = modifier.options.find((o) => o.id === optionId);
                return {
                  id: optionId,
                  name: t(option?.name || { en: '' }, currentLang),
                  priceCents: option?.priceCents || 0,
                };
              }),
            };
          })
          .filter(Boolean) as OrderItem['modifiers'],
      }));
    }
  }, [selectedVariant, selectedModifiers]);
  useEffect(() => {
    if (selectedItem && isOpen) {
      if (selectedItem.variants && selectedItem.variants.length > 0) {
        const defaultVariant = selectedItem.variants.find((v) => v.default);
        setSelectedVariant(defaultVariant || selectedItem.variants[0]);
      }
    }
  }, [selectedItem, isOpen]);

  if (!selectedItem) return null;

  const calculateModifierPrice = (modifier: Modifier, selectedOptions: string[], options: ModifierOption[]): number => {
    const freeCount = modifier.freeChoices;

    return _.reduce(
      selectedOptions,
      (total, optionId, index) => {
        const option = _.find(options, { id: optionId });
        if (!option) return total;

        let price = option.priceCents;
        if (freeCount > 0 && index >= freeCount) {
          price += modifier.extraChoicePriceCents;
        }
        return total + price;
      },
      0,
    );
  };

  const handleModifierChange = (modifier: Modifier, optionId: string, isChecked: boolean) => {
    setSelectedModifiers((prev) => {
      const existing = prev.find((m) => m.modifierId === modifier.id);

      if (!existing) {
        if (!isChecked) return prev;
        const newOptions = [optionId];
        return [
          ...prev,
          {
            modifierId: modifier.id,
            selectedOptions: newOptions,
            totalPrice: calculateModifierPrice(modifier, newOptions, modifier.options),
          },
        ];
      }

      let updatedOptions = isChecked
        ? [...existing.selectedOptions, optionId]
        : existing.selectedOptions.filter((id) => id !== optionId);

      if (updatedOptions.length > modifier.maxChoices) {
        updatedOptions = updatedOptions.slice(-modifier.maxChoices);
      }

      const updatedModifiers = prev.filter((m) => m.modifierId !== modifier.id);
      if (updatedOptions.length === 0) return updatedModifiers;

      return [
        ...updatedModifiers,
        {
          modifierId: modifier.id,
          selectedOptions: updatedOptions,
          totalPrice: calculateModifierPrice(modifier, updatedOptions, modifier.options),
        },
      ];
    });
  };

  const handleAddToCart = () => {
    addOrderItem(orderItem);
    setSelectedVariant(undefined);
    setSelectedModifiers([]);
    onClose();
  };

  useEffect(() => {
    const handleHardwareBackButton = (ev: any) => {
      ev.detail.register(-1, () => {
        onClose();
      });
    };

    document.addEventListener('ionBackButton', handleHardwareBackButton as EventListener);

    return () => {
      document.removeEventListener('ionBackButton', handleHardwareBackButton as EventListener);
    };
  }, [onClose]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        setOrderItem(initialOrderState);
        setSelectedModifiers([]);
        onClose();
      }}
    >
      <IonHeader className='ion-no-border'>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className='ion-padding'>
        <div className='menu-item-modal-content'>
          <div className='item-image-container'>
            <img
              alt={t(selectedItem.name, currentLang)}
              src={
                selectedItem.imageUrls?.[0] ||
                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/No_image_3x4.svg/640px-No_image_3x4.svg.png'
              }
              className='item-image'
            />
          </div>

          <div className='item-details'>
            <IonText>{t(selectedItem.name, currentLang)}</IonText>
            <p>
              <sub>
                {' '}
                <IonText>{t(selectedItem.description, currentLang)}</IonText>
              </sub>
            </p>
          </div>

          {selectedItem.variants && selectedItem.variants.length > 0 && (
            <div className='variants-section'>
              <IonSegment
                value={selectedVariant?.id || selectedItem.variants.find((v) => v.default)?.id}
                onIonChange={(e) => {
                  const variant = selectedItem.variants?.find((v) => v.id === e.detail.value);
                  setSelectedVariant(variant);
                }}
              >
                {selectedItem.variants.map((variant) => (
                  <IonSegmentButton key={variant.id} value={variant.id}>
                    <IonLabel>
                      {variant.name}
                      <div>${(variant.priceCents / 100).toFixed(2)}</div>
                    </IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>
            </div>
          )}

          {selectedItem.modifiers && selectedItem.modifiers.length > 0 && (
            <div className='modifiers-section'>
              {selectedItem.modifiers.map((modifier) => {
                const selected = selectedModifiers.find((m) => m.modifierId === modifier.id);
                const selectedCount = selected?.selectedOptions.length ?? 0;
                const remainingChoices = modifier.maxChoices - selectedCount;

                return (
                  <div key={modifier.id} className='modifier-group'>
                    <div className='modifier-header'>
                      <strong>{t(modifier.name, currentLang)}</strong>
                      <span className='modifier-info'>
                        {modifier.freeChoices > 0 && `First ${modifier.freeChoices} free • `}
                        {remainingChoices > 0 ? `Choose up to ${remainingChoices} more` : 'Max selections reached'}
                      </span>
                    </div>

                    {modifier.options.map((option) => {
                      const isSelected = selected?.selectedOptions.includes(option.id);
                      const isDisabled = !isSelected && selectedCount >= modifier.maxChoices;

                      return (
                        <IonItem key={option.id} lines='none'>
                          <IonCheckbox
                            slot='start'
                            value={option.id}
                            checked={isSelected}
                            disabled={isDisabled}
                            labelPlacement='end'
                            onIonChange={(e) => handleModifierChange(modifier, option.id, e.detail.checked)}
                          >
                            <div className='option-row'>
                              <span>{t(option.name, currentLang)}</span>
                              <span className='option-price'>
                                {option.priceCents > 0 && `$${(option.priceCents / 100).toFixed(2)}`}
                                {isSelected &&
                                  modifier.freeChoices > 0 &&
                                  (selected?.selectedOptions ?? []).indexOf(option.id) >= modifier.freeChoices &&
                                  ` + $${(modifier.extraChoicePriceCents / 100).toFixed(2)}`}
                              </span>
                            </div>
                          </IonCheckbox>
                        </IonItem>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
          <IonTextarea
            class='ion-no-padding ion-padding-top'
            maxlength={100}
            placeholder='Add Special Instructions'
            onIonInput={handleIonChange}
            color={'dark'}
            counter={true}
            rows={2}
            style={{ fontSize: '14px' }}
          />
        </div>
      </IonContent>

      <IonFooter>
        <IonGrid>
          <IonRow>
            <IonCol size='8'>
              {isStoreOpen && (
                <IonButton expand='block' onClick={handleAddToCart} className='solid-button'>
                  Add to cart
                </IonButton>
              )}
            </IonCol>
            <IonCol size='4' className='ion-text-end ion-align-self-center'>
              <div className='font-size-14'>${(calculateTotalPrice() / 100).toFixed(2)}</div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonFooter>
    </IonModal>
  );
};

export default MenuItemModal;
