import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../queries/axiosInstance';
import { Campaign } from './useCampaign';
import { z } from 'zod';

export const campaignDataSchema = z.object({
  name: z.string().min(1, { message: 'Campaign name is required' }),
  type: z.enum(['flat', 'percent', 'bogo', 'free_item'], {
    errorMap: () => ({ message: 'Must be one of: flat, percent, bogo, free_item' }),
  }),
  originId: z.string().optional(),
  reward: z.object({
    flatOffCents: z.number().int().positive({ message: 'Reward amount must be a positive number' }),
  }),
  isActive: z.boolean(),
});

export type CampaignData = z.infer<typeof campaignDataSchema>;

export interface CampaignSummary {
  totalOrders: number;
  grossSalesCents: number;
  totalCustomers: number;
  avgOrderValueCents: number;
}

const fetchCampaigns = async (restaurantId: string, locationId: string) => {
  const response = await axiosInstance.get(`/campaign/restaurant/${restaurantId}/location/${locationId}`);
  return response.data;
};

const createCampaign = async (restaurantId: string, locationId: string, campaignData: CampaignData) => {
  const response = await axiosInstance.post(
    `/campaign/restaurant/${restaurantId}/location/${locationId}`,
    campaignData,
  );
  return response.data;
};

const fetchCampaignSummary = async (restaurantId: string, locationId: string, campaignId: string) => {
  const response = await axiosInstance.get(
    `/campaign/restaurant/${restaurantId}/location/${locationId}/${campaignId}/summary`,
  );
  return response.data;
};

export const useCampaignPageQuery = (restaurantId: string, locationId: string) => {
  const queryClient = useQueryClient();
  const campaignQueryKey = ['campaigns', restaurantId, locationId];

  // Query for fetching campaigns
  const { data, isLoading, error, refetch } = useQuery<Campaign[]>({
    queryKey: campaignQueryKey,
    queryFn: () => fetchCampaigns(restaurantId, locationId),
    enabled: !!restaurantId && !!locationId,
  });

  // Mutation for creating a campaign
  const createMutation = useMutation({
    mutationFn: (data: { restaurantId: string; locationId: string; campaignData: CampaignData }) => {
      return createCampaign(data.restaurantId, data.locationId, data.campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignQueryKey });
    },
  });

  const createNewCampaign = async (restaurantId: string, locationId: string, campaignData: CampaignData) => {
    try {
      const validatedData = campaignDataSchema.parse(campaignData);
      return await createMutation.mutateAsync({
        restaurantId,
        locationId,
        campaignData: validatedData,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Campaign validation failed:', error.errors);
        throw new Error(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`);
      }
      throw error;
    }
  };

  // Query for fetching campaign summary
  const getCampaignSummary = async (campaignId: string): Promise<CampaignSummary> => {
    try {
      return await fetchCampaignSummary(restaurantId, locationId, campaignId);
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
      throw error;
    }
  };

  return {
    campaigns: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    createNewCampaign,
    getCampaignSummary,
  };
};
