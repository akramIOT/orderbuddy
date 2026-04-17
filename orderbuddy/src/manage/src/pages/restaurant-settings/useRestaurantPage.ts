import { useEffect, useState } from 'react';
import { useRestaurantApi, useUpdateRestaurant } from './useRestaurantQuery';
import { debounce } from 'lodash';
import { useIonToast } from '@ionic/react';
import { logExceptionError } from '../../utils/errorLogger';
import { azureConfig } from '../../queries/manage-menu/useStorage';
import { useLogoUpload } from '../../queries/restaurant-settings/useLogo';
import { appStore } from '../../store';

// Define Profile interface
export interface Profile {
  name: string;
  concept: string;
  tagline: string;
  website: string;
  logo?: string;
}

export const useRestaurantPage = (restaurantId: string, locationId: string) => {
  // Get restaurant data from the API
  const { data: restaurant, refetch: refetchRestaurant } = useRestaurantApi(restaurantId, locationId);
  // Get update restaurant mutation
  const updateRestaurantMutation = useUpdateRestaurant();
  const logoUpload = useLogoUpload(restaurantId, locationId);

  // Form state management using a single object
  const [profile, setProfile] = useState<Profile>({
    name: '',
    concept: '',
    tagline: '',
    website: '',
    logo: '',
  });

  const [presentToast] = useIonToast();
  const { setRestaurantLogo } = appStore();

  // Create a debounced update function
  const debouncedUpdateRestaurant = debounce((data: Partial<Profile>) => {
    console.log('Updating restaurant:', data);
    updateRestaurantMutation.mutate(
      {
        restaurantId,
        locationId,
        ...data,
      },
      {
        onSuccess: () => {
          refetchRestaurant();
          presentToast({
            message: 'Restaurant profile updated successfully',
            duration: 2000,
            position: 'bottom',
            color: 'success',
          });
        },
        onError: (error) => {
          console.error('Failed to update restaurant:', error);
          presentToast({
            message: 'Failed to update restaurant profile',
            duration: 3000,
            position: 'bottom',
            color: 'danger',
          });
        },
      },
    );
  }, 500);

  // Handle restaurant profile update
  const updateRestaurant = (data: Partial<Profile>) => {
    debouncedUpdateRestaurant(data);
  };

  // Initialize form with restaurant data
  useEffect(() => {
    if (restaurant) {
      setProfile({
        name: restaurant.name || '',
        concept: restaurant.concept || '',
        tagline: restaurant.tagline || '',
        website: restaurant.website || '',
        logo: restaurant.logo || '',
      });
    }
  }, [restaurant]);

  const updateProfile = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));

    updateRestaurant({ [field]: value });
  };


  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];

    if (file.size > azureConfig.maxFileSize) {
      presentToast({
        message: 'File size exceeds the maximum allowed (5MB)',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      return;
    }

    if (!azureConfig.allowedFileTypes.includes(file.type)) {
      presentToast({
        message: 'File type not supported. Please use JPG, PNG or WebP',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      return;
    }

    try {
      const logoUrl = await logoUpload.mutateAsync(file);

      setProfile((prev) => ({
        ...prev,
        logo: logoUrl as string,
      }));

      setRestaurantLogo(logoUrl as string);

      presentToast({
        message: 'Logo uploaded successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success',
      });
    } catch (error) {
      logExceptionError(
        error instanceof Error ? error : new Error(String(error)),
        'useRestaurantPage.handleLogoUpload',
        {
          restaurantId,
          locationId,
          fileType: file.type,
          fileSize: file.size,
        },
      );
      presentToast({
        message: 'Logo upload failed',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
    }
  };

  // Clean up the debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateRestaurant.cancel();
    };
  }, []);

  return {
    profile,
    updateProfile,
    handleLogoUpload,
  };
};
