import React, { useState } from 'react';
import { IonButton, IonIcon, IonCard, IonCardContent, IonText, IonImg, IonProgressBar } from '@ionic/react';
import { cloudUploadOutline, imageOutline } from 'ionicons/icons';
import { azureConfig } from '../../../queries/manage-menu/useStorage';

interface LogoProps {
  logo?: string;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Logo: React.FC<LogoProps> = ({ logo, handleLogoUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress < 90 ? newProgress : 90;
      });
    }, 200);

    try {
      await handleLogoUpload(event);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className='ion-padding'>
      <IonCard>
        <IonCardContent className='ion-text-center'>
          {logo ? (
            <div className='ion-margin-bottom ion-padding-bottom'>
              <IonImg
                src={logo}
                alt='Restaurant Logo'
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  margin: '0 auto',
                  borderRadius: '8px',
                }}
              />
            </div>
          ) : (
            <div className='ion-margin-bottom ion-padding'>
              <IonIcon icon={imageOutline} style={{ fontSize: '80px', color: 'var(--ion-color-medium)' }} />
              <IonText color='medium' className='ion-padding-top'>
                <p>No logo uploaded</p>
              </IonText>
            </div>
          )}

          <input
            ref={fileInputRef}
            type='file'
            accept={azureConfig.allowedFileTypes.join(',')}
            onChange={handleFileUpload}
            hidden
          />

          {uploading && (
            <div className='ion-margin-vertical ion-padding-top'>
              <IonText color='medium' className='ion-text-center'>
                <p className='ion-no-margin'>Uploading... {Math.round(uploadProgress)}%</p>
              </IonText>
              <IonProgressBar value={uploadProgress / 100} color='primary'></IonProgressBar>
            </div>
          )}

          <IonButton onClick={handleUploadClick} className='ion-margin-top solid-button ' disabled={uploading}>
            <IonIcon slot='start' icon={cloudUploadOutline} color='light' />
            {logo ? 'Change Logo' : 'Upload Logo'}
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Logo;
