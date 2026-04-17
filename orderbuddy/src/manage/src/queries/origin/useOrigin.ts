import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from '../axiosInstance';
import { ApiResponse } from '../api-response';
import { Options } from 'qr-code-styling';
import { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { logExceptionError } from '../../utils/errorLogger';

// Zod schemas
const originSchema = z.object({
  _id: z.string(),
  restaurantId: z.string(),
  locationId: z.string(),
  label: z.string(),
  qrCodeId: z.string(),
  qrCode: z.string(),
  qrCodeStyle: z
    .object({
      width: z.number(),
      height: z.number(),
      margin: z.number(),
      type: z.string(),
      data: z.string(),
      image: z.string().optional(),
      imageOptions: z
        .object({
          hideBackgroundDots: z.boolean().optional(),
          imageSize: z.number().optional(),
          crossOrigin: z.string().optional(),
          margin: z.number().optional(),
        })
        .optional(),
      dotsOptions: z
        .object({
          color: z.string(),
          type: z.enum(['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'] as [
            DotType,
            ...DotType[],
          ]),
        })
        .optional(),
      backgroundOptions: z
        .object({
          color: z.string(),
        })
        .optional(),
      cornersSquareOptions: z
        .object({
          color: z.string(),
          type: z.enum(['dot', 'square', 'extra-rounded'] as [CornerSquareType, ...CornerSquareType[]]),
        })
        .optional(),
      cornersDotOptions: z
        .object({
          color: z.string(),
          type: z.enum(['dot', 'square'] as [CornerDotType, ...CornerDotType[]]),
        })
        .optional(),
      shape: z.enum(['square', 'circle']),
    })
    .optional(),
  qrCodeImage: z.string().optional(),
  type: z.enum(['table', 'parking']),
});

const originResponseSchema = z.array(originSchema);

// Types
export type Origin = z.infer<typeof originSchema>;
export type OriginsResponse = {
  qrCodeStyle: any;
  qrCodeImage: any;
  originData: Origin[];
};

// Queries and Mutations
export function useOrigins(restaurantId: string, locationId: string) {
  return useQuery<OriginsResponse>({
    queryKey: ['origins', restaurantId, locationId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<OriginsResponse>>(`/origins/${restaurantId}/${locationId}`);
      return response.data.data || { qrCodeStyle: null, qrCodeImage: null, originData: [] };
    },
    enabled: !!restaurantId && !!locationId,
  });
}

export function useCreateOrigin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      locationId,
      name,
      type,
    }: {
      restaurantId: string;
      locationId: string;
      name: string;
      type: 'table' | 'parking';
    }) => {
      const response = await axiosInstance.post<ApiResponse<Origin>>(`/origins/${restaurantId}/${locationId}`, {
        name,
        type,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['origins', variables.restaurantId, variables.locationId],
      });
    },
  });
}
