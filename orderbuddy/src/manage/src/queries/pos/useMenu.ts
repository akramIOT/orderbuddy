import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../api-response';
import { handleApiResponse } from '../apiHandle';
import { axiosInstance } from '../axiosInstance';

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

// export function useMenu(restaurantId: string, locationId: string, menuId: string) {
//   return useQuery<Menu>({
//     queryKey: ['menu', restaurantId, locationId, menuId],
//     queryFn: fetchMenuById.bind(null, restaurantId, locationId, menuId),
//     staleTime: 60 * 1000,
//     enabled: !!restaurantId && !!locationId && !!menuId,
//   });
// }


export const fetchMenuById = async (restaurantId: string, locationId: string, menuId: string): Promise<Menu> => {
  const response = await axiosInstance.get<ApiResponse<Menu>>(
    `pos/${restaurantId}/locations/${locationId}/menus/${menuId}`,
  );
  console.log('Menu Response:', response.data);
  if (!response.data || !response.data.data) {
    throw new Error('Invalid API response format');
  }
  return response.data.data;
};
