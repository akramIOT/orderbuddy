import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { useCampaign } from './useCampaign';
import AddCampaign from './components/AddCampaign';
import EmptyCampaign from './components/EmptyCampaign';
import CampaignList from './components/CampaignList';
import CampaignSummary from './components/CampaignSummary';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import './CampaignPage.css';

const CampaignPage: React.FC = () => {
  const { restaurantId, locationId } = useParams<{ restaurantId: string; locationId: string }>();
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignSummary, setCampaignSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const { campaigns, loading, error, refreshData, createCampaign, getCampaignSummary } = useCampaign(
    restaurantId,
    locationId,
  );

  const handleRefresh = async (event: CustomEvent) => {
    await refreshData();
    setSelectedCampaignId(null);
    setCampaignSummary(null);
    event.detail.complete();
  };

  const handleSelectCampaign = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);

    // Fetch campaign summary when a campaign is selected
    try {
      setSummaryLoading(true);
      const summary = await getCampaignSummary(campaignId);
      setCampaignSummary(summary);
    } catch (error) {
      console.error('Failed to load campaign summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const selectedCampaign = campaigns.find((campaign) => campaign._id.toString() === selectedCampaignId) || null;

  return (
    <IonPage>
      <LaunchPadNavBar title='Campaigns' />

      <IonContent fullscreen>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && (
          <div className='loading-container'>
            <IonSpinner name='circular' />
          </div>
        )}
        {!loading && campaigns.length === 0 && <EmptyCampaign  />}
        {!loading && campaigns.length > 0 && (
          <IonGrid className='campaign-grid'>
            <IonRow className='campaign-row'>
              <IonCol size='5'  className='campaign-list-col'>
                <CampaignList
                  campaigns={campaigns}
                  selectedCampaignId={selectedCampaignId}
                  onSelectCampaign={handleSelectCampaign}
                />
              </IonCol>
              <IonCol size='7' className='campaign-detail-col'>
                <CampaignSummary
                  campaign={selectedCampaign}
                  summary={campaignSummary}
                  summaryLoading={summaryLoading}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton onClick={() => setShowAddCampaign(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AddCampaign
          isOpen={showAddCampaign}
          onClose={() => setShowAddCampaign(false)}
          createCampaign={createCampaign}
        />
      </IonContent>
    </IonPage>
  );
};

export default CampaignPage;
