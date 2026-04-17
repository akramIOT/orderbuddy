import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import './EmptyCampaign.css';

const EmptyCampaign: React.FC = () => {
  return (
    <div className='empty-campaign-container'>
      <div className='empty-campaign-content'>
        <img
          src='/assets/images/empty-campaign.svg'
          alt='No campaigns'
          className='empty-campaign-image'
          onError={(e) => {
            // Fallback if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <h2>No Campaigns Available</h2>
        <p>Create your first campaign to start promoting your restaurant</p>
      </div>
    </div>
  );
};

export default EmptyCampaign;
