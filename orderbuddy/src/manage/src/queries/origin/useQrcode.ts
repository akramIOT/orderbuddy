import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { axiosInstance } from '../axiosInstance';
import { ApiResponse } from '../api-response';
import { Options } from 'qr-code-styling';
import html2canvas from 'html2canvas';

// Zod schemas
const qrStyleOptionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  type: z.string(),
  data: z.string().url(),
  margin: z.number(),
  qrOptions: z.object({
    typeNumber: z.number(),
    errorCorrectionLevel: z.string(),
  }),
  imageOptions: z.object({
    hideBackgroundDots: z.boolean(),
    imageSize: z.number(),
    margin: z.number(),
    crossOrigin: z.string(),
  }),
  dotsOptions: z.object({
    color: z.string(),
    type: z.string(),
  }),
  backgroundOptions: z.object({
    color: z.string(),
  }),
  cornersSquareOptions: z.object({
    color: z.string(),
    type: z.string(),
  }),
  cornersDotOptions: z.object({
    color: z.string(),
    type: z.string(),
  }),
  shape: z.string(),
});

const qrStyleRequestSchema = z.object({
  restaurantId: z.string(),
  locationId: z.string(),
  qrCodeStyle: qrStyleOptionsSchema,
  qrCodeImage: z.string(),
});

export function useUpdateQrStyle(restaurantId: string, locationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ options, ref }: { options: Options; ref: React.RefObject<HTMLDivElement> }) => {
      if (!ref.current) {
        throw new Error('QR code reference is not available');
      }

      // Generate image from QR code
      const canvas = await html2canvas(ref.current);
      const image = canvas.toDataURL('image/png');

      const response = await axiosInstance.put<ApiResponse<void>>(`/origins/${restaurantId}/${locationId}/qr-style`, {
        qrCodeStyle: options,
        qrCodeImage: image,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['origins', restaurantId, locationId],
      });
    },
  });
}
