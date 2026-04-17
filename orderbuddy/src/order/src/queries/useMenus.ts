import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from '@/queries/axiosInstance';
import { ApiResponse } from '@/queries/api-response';
import { handleApiResponse } from './apiHandle';
import { logApiError } from '@/utils/errorLogger';

const menuNameSchema = z.object({
  en: z.string(),
  es: z.string(),
  pt: z.string(),
});
const menusResponseSchema = z.array(
  z.object({
    _id: z.string(),
    menuSlug: z.string(),
    name: menuNameSchema,
    available: z.boolean(),
  })
);

export type MenusResponse = z.infer<typeof menusResponseSchema>;

export function useMenus(restaurantId: string, locationId: string) {
  return useQuery<MenusResponse>({
    queryKey: ['menus', restaurantId, locationId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<MenusResponse>>(
          `order-app/restaurants/${restaurantId}/locations/${locationId}/menus`
        );
        const data = handleApiResponse(response);
        try {
          const validatedData = menusResponseSchema.parse(data);
          return validatedData.map((menu) => ({
            ...menu,
          }));
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error('Menu data validation failed:', error.errors);
            logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus`, {
              operation: 'validateMenuData',
              restaurantId,
              locationId,
              validationErrors: error.errors,
            });
            throw new Error('Invalid menu data format');
          }
          // Keep existing implicit console.error from the throw
          logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus`, {
            operation: 'processMenuData',
            restaurantId,
            locationId,
          });
          throw error;
        }
      } catch (error) {
        // Add Application Insights logging
        logApiError(error, `order-app/restaurants/${restaurantId}/locations/${locationId}/menus`, {
          operation: 'fetchMenus',
          restaurantId,
          locationId,
        });
        throw error;
      }
    },
    enabled: !!restaurantId && !!locationId,
    staleTime: 5 * 60 * 1000,
  });
}
