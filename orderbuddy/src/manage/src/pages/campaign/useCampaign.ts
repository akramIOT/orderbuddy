import { useState, useEffect, useCallback } from 'react';
import { useCampaignPageQuery, CampaignData } from './useCampaignPageQuery';

export type Campaign = {
  _id: string;
  restaurantId: string;
  name: string;
  originId: string;
  type: 'flat' | 'percent' | 'bogo' | 'free_item';
  reward: {
    flatOffCents: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface CampaignFormData {
  name: string;
  type: string;
  flatOffCents: string;
  originId?: string;
}

export const useCampaign = (restaurantId: string, locationId: string) => {
  const {
    campaigns,
    loading,
    error,
    refetch: refreshData,
    createNewCampaign,
    getCampaignSummary,
  } = useCampaignPageQuery(restaurantId, locationId);

  const createCampaign = async (data: CampaignFormData) => {
    try {
      // Convert dollars to cents
      const amountInCents = Math.round(parseFloat(data.flatOffCents) * 100);

      // Prepare campaign data according to schema
      const campaignData: CampaignData = {
        name: data.name,
        type: data.type as 'flat' | 'percent' | 'bogo' | 'free_item',
        reward: {
          flatOffCents: amountInCents,
        },
        isActive: true,
      };

      await createNewCampaign(restaurantId, locationId, campaignData);
      return true;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return false;
    }
  };

  return {
    campaigns,
    loading,
    error,
    refreshData,
    createCampaign,
    getCampaignSummary,
  };
};
