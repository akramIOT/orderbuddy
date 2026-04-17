import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  IonSpinner,
} from '@ionic/react';
import { createOutline, shareSocial, qrCode, statsChart, trashOutline } from 'ionicons/icons';
import { Campaign } from '../useCampaign';
import { CampaignSummary as CampaignSummaryType } from '../useCampaignPageQuery';
import './CampaignSummary.css';

interface CampaignSummaryProps {
  campaign: Campaign | null;
  summary?: CampaignSummaryType | null;
  summaryLoading?: boolean;
}

const CampaignSummary: React.FC<CampaignSummaryProps> = ({ campaign, summary, summaryLoading = false }) => {
  if (!campaign) {
    return (
      <div className='campaign-summary-empty'>
        <p>Select a campaign to view details</p>
      </div>
    );
  }

  return (
    <div className='campaign-summary-container'>
     

      {/* <IonCard className='campaign-detail-card'>
        <IonCardHeader>
          <IonCardTitle>{campaign.name}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size='6'>
                <IonItem lines='none'>
                  <IonLabel>Type</IonLabel>
                  <div slot='end'>{campaign.type}</div>
                </IonItem>
              </IonCol>
              <IonCol size='6'>
                <IonItem lines='none'>
                  <IonLabel>Reward</IonLabel>
                  <div slot='end'>${(campaign.reward.flatOffCents / 100).toFixed(2)}</div>
                </IonItem>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size='12'>
                <IonItem lines='none'>
                  <IonLabel>Created</IonLabel>
                  <div slot='end'>{new Date(campaign.createdAt).toLocaleDateString()}</div>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard> */}

      <IonCard className='campaign-detail-card'>
        <IonCardHeader>
          <IonCardTitle>
            Campaign Performance
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {summaryLoading ? (
            <div className='summary-loading'>
              <IonSpinner name='circular' />
              <p style={{paddingTop:"20px"}}>Loading performance data...</p>
            </div>
          ) : summary ? (
            <IonGrid>
              <IonRow>
                <IonCol size='6'>
                  <div className='summary-stat'>
                    <div className='summary-stat-value'>{summary.totalOrders}</div>
                    <div className='summary-stat-label'>Total Orders</div>
                  </div>
                </IonCol>
                <IonCol size='6'>
                  <div className='summary-stat'>
                    <div className='summary-stat-value'>${(summary.grossSalesCents / 100).toFixed(2)}</div>
                    <div className='summary-stat-label'>Gross Sales</div>
                  </div>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size='6'>
                  <div className='summary-stat'>
                    <div className='summary-stat-value'>{summary.totalCustomers}</div>
                    <div className='summary-stat-label'>Unique Customers</div>
                  </div>
                </IonCol>
                <IonCol size='6'>
                  <div className='summary-stat'>
                    <div className='summary-stat-value'>${(summary.avgOrderValueCents / 100).toFixed(2)}</div>
                    <div className='summary-stat-label'>Avg Order Value</div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          ) : (
            <div className='no-summary-data'>
              <p>No performance data available for this campaign.</p>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default CampaignSummary;
