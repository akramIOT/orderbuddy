import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../api-response';
import { handleApiResponse } from '../apiHandle';
import { axiosInstance } from '../axiosInstance';
import { logExceptionError } from '../../utils/errorLogger';

// Define schemas for working hours data
const workingHourSchema = z.object({
  day: z.string(),
  isOpen: z.boolean(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

// Define schema for order timing settings
const orderTimingSchema = z.object({
  acceptOrdersAfterMinutes: z.number().default(30),
  stopOrdersBeforeMinutes: z.number().default(30),
});

// Define schema for alert numbers
const alertNumberSchema = z.object({
  _id: z.string().optional(),
  phoneNumber: z.string(),
});
const contactSchema = z.object({
  email: z.string(), // No .email() validation, just a string
  phoneNumber: z.string().optional(),
});

const locationSettingsSchema = z.object({
  _id: z.string(),
  restaurantId: z.string(),
  name: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  workingHours: z.array(workingHourSchema).nullable().default([]),
  orderTiming: orderTimingSchema.optional(),
  alertNumbers: z.array(alertNumberSchema).optional().default([]),
  autoAcceptOrder: z.boolean().default(false),
  contact: contactSchema.optional(),
});

export type WorkingHour = z.infer<typeof workingHourSchema>;
export type OrderTiming = z.infer<typeof orderTimingSchema>;
export type AlertNumber = z.infer<typeof alertNumberSchema>;
export type LocationSettings = z.infer<typeof locationSettingsSchema>;

// Get location settings
export function useLocationSettingsApi(restaurantId: string, locationId: string) {
  return useQuery<LocationSettings>({
    queryKey: ['locationSettings', restaurantId, locationId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<LocationSettings>>(
          `location-settings/restaurant/${restaurantId}/location/${locationId}`,
        );

        // Make sure we're accessing the nested data property correctly
        if (!response.data || !response.data.data) {
          throw new Error('No location settings data received');
        }

        // Validate the data
        const validatedData = locationSettingsSchema.parse(response.data.data);
        return validatedData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Location settings data validation failed:', error.errors);
          // Log validation error
          logExceptionError(
            new Error('Invalid location settings data format'),
            'useLocationSettings.validation',
            {
              restaurantId,
              locationId,
              zodError: JSON.stringify(error.errors)
            }
          );
          throw new Error('Invalid location settings data format');
        }
        // Log general error
        logExceptionError(error, 'useLocationSettings.fetch', {
          restaurantId,
          locationId,
          endpoint: `location-settings/${restaurantId}/${locationId}`
        });
        throw error;
      }
    },
    enabled: Boolean(restaurantId && locationId),
  });
}

// Update location settings
export function useUpdateLocationSettings() {
  return useMutation({
    mutationFn: async ({
      restaurantId,
      locationId,
      workingHours,
      timezone,
      orderTiming,
      alertNumbers,
      address,
      autoAccept,
      emailAddress
    }: {
      restaurantId: string;
      locationId: string;
      workingHours: WorkingHour[];
      timezone?: string;
      orderTiming?: OrderTiming;
      alertNumbers?: AlertNumber[];
      address?: string;
      autoAccept?: boolean;
      emailAddress?: string;
    }) => {
      const autoAcceptOrder=autoAccept
        const contact = emailAddress ? { email: emailAddress } : {email:""};
      try {
        const response = await axiosInstance.patch<ApiResponse<LocationSettings>>(
          `location-settings/restaurant/${restaurantId}/location/${locationId}`,
          { workingHours, timezone, orderTiming, alertNumbers, address, autoAcceptOrder, contact },
        );
        return handleApiResponse(response);
      } catch (error) {
        console.error('Failed to update location settings:', error);
        // Log to Application Insights
        logExceptionError(error, 'useUpdateLocationSettings', {
          restaurantId,
          locationId,
          endpoint: `location-settings/restaurant/${restaurantId}/location/${locationId}`
        });
        throw error;
      }
    },
  });
}

// Create location settings
export function useCreateLocationSettings() {
  return useMutation({
    mutationFn: async ({
      restaurantId,
      locationId,
      workingHours,
      timezone,
      orderTiming,
      alertNumbers,
      emailAddress
    }: {
      restaurantId: string;
      locationId: string;
      workingHours: WorkingHour[];
      timezone?: string;
      orderTiming?: OrderTiming;
      alertNumbers?: AlertNumber[];
      emailAddress?: string;
    }) => {
        const contact = emailAddress ? { email: emailAddress } : undefined;
      try {
        const response = await axiosInstance.post<ApiResponse<LocationSettings>>(`location-settings`, {
          restaurantId,
          locationId,
          workingHours,
          timezone,
          orderTiming,
          alertNumbers,
          contact,
        });
        return handleApiResponse(response);
      } catch (error) {
        console.error('Failed to create location settings:', error);
        // Log to Application Insights
        logExceptionError(error, 'useCreateLocationSettings', {
          restaurantId,
          locationId,
          endpoint: 'location-settings'
        });
        throw error;
      }
    },
  });
}
