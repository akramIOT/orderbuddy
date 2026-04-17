import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { axiosInstance } from './axiosInstance';

// Define schemas for nested structures
const multilingualSchema = z.object({
  en: z.string(),
  es: z.string().optional().nullable(),
  pt: z.string().optional().nullable(),
});

const variantSchema = z.object({
  id: z.string().optional(),
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
  options: z.array(modifierOptionSchema).nullable().default([]).optional(),
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
  imageUrls: z.array(z.string()).nullable().default([]),
  categoryId: z.string(),
  priceCents: z.number(),
  makingCostCents: z.number().nullable().default(0),
  isAvailable: z.boolean().default(true).nullable(),
  stationTags: z.array(z.string()).nullable().default([]),
  variants: z.array(variantSchema).nullable().default([]).optional(),
  modifiers: z.array(modifierSchema).nullable().default([]),
});

const menuResponseSchema = z.object({
  _id: z.string(),
  restaurantId: z.string(),
  locationId: z.string(),
  menuSlug: z.string(),
  name: multilingualSchema,
  categories: z.array(categorySchema),
  items: z.array(menuItemSchema),
  salesTax: z.number().optional(),
});

export type Menu = z.infer<typeof menuResponseSchema>;

export function useMenu(restaurantId: string, locationId: string, menuId: string) {
  return useQuery<Menu>({
    queryKey: ['menu', restaurantId, locationId, menuId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<Menu>>(
          `restaurant/restaurants/${restaurantId}/locations/${locationId}/menus/${menuId}`
        );

        const { data } = response;
        const validatedData = menuResponseSchema.parse(data.data);
        return validatedData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Menu data validation failed:', error.errors);
          throw new Error('Invalid menu data format');
        }
        throw error;
      }
    },
    enabled: Boolean(restaurantId && locationId && menuId),
  });
}
