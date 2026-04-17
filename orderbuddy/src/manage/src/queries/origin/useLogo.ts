import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

export const useLogoUpload = (restaurantId: string, locationId: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logo');

      const response = await axiosInstance.post<{ data: string }>(
        `/origins/${restaurantId}/${locationId}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
  });
};
