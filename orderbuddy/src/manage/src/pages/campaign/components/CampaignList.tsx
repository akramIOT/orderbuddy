import React from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
} from '@ionic/react';
import { Campaign } from '../useCampaign';
import './CampaignList.css';

interface CampaignListProps {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  onSelectCampaign: (campaignId: string) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, selectedCampaignId, onSelectCampaign }) => {
  return (
    <div className='campaign-list-container'>
      <h2>Your Campaigns</h2>
      <IonList>
        {campaigns.map((campaign) => (
          <IonCard
            key={campaign._id.toString()}
            className={`campaign-card ${campaign._id.toString() === selectedCampaignId ? 'selected' : ''}`}
            onClick={() => onSelectCampaign(campaign._id.toString())}
          >
            <IonCardHeader>
              <IonCardTitle>{campaign.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines='none'>
                <IonLabel>Type: {campaign.type}</IonLabel>
              </IonItem>
              <IonItem lines='none'>
                <IonLabel>Reward: ${(campaign.reward.flatOffCents / 100).toFixed(2)}</IonLabel>
              </IonItem>
              <div className='campaign-status'>
                <IonBadge color={campaign.isActive ? 'success' : 'medium'}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </IonBadge>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>
    </div>
  );
};

export default CampaignList;
