import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from '../api-response';
import { axiosInstance } from '../axiosInstance';
import { appStore } from '../../store';
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const printerSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid ObjectId format'),
  type: z.string(),
  //ip: z.string().ip('Invalid IP address'),
  ip: z.string().min(1, 'Invalid IP address'),
  name: z.string().min(1, 'Printer name is required'),
});

export type Printer = z.infer<typeof printerSchema>;
const createPrinterSchema = printerSchema.omit({ id: true });
export type CreatePrinterInput = z.infer<typeof createPrinterSchema>;

export const usePrinters = (restaurantId?: string, locationId?: string) => {
  return useQuery({
    queryKey: ['printers', restaurantId, locationId],
    queryFn: async () => {
      if (!restaurantId || !locationId) return [];
      const response = await axiosInstance.get<ApiResponse<Printer[]>>(`/printers/${restaurantId}/${locationId}`);
      return z.array(printerSchema).parse(response.data.data ?? []);
    },
    //staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!restaurantId && !!locationId,
  });
};

export const useCreatePrinter = (restaurantId?: string, locationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!restaurantId || !locationId) throw new Error('Restaurant or Location not selected');
      //   const validatedData = createPrinterSchema.parse(data);
      const response = await axiosInstance.post(`/printers/${restaurantId}/${locationId}`, data);
      return printerSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['printers', restaurantId, locationId],
      });
    },
  });
};
