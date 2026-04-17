import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';

interface CreateStationDto {
  name: string;
  restaurantId: string;
  locationId: string;
  tags: string[];
}

export const useCreateStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (station: CreateStationDto) => {
      const { data } = await axiosInstance.post('/stations', station);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });
};
