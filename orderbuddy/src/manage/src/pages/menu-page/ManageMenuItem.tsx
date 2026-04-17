import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonText,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useIonRouter } from '@ionic/react';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import {
  menuItemSchemaPriceInCents,
  menuItemSchemaPriceInCentsType,
  modifierSchema,
  useManageMenu,
} from '../../queries/manage-menu/useManageMenu';
import { useParams } from 'react-router';
import { useMenu } from '../../queries/useMenu';
import { useStations } from '../../queries/useStations';
import { azureConfig, useStorage } from '../../queries/manage-menu/useStorage';
import { logExceptionError } from '../../utils/errorLogger';

interface Variant {
  id?: string;
  name: string;
  priceCents: number;
  default?: boolean;
}

export const ManageMenuItem: React.FC = () => {
  const { restaurantId, locationId, menuId, categoryId, itemId } = useParams<{
    restaurantId: string;
    locationId: string;
    menuId: string;
    categoryId: string;
    itemId?: string;
  }>();

  const router = useIonRouter();
  const isEdit = !!itemId && itemId !== 'new';

  // Fetch menu data for categories and item details
  const { data: menu } = useMenu(restaurantId, locationId, menuId);
  const { data: stations } = useStations(restaurantId, locationId);
  const selectedItem = useMemo(() => {
    if (!isEdit || !menu?.items) return null;
    return menu.items.find((item) => item.id === itemId);
  }, [isEdit, itemId, menu]);
  const [variants, setVariants] = useState<Variant[]>(selectedItem?.variants || []);
  const [modifiers, setModifiers] = useState<modifierSchema[]>(
    selectedItem?.modifiers?.map((m) => ({
      ...m,
      name: {
        en: m.name.en || '',
        es: m.name.es || '',
        pt: m.name.pt || '',
      },
      options: m.options || [],
    })) || [],
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>(selectedItem?.imageUrls || []);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { uploadImage } = useStorage();
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        priceCents: 0,
        default: variants.length === 0,
      },
    ]);
  };
  useEffect(() => {
    if (selectedItem?.imageUrls) {
      setImageUrls(selectedItem.imageUrls);
    }
  }, [selectedItem]);
  const handleRemoveVariant = (index: number) => {
    const variantToRemove = variants[index];

    if (variantToRemove.default && variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      newVariants[0].default = true;
      setVariants(newVariants);
      setValue('variants', newVariants);
      setValue('priceCents', newVariants[0].priceCents / 100);
    } else {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleRemoveModifier = (index: number) => {
    const newModifiers = modifiers.filter((_, i) => i !== index);
    setModifiers(newModifiers);
    setValue('modifiers', newModifiers);
  };
  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];

    if (field === 'default') {
      if (value === false && newVariants[index].default && !newVariants.some((v, i) => i !== index && v.default)) {
        return;
      }

      if (value === true) {
        newVariants.forEach((variant, i) => {
          if (i !== index) {
            variant.default = false;
          }
        });
        setValue('priceCents', newVariants[index].priceCents / 100);
      }
    }

    const processedValue = field === 'priceCents' ? Math.round(Number(value) * 100) : value;
    newVariants[index] = {
      ...newVariants[index],
      [field]: processedValue,
    };

    setValue('variants', newVariants);
    setVariants(newVariants);
  };
  const handleAddModifier = () => {
    const newModifier: modifierSchema = {
      name: {
        en: '',
        es: '',
        pt: '',
      },
      type: 'standard' as const,
      required: false,
      selectionMode: 'max' as const,
      maxChoices: 1,
      freeChoices: 0,
      extraChoicePriceCents: 0,
      options: [],
      id: '',
    };

    const newModifiers = [...modifiers, newModifier];
    setModifiers(newModifiers);

    setValue('modifiers', newModifiers);

    if (errors.modifiers) {
      clearErrors('modifiers');
    }
  };
  const handleModifierChange = (index: number, field: keyof modifierSchema, value: any) => {
    const newModifiers = [...modifiers];

    if (field === 'name') {
      newModifiers[index] = {
        ...newModifiers[index],
        name: {
          en: value.en || '',
          es: value.es || '',
          pt: value.pt || '',
        },
      };
    } else if (field === 'freeChoices') {
      if (value > 0 && (newModifiers[index].freeChoices === 0 || !newModifiers[index].freeChoices)) {
        newModifiers[index] = {
          ...newModifiers[index],
          [field]: value,
          extraChoicePriceCents: newModifiers[index].extraChoicePriceCents || 100,

          options: (newModifiers[index].options || []).map((option) => ({
            ...option,
            priceCents: 0,
          })),
        };
      } else if (value === 0) {
        newModifiers[index] = {
          ...newModifiers[index],
          [field]: value,
          extraChoicePriceCents: 0,
        };
      } else {
        newModifiers[index] = {
          ...newModifiers[index],
          [field]: value,
        };
      }
    } else {
      newModifiers[index] = {
        ...newModifiers[index],
        [field]: value,
      };
    }

    setModifiers(newModifiers);
    setValue(`modifiers.${index}`, newModifiers[index]);
  };
  const handleAddOption = (modifierIndex: number) => {
    const newModifiers = [...modifiers];
    if (!newModifiers[modifierIndex].options) {
      newModifiers[modifierIndex].options = [];
    }

    newModifiers[modifierIndex].options.push({
      name: {
        en: '',
        es: '',
        pt: '',
      },
      priceCents: 0,
    });

    setModifiers(newModifiers);
    setValue(`modifiers.${modifierIndex}`, newModifiers[modifierIndex]);
  };
  const handleOptionChange = (modifierIndex: number, optionIndex: number, field: string, value: any) => {
    const newModifiers = [...modifiers];
    const options = newModifiers[modifierIndex].options || [];

    if (field === 'name') {
      options[optionIndex] = {
        ...options[optionIndex],
        name: {
          ...options[optionIndex].name,
          en: value,
        },
      };
    } else if (field === 'priceCents') {
      if (newModifiers[modifierIndex].freeChoices! > 0) {
        options[optionIndex] = {
          ...options[optionIndex],
          priceCents: 0,
        };
      } else {
        const price = Math.round(Number(value) * 100);
        options[optionIndex] = {
          ...options[optionIndex],
          priceCents: price,
        };

        if (price === 0) {
          setError(`modifiers.${modifierIndex}.options.${optionIndex}.priceCents`, {
            type: 'manual',
            message: 'Price must be greater than zero when free choices is zero',
          });
        } else {
          clearErrors(`modifiers.${modifierIndex}.options.${optionIndex}.priceCents`);
        }
      }
    }

    newModifiers[modifierIndex].options = options;
    setModifiers(newModifiers);
    setValue(`modifiers.${modifierIndex}`, newModifiers[modifierIndex]);
  };

  const handleRemoveOption = (modifierIndex: number, optionIndex: number) => {
    const newModifiers = [...modifiers];
    newModifiers[modifierIndex].options =
      newModifiers[modifierIndex].options?.filter((_, i) => i !== optionIndex) || [];
    setModifiers(newModifiers);
    setValue(`modifiers.${modifierIndex}`, newModifiers[modifierIndex]);
  };
  useEffect(() => {
    if (selectedItem?.modifiers) {
      const transformedModifiers = selectedItem.modifiers.map((modifier) => ({
        ...modifier,
        name: {
          en: modifier.name.en,
          es: modifier.name.es || '',
          pt: modifier.name.pt || '',
        },
        type: modifier.type || 'standard',
        required: modifier.required || false,
        selectionMode: modifier.selectionMode || 'max',
        maxChoices: modifier.maxChoices || 1,
        freeChoices: modifier.freeChoices || 0,
        extraChoicePriceCents: modifier.extraChoicePriceCents || 0,
        id: modifier.id || '',
        options: modifier.options || [],
      }));
      setModifiers(transformedModifiers);
    }
  }, [selectedItem]);

  const { upsertMenuItem } = useManageMenu({
    restaurantId,
    locationId,
    menuId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<menuItemSchemaPriceInCentsType>({
    resolver: zodResolver(menuItemSchemaPriceInCents),
    defaultValues: {
      id: selectedItem?.id || '',
      name: {
        en: selectedItem?.name?.en || '',
        es: selectedItem?.name?.es || '',
        pt: selectedItem?.name?.pt || '',
      },
      description: {
        en: selectedItem?.description?.en || '',
        es: selectedItem?.description?.es || '',
        pt: selectedItem?.description?.pt || '',
      },
      isAvailable: selectedItem?.isAvailable || true,
      categoryId: selectedItem?.categoryId || categoryId,
      priceCents: selectedItem?.priceCents ? selectedItem.priceCents / 100 : 0,
      stationTags: selectedItem?.stationTags || [],
      variants: selectedItem?.variants || [],
      imageUrls: selectedItem?.imageUrls || [],
      modifiers:
        selectedItem?.modifiers?.map((m) => ({
          ...m,
          name: {
            en: m.name.en,
            es: m.name.es || '',
            pt: m.name.pt || '',
          },
          type: m.type || 'standard',
          required: m.required || false,
          selectionMode: m.selectionMode || 'max',
          maxChoices: m.maxChoices || 1,
          freeChoices: m.freeChoices || 0,
          extraChoicePriceCents: m.extraChoicePriceCents || 0,
          options: m.options || [],
        })) || [],
    },
  });

  const selectedTags = watch('stationTags') || [];

  const handleTagToggle = (tag: string) => {
    const currentTags = selectedTags;
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    setValue('stationTags', newTags);
  };
  useEffect(() => {
    if (menu && itemId) {
      const item = menu.items.find((item) => item.id === itemId);
      if (item) {
        reset({
          id: item.id,
          name: {
            en: item.name.en ?? undefined,
            es: item.name.es ?? undefined,
            pt: item.name.pt ?? undefined,
          },
          description: {
            en: item.description.en ?? undefined,
            es: item.description.es ?? undefined,
            pt: item.description.pt ?? undefined,
          },
          imageUrls: item.imageUrls || [],
          categoryId: item.categoryId,
          priceCents: item.priceCents / 100,
          stationTags: item.stationTags || [],
          variants: item.variants || [],
        });
        setVariants(item.variants || []);
      }
    }
  }, [menu, itemId, reset]);

  const handleFormSubmit = async (data: menuItemSchemaPriceInCentsType) => {
    // Check for empty modifier names
    const invalidModifiers = modifiers.filter((modifier) => !modifier.name.en.trim());
    if (invalidModifiers.length > 0) {
      invalidModifiers.forEach((_, index) => {
        setError(`modifiers.${index}.name.en`, {
          type: 'manual',
          message: 'Modifier name is required',
        });
      });
      return;
    }
    // Check for modifiers with freeChoices > 0 but no extraChoicePriceCents
    const invalidExtraPriceModifiers = modifiers.filter(
      (modifier) =>
        modifier.freeChoices! > 0 && (!modifier.extraChoicePriceCents || modifier.extraChoicePriceCents === 0),
    );
    if (invalidExtraPriceModifiers.length > 0) {
      invalidExtraPriceModifiers.forEach((_, index) => {
        setError(`modifiers.${index}.extraChoicePriceCents`, {
          type: 'manual',
          message: 'Extra choice price is required when free choices is set',
        });
      });
      return;
    }

    // Check for options with zero price when free choices is zero
    let hasInvalidOptionPrices = false;
    modifiers.forEach((modifier, modifierIndex) => {
      if (modifier.freeChoices === 0) {
        (modifier.options || []).forEach((option, optionIndex) => {
          if (!option.priceCents || option.priceCents === 0) {
            setError(`modifiers.${modifierIndex}.options.${optionIndex}.priceCents`, {
              type: 'manual',
              message: 'Option price must be greater than zero when free choices is zero',
            });
            hasInvalidOptionPrices = true;
          }
        });
      }
    });

    if (hasInvalidOptionPrices) {
      return;
    }

    try {
      const hasDefaultVariant = variants.some((v) => v.default);
      if (variants.length > 0 && !hasDefaultVariant) {
        const updatedVariants = variants.map((v, i) => ({
          ...v,
          default: i === 0,
        }));
        setVariants(updatedVariants);
        setValue('variants', updatedVariants);
      }
      const defaultVariant = variants.find((v) => v.default);
      const submissionData = {
        id: data.id,
        name: data.name,
        description: data.description,
        isAvailable: selectedItem?.isAvailable ?? true,
        categoryId: data.categoryId,
        price: defaultVariant ? defaultVariant.priceCents / 100 : Number(data.priceCents),
        stationTags: data.stationTags,
        imageUrls: imageUrls, // Add this
        variants: variants.map((v) => ({
          ...v,
          priceCents: Math.round(Number(v.priceCents)),
        })),
        modifiers: modifiers.map((m) => ({
          ...m,
          extraChoicePriceCents: Math.round(Number(m.extraChoicePriceCents)),
          options: (m.options || []).map((o) => ({
            ...o,
            priceCents: Math.round(Number(o.priceCents)),
          })),
        })),
      };
      await upsertMenuItem.mutateAsync(submissionData);
      router.push(`/${restaurantId}/${locationId}/apps/menu/${menuId}/${categoryId}/items`);
    } catch (error) {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'manageMenuItem.handleFormSubmit',
        { restaurantId, locationId, menuId, categoryId, itemId: data.id }
      );
      console.error('Error submitting form:', error);
    }
  };
  useEffect(() => {
    const defaultVariant = variants.find((v) => v.default);
    if (defaultVariant) {
      setValue('priceCents', defaultVariant.priceCents / 100);
    }
  }, [variants, setValue]);
  useEffect(() => {
    setValue('variants', variants);
  }, [variants, setValue]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];

    if (file.size > azureConfig.maxFileSize) {
      setToastMessage('File size exceeds 5MB limit');
      setShowToast(true);
      return;
    }

    if (!azureConfig.allowedFileTypes.includes(file.type)) {
      setToastMessage('File type not supported. Please use JPG, PNG or WebP');
      setShowToast(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadImage.mutateAsync({
        file,
        restaurantId,
        folder: 'menu',
      });

      const updatedUrls = [...imageUrls, imageUrl];
      setImageUrls(updatedUrls);
      setValue('imageUrls', updatedUrls);

      setToastMessage('Image uploaded successfully');
      setShowToast(true);
    } catch (error) {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'manageMenuItem.handleImageUpload',
        { restaurantId, locationId, menuId, categoryId, fileType: file.type, fileSize: file.size }
      );
      console.error('Upload failed:', error);
      setToastMessage('Failed to upload image');
      setShowToast(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
  };

  return (
    <IonPage>
      <LaunchPadNavBar title={isEdit ? 'Edit Menu Item' : 'Add Menu Item'} />
      <IonContent style={{ fontSize: '14px' }}>
        <form onSubmit={handleSubmit(handleFormSubmit, onError)} className='ion-padding'>
          <IonItem lines='none'>
            <IonInput label='Name' labelPlacement='stacked' placeholder='Enter item name' {...register('name.en')} />
          </IonItem>
          {errors.name?.en && (
            <IonItem lines='none'>
              {errors.name?.en && <IonText color='danger'>{errors.name.en.message}</IonText>}
            </IonItem>
          )}

          <IonItem lines='none'>
            <IonInput
              label='Description'
              labelPlacement='stacked'
              placeholder='Enter item description'
              {...register('description.en')}
            />
          </IonItem>
          {errors.description?.en && (
            <IonItem lines='none'>
              {errors.description?.en && <IonText color='danger'>{errors.description.en.message}</IonText>}
            </IonItem>
          )}

          <IonItem lines='none'>
            <IonInput
              label='Price ($)'
              labelPlacement='stacked'
              type='number'
              min='0'
              step='0.01'
              placeholder='Enter price in dollars'
              disabled={variants.some((v) => v.default)}
              {...register('priceCents', {
                valueAsNumber: true,
              })}
            />
          </IonItem>
          {errors.priceCents && (
            <IonItem lines='none'>
              {errors.priceCents && <IonText color='danger'>{errors.priceCents.message}</IonText>}
            </IonItem>
          )}
          <IonItem lines='none'>
            <IonText>Stations</IonText>
            <IonSelect
              slot='end'
              aria-label='Stations'
              placeholder='Select stations'
              multiple={true}
              value={selectedTags}
              onIonChange={(e: CustomEvent) => {
                const newTags = e.detail.value;
                setValue('stationTags', newTags);
              }}
            >
              {stations?.map((station) => (
                <IonSelectOption key={station._id} value={station.tags[0]}>
                  {station.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem lines='none'>
            <IonButton slot='end' size='small' onClick={handleAddVariant} fill='outline'>
              Add Variant
            </IonButton>
          </IonItem>
          {variants.length > 0 && (
            <IonCard>
              <IonAccordionGroup>
                <IonAccordion value='variants'>
                  <IonItem slot='header' color='light'>
                    <IonText>Variants ({variants.length})</IonText>
                  </IonItem>

                  <div className='ion-padding' slot='content'>
                    {variants.map((variant, index) => (
                      <IonCard key={index} className='ion-margin-bottom'>
                        <IonCardContent>
                          <IonItem lines='none'>
                            <IonInput
                              label='Variant Name'
                              labelPlacement='stacked'
                              value={variant.name}
                              onIonChange={(e) => handleVariantChange(index, 'name', e.detail.value!)}
                              placeholder='Enter variant name'
                            />
                          </IonItem>
                          {errors.variants?.[index]?.name && (
                            <IonItem lines='none'>
                              <IonText color='danger'>{errors.variants[index]?.name?.message}</IonText>
                            </IonItem>
                          )}

                          <IonItem lines='none'>
                            <IonInput
                              label='Price ($)'
                              labelPlacement='stacked'
                              type='number'
                              min='0'
                              step='0.01'
                              value={variant.priceCents / 100}
                              onIonChange={(e) => handleVariantChange(index, 'priceCents', e.detail.value!)}
                              placeholder='Enter price'
                            />
                          </IonItem>
                          {errors.variants?.[index]?.priceCents && (
                            <IonItem lines='none'>
                              <IonText color='danger'>{errors.variants[index]?.priceCents?.message}</IonText>
                            </IonItem>
                          )}
                          <IonItem lines='none'>
                            <IonCheckbox
                              checked={variant.default}
                              onIonChange={(e) => handleVariantChange(index, 'default', e.detail.checked)}
                              labelPlacement='end'
                              disabled={variant.default && !variants.some((v) => v.default && v.id !== variant.id)}
                            >
                              Default Variant
                            </IonCheckbox>
                            <IonButton
                              slot='end'
                              color='danger'
                              fill='outline'
                              onClick={() => handleRemoveVariant(index)}
                              disabled={variant.default && variants.length > 1}
                            >
                              Remove
                            </IonButton>
                          </IonItem>
                        </IonCardContent>
                      </IonCard>
                    ))}
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCard>
          )}

          {/* modifiers section */}
          <IonItem lines='none'>
            <IonButton slot='end' size='small' onClick={handleAddModifier} fill='outline'>
              Add Modifier
            </IonButton>
          </IonItem>
          {modifiers.length > 0 && (
            <IonCard>
              <IonAccordionGroup>
                <IonAccordion value='modifiers'>
                  <IonItem slot='header' color='light'>
                    <IonText>Modifiers ({modifiers.length})</IonText>
                  </IonItem>

                  <div className='ion-padding' slot='content'>
                    {modifiers.map((modifier, modifierIndex) => (
                      <IonCard key={modifierIndex} className='ion-margin-bottom'>
                        <IonCardContent>
                          <IonItem lines='none'>
                            <IonInput
                              label='Modifier Name'
                              labelPlacement='stacked'
                              value={modifier.name.en}
                              onIonChange={(e) =>
                                handleModifierChange(modifierIndex, 'name', { ...modifier.name, en: e.detail.value! })
                              }
                              placeholder='Enter modifier name'
                            />
                          </IonItem>
                          {errors.modifiers?.[modifierIndex]?.name && (
                            <IonItem lines='none'>
                              <IonText color='danger'>Please enter modifier name</IonText>
                            </IonItem>
                          )}

                          <IonItem lines='none'>
                            <IonInput
                              label='Max Choices'
                              labelPlacement='stacked'
                              type='number'
                              min='1'
                              value={modifier.maxChoices}
                              onIonChange={(e) =>
                                handleModifierChange(modifierIndex, 'maxChoices', parseInt(e.detail.value!))
                              }
                            />
                          </IonItem>
                          {errors.modifiers?.[modifierIndex]?.maxChoices && (
                            <div>Please enter modifiers max choices</div>
                          )}

                          <IonItem lines='none'>
                            <IonInput
                              label='Free Choices'
                              labelPlacement='stacked'
                              type='number'
                              min='0'
                              value={modifier.freeChoices}
                              onIonChange={(e) =>
                                handleModifierChange(modifierIndex, 'freeChoices', parseInt(e.detail.value!))
                              }
                            />
                          </IonItem>
                          {errors.modifiers?.[modifierIndex]?.freeChoices && (
                            <div>Please enter modifiers free choices</div>
                          )}

                          <IonItem lines='none'>
                            <IonInput
                              label='Extra Choice Price ($)'
                              labelPlacement='stacked'
                              type='number'
                              min='0'
                              step='0.01'
                              value={(modifier.extraChoicePriceCents ?? 0) / 100}
                              disabled={modifier.freeChoices === 0}
                              onIonChange={(e) =>
                                handleModifierChange(
                                  modifierIndex,
                                  'extraChoicePriceCents',
                                  Math.round(Number(e.detail.value!) * 100),
                                )
                              }
                            />
                          </IonItem>
                          {errors.modifiers?.[modifierIndex]?.extraChoicePriceCents && (
                            <div>Please enter modifiers extra choice price</div>
                          )}

                          <IonItem lines='none'>
                            <IonCheckbox
                              checked={modifier.required}
                              onIonChange={(e) => handleModifierChange(modifierIndex, 'required', e.detail.checked)}
                              labelPlacement='end'
                            >
                              Required
                            </IonCheckbox>
                            <IonButton
                              slot='end'
                              color='danger'
                              fill='outline'
                              onClick={() => handleRemoveModifier(modifierIndex)}
                            >
                              Remove
                            </IonButton>
                          </IonItem>
                          {errors.modifiers?.[modifierIndex]?.required && <div>please required is required</div>}

                          <IonItem lines='none'>
                            <IonButton
                              fill='outline'
                              slot='end'
                              size='small'
                              onClick={() => handleAddOption(modifierIndex)}
                            >
                              Add Option
                            </IonButton>
                          </IonItem>
                          {modifier.options?.map((option, optionIndex) => (
                            <IonCard key={optionIndex} className='ion-margin-start'>
                              <IonCardContent>
                                <IonItem lines='none'>
                                  <IonInput
                                    label='Option Name'
                                    labelPlacement='stacked'
                                    value={option.name.en}
                                    onIonChange={(e) =>
                                      handleOptionChange(modifierIndex, optionIndex, 'name', e.detail.value!)
                                    }
                                    placeholder='Enter option name'
                                  />
                                </IonItem>
                                {errors.modifiers?.[modifierIndex]?.options?.[optionIndex]?.name && (
                                  <IonItem lines='none'>
                                    <IonText color='danger'>Please enter option name</IonText>
                                  </IonItem>
                                )}

                                <IonItem lines='none'>
                                  <IonInput
                                    label='Price ($)'
                                    labelPlacement='stacked'
                                    type='number'
                                    min='0'
                                    step='0.01'
                                    value={option.priceCents / 100}
                                    disabled={modifier.freeChoices! > 0}
                                    onIonChange={(e) =>
                                      handleOptionChange(modifierIndex, optionIndex, 'priceCents', e.detail.value!)
                                    }
                                    placeholder='Enter price'
                                  />
                                </IonItem>
                                {modifier.freeChoices === 0 && (
                                  <IonText slot='helper' color={option.priceCents === 0 ? 'danger' : 'medium'}>
                                    {option.priceCents === 0 && 'Price is required'}
                                  </IonText>
                                )}

                                <IonItem lines='none'>
                                  <IonButton
                                    color='danger'
                                    fill='outline'
                                    onClick={() => handleRemoveOption(modifierIndex, optionIndex)}
                                    slot='end'
                                  >
                                    Remove Option
                                  </IonButton>
                                </IonItem>
                              </IonCardContent>
                            </IonCard>
                          ))}
                        </IonCardContent>
                      </IonCard>
                    ))}
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
            </IonCard>
          )}
          <IonCard className='ion-padding'>
            <IonItem lines='none'>
              <IonLabel>Images :</IonLabel>
              <input
                type='file'
                accept={azureConfig.allowedFileTypes.join(',')}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id='image-upload'
              />
              <IonButton
                slot='end'
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={uploading}
                fill='outline'
              >
                {uploading ? 'Uploading...' : 'Add Image'}
              </IonButton>
            </IonItem>

            {uploading && <IonProgressBar value={uploadProgress}></IonProgressBar>}

            <IonItem lines='none' className='ion-margin-top'>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {imageUrls.map((url, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`Item ${index + 1}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                    <IonButton
                      fill='clear'
                      color='danger'
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        margin: 0,
                        '--padding-start': '4px',
                        '--padding-end': '4px',
                      }}
                      // onClick={() => handleImageDelete(url)}
                    ></IonButton>
                  </div>
                ))}
              </div>
            </IonItem>
          </IonCard>
          <IonGrid>
            <IonRow className='ion-justify-content-center'>
              <IonCol size='12' className='ion-text-center'>
                {' '}
                <IonButton type='submit' className=' solid-button'>
                  {isEdit ? 'Update Item' : 'Create Item'}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </form>{' '}
      </IonContent>
    </IonPage>
  );
};
