import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../api-response';
import { handleApiResponse } from '../apiHandle';
import { axiosInstance } from '../axiosInstance';

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
  }),
);

export type MenusResponse = z.infer<typeof menusResponseSchema>;

export function useMenus(restaurantId: string, locationId: string) {
  return useQuery<MenusResponse>({
    queryKey: ['posmenus', restaurantId, locationId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<MenusResponse>>(
          `pos/${restaurantId}/locations/${locationId}/menus`,
        );

        // Extract the data from the response
        if (!response.data || !response.data.data) {
          console.error('Invalid API response format:', response.data);
          return [];
        }

        const responseData = response.data.data;

        // Ensure we have an array
        if (!Array.isArray(responseData)) {
          console.error('Expected an array of menus, got:', responseData);
          return [];
        }

        // Validate the menu data
        const validatedData = menusResponseSchema.parse(responseData);
        return validatedData;
      } catch (error) {
        console.error('Error fetching menus:', error);
        return [];
      }
    },
    enabled: !!restaurantId && !!locationId,
    staleTime: 1000 * 60 * 10,
  });
}
