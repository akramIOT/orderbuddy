import React, { useState } from 'react';
import { IonItem, IonInput, IonLabel, IonTextarea, IonText } from '@ionic/react';
import { z } from 'zod';

interface ProfileProps {
  profile: {
    name: string;
    concept: string;
    tagline: string;
    website: string;
  };
  updateProfile: (field: string, value: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, updateProfile }) => {


  return (
    <div className='ion-padding'>
      <IonItem className='ion-margin-bottom'>
        <IonLabel position='stacked'>Restaurant Name*</IonLabel>
        <IonInput
          value={profile.name}
          onIonInput={(e) => updateProfile('name', e.detail.value || '')}
          placeholder='Enter restaurant name'
        ></IonInput>
      </IonItem>

      <IonItem className='ion-margin-bottom'>
        <IonLabel position='stacked'>Concept</IonLabel>
        <IonInput
          value={profile.concept}
          onIonInput={(e) => updateProfile('concept', e.detail.value || '')}
          placeholder='Restaurant concept (e.g., Italian, Fast Food)'
        ></IonInput>
      </IonItem>

      <IonItem className='ion-margin-bottom'>
        <IonLabel position='stacked'>Tagline</IonLabel>
        <IonTextarea
          value={profile.tagline}
          onIonInput={(e) => updateProfile('tagline', e.detail.value || '')}
          placeholder='Restaurant tagline or motto'
        ></IonTextarea>
      </IonItem>

      <IonItem >
        <IonLabel position='stacked'>Website</IonLabel>
        <IonInput
          value={profile.website}
          onIonInput={(e) => updateProfile('website', e.detail.value || '')}
          placeholder='Restaurant website URL (e.g., https://example.com)'
        ></IonInput>
     
      </IonItem>
    </div>
  );
};

export default Profile;
