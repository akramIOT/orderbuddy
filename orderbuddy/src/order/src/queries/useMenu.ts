import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { axiosInstance } from './axiosInstance';
import { logApiError } from '@/utils/errorLogger';

// Define schemas for nested structures
const multilingualSchema = z.object({
  en: z.string(),
  es: z.string(),
  pt: z.string(),
});

const variantSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number(),
  default: z.boolean().optional(),
});

const modifierOptionSchema = z.object({
  id: z.string(),
  name: multilingualSchema,
  priceCents: z.number(),
});

const modifierSchema = z.object({
  id: z.string(),
  name: multilingualSchema,
  type: z.enum(['standard', 'upsell']),
  required: z.boolean(),
  selectionMode: z.enum(['single', 'max', 'multiple']),
  maxChoices: z.number(),
  freeChoices: z.number(),
  extraChoicePriceCents: z.number(),
  options: z.array(modifierOptionSchema).optional().default([]),
});

const categorySchema = z.object({
  id: z.string(),
  name: multilingualSchema,
  description: multilingualSchema,
  sortOrder: z.number(),
  emoji: z.string().optional(),
});

const menuItemSchema = z.object({
  id: z.string(),
  name: multilingualSchema,
  description: multilingualSchema,
  imageUrls: z.array(z.string()).nullable().optional().default([]),
  categoryId: z.string(),
  priceCents: z.number(),
  makingCostCents: z.number(),
  isAvailable: z.boolean().optional().nullable().default(true),
  stationTags: z.array(z.string()).optional().nullable().default([]),
  variants: z.array(variantSchema).optional().nullable().default([]),
  modifiers: z.array(modifierSchema).optional().nullable().default([]),
});

const menuResponseSchema = z.object({
  _id: z.string(),
  restaurantId: z.string(),
  locationId: z.string(),
  menuSlug: z.string(),
  name: multilingualSchema,
  categories: z.array(categorySchema),
  items: z.array(menuItemSchema),
  salesTax: z.number(),
});

// Update the type to use Zod inference
export type Menu = z.infer<typeof menuResponseSchema>;

export function useMenu(restaurantId: string, locationId: string, menuId: string) {
  return useQuery<Menu>({
    queryKey: ['menu', restaurantId, locationId, menuId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<Menu>>(
          `order-app/restaurants/${restaurantId}/locations/${locationId}/menus/${menuId}`
        );
        const data = handleApiResponse(response);
        try {
          const validatedData = menuResponseSchema.parse(data);
          return {
            ...validatedData,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error('Menu data validation failed:', error.errors);
            logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus/${menuId}`, {
              operation: 'validateMenuData',
              restaurantId,
              locationId,
              menuId,
              validationErrors: error.errors
            });
            throw new Error('Invalid menu data format');
          }
          logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus/${menuId}`, {
            operation: 'processMenuData',
            restaurantId,
            locationId,
            menuId
          });
          throw error;
        }
      } catch (error) {
        // Add Application Insights logging while preserving any console.error from throw
        logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus/${menuId}`, {
          operation: 'fetchMenu',
          restaurantId,
          locationId,
          menuId
        });
        throw error;
      }
    },
    staleTime: 60 * 1000,
    enabled: !!restaurantId && !!locationId && !!menuId,
  });
}
