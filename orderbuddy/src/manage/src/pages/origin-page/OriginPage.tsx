import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IoDownloadOutline } from 'react-icons/io5';
import { BsQrCodeScan } from 'react-icons/bs';

import {
  IonCard,
  IonInput,
  IonButton,
  IonCardHeader,
  IonGrid,
  IonRow,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonToolbar,
  IonPage,
  IonIcon,
  IonSpinner,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonCol,
  IonPopover,
  IonText,
  IonFabButton,
  useIonToast,
} from '@ionic/react';
import { Link, useParams } from 'react-router-dom';
import { add, mailOutline, qrCodeOutline } from 'ionicons/icons';
import ColorPicker from 'react-pick-color';
import QRCodeStyling, {
  Options,
  DrawType,
  TypeNumber,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
} from 'qr-code-styling';
import { Origin, useOrigins } from '../../queries/origin/useOrigin';
import { useUpdateQrStyle } from '../../queries/origin/useQrcode';
import LaunchPadNavBar from '../../components/LanunchpadNavBar';
import AddOriginModal from './components/AddOriginPage';
import { appStore } from '../../store';
import { logExceptionError } from '../../utils/errorLogger';
import { useSendQrCodeLink } from './OriginPageQuery';

interface station {
  _id: string;
  stations: stationItem[];
  qrCodeImage: string;
  qrCodeStyle: any;
}

interface stationItem {
  id: string;
  name: string;
  qrCode: string;
  qrcodeImage: string;
  url: string;
}
const schema = z.object({
  stationName: z.string().min(1),
});
type FormFields = z.infer<typeof schema>;

const OriginsPage: React.FC = () => {
  const styleModal = useRef<HTMLIonModalElement>(null);
  const { restaurantId, locationId } = useParams<{ restaurantId: string; locationId: string }>();
  const { data: origins, isLoading } = useOrigins(restaurantId, locationId);
  const updateQrStyle = useUpdateQrStyle(restaurantId, locationId);
  const sendQrCodeLink = useSendQrCodeLink(restaurantId, locationId);
  const [presentToast] = useIonToast();
  const smartScanUrl = import.meta.env.VITE_SMART_SCAN_URL;
  // const appState = appStore()
  const [colors, setColor] = useState('#fff');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const restaurantLogo =
    appStore((state) => state.selection.restaurant.logo) || 'https://order.orderbuddyapp.com/logo.png';

  useEffect(() => {
    // Update options with QR code style from origins data if available
    if (origins && origins.qrCodeStyle) {
      const qrStyle = origins.qrCodeStyle;

      setOptions((prev) => ({
        ...prev,
        cornersSquareOptions: {
          color: qrStyle.cornersSquareOptions?.color || '#222222',
          type: (qrStyle.cornersSquareOptions?.type || 'extra-rounded') as CornerSquareType,
        },
        cornersDotOptions: {
          color: qrStyle.cornersDotOptions?.color || '#222222',
          type: (qrStyle.cornersDotOptions?.type || 'dot') as CornerDotType,
        },
        // Also update other style options if needed
      }));
    }
  }, [origins]);

  const [options, setOptions] = useState<Options>({
    width: 200,
    height: 200,
    type: 'svg' as DrawType,
    data: 'https://order.orderbuddyapp.com/',
    margin: 10,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      errorCorrectionLevel: 'H' as ErrorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.6,
      margin: 1,
      crossOrigin: 'anonymous',
    },
    image: restaurantLogo,

    dotsOptions: {
      color: '#36454F',

      type: 'dots' as DotType,
    },
    backgroundOptions: {
      color: colors,
    },
    cornersSquareOptions: {
      color: (origins && origins.qrCodeStyle?.cornersSquareOptions?.color) || '#222222',
      type: 'extra-rounded' as CornerSquareType,
    },
    cornersDotOptions: {
      color: (origins && origins.qrCodeStyle?.cornersDotOptions?.color) || '#222222',
      type: 'dot' as CornerDotType,
    },
    shape: 'square',
  });
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options);
  }, [qrCode, options]);

  const {
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  });

  // Handler for outer edge color changes
  const onDataOuterEdgeColorChange = (color: string) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      cornersSquareOptions: {
        color: color,
        type: 'extra-rounded' as CornerSquareType,
      },
    }));
  };

  const onDataInnerEdgeColorChange = (color: string) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      cornersDotOptions: {
        color: color,
        type: 'dot' as CornerDotType,
      },
    }));
  };

  const generateQrCode = async (origin: Origin) => {
    const config = { ...(origins?.qrCodeStyle || {}), data: `${smartScanUrl}/${origin.qrCodeId}` };
    const qrCode = new QRCodeStyling({
      ...config,
      type: 'canvas',
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    await qrCode.append(container);

    setTimeout(() => {
      qrCode.download({ extension: 'png', name: origin.label });
      container.remove();
    }, 500);
  };

  // Handler for sending QR code link via email
  const handleSendLink = async (originId: string) => {
    try {
      await sendQrCodeLink.mutateAsync(originId);
      presentToast({
        message: 'QR Code link sent successfully via email',
        duration: 3000,
        position: 'bottom',
        color: 'success',
      });
    } catch (error) {
      presentToast({
        message: 'Failed to send QR Code link via email',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      console.error('Failed to send link:', error);
    }
  };

  async function handleStyleUpdate(event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();
    if (!ref.current) return;
    try {
      await updateQrStyle.mutateAsync({
        options,
        ref: { current: ref.current },
      });
      styleModal.current?.dismiss();
    } catch (error) {
      logExceptionError(error instanceof Error ? error : new Error(String(error)), 'handleStyleUpdate', {
        restaurantId,
        locationId,
      });
      console.error('Failed to update QR style:', error);
    }
  }
  return (
    <IonPage className='body'>
      <LaunchPadNavBar title='Origins' />
      <IonContent>
        <IonGrid>
          <IonRow className=' ion-align-items-center'>
            <IonCol size='12' className='ion-text-end'>
              <IonButton id='qrcode-style' fill='outline'>
                <IonIcon icon={qrCodeOutline} />
                <IonText className='ion-padding-start'> Style Manager</IonText>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            {isLoading && (
              <div>
                <IonSpinner></IonSpinner>
              </div>
            )}

            {!isLoading &&
              origins?.originData?.map((origin, index) => (
                <IonCol size-sm='6' size-md='3' key={index}>
                  <IonCard key={origin._id} style={{ backgroundColor: 'white', width: '220px' }}>
                    <IonCardHeader className='ion-no-padding ion-padding-start ion-padding-top'>
                      <IonCardTitle className='ion-text-start'>
                        <IonText style={{ fontSize: '14px' }}>{origin.label}</IonText>
                      </IonCardTitle>
                      <IonCardSubtitle className='ion-text-start'>
                        <IonText>{origin.type}</IonText>
                      </IonCardSubtitle>
                    </IonCardHeader>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <img src={origins.qrCodeImage} alt={origin.label}></img>
                    </div>
                    <IonGrid>
                      <IonRow className='ion-justify-content-center'>
                        <IonCol size='12' className='ion-text-center'>
                          <IonButton
                            expand='block'
                            fill='outline'
                            size='small'
                            type='button'
                            onClick={() => handleSendLink(origin._id)}
                          >
                            <IonIcon icon={mailOutline}></IonIcon>
                            <IonText style={{ textTransform: 'Capitalize', paddingLeft: '5px' }}>Link</IonText>
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                  </IonCard>
                </IonCol>
              ))}
          </IonRow>
        </IonGrid>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={() => setIsAddModalOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
          <AddOriginModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </IonFab>
        <IonModal
          ref={styleModal}
          trigger='qrcode-style'
          className='modal-fullscreen'
          onDidPresent={() => {
            if (ref.current) {
              qrCode.append(ref.current);
            }
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot='start'>
                <IonButton onClick={() => styleModal.current?.dismiss()}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className='ion-padding'>
            <IonGrid>
              <IonRow>
                <IonCol size='6' className='ion-text-start'>
                  <IonGrid>
                    <IonRow>Eye color</IonRow>
                    <IonRow>
                      <IonCol size='6'>
                        <IonButton
                          id='outer-ring'
                          style={{ backgroundColor: options.cornersSquareOptions?.color }}
                          size='default'
                          color='default'
                        ></IonButton>
                        <IonInput
                          value={options.cornersSquareOptions?.color}
                          onIonChange={(e) => onDataOuterEdgeColorChange(e.detail.value!)}
                          fill='solid'
                        ></IonInput>
                        <IonPopover trigger='outer-ring' triggerAction='click'>
                          <IonContent style={{ height: '300px' }}>
                            <ColorPicker
                              color={options.cornersSquareOptions?.color || '#222222'}
                              onChange={(color) => onDataOuterEdgeColorChange(color.hex)}
                            />
                          </IonContent>
                        </IonPopover>
                      </IonCol>
                      <IonCol size='6'>
                        <IonButton
                          id='inner-ring'
                          style={{ backgroundColor: options.cornersDotOptions?.color }}
                          size='default'
                          color='default'
                        ></IonButton>
                        <IonInput
                          value={options.cornersDotOptions?.color}
                          onIonChange={(e) => onDataInnerEdgeColorChange(e.detail.value!)}
                          fill='solid'
                        ></IonInput>
                        <IonPopover trigger='inner-ring' triggerAction='click'>
                          <IonContent style={{ height: '300px' }}>
                            <ColorPicker
                              color={options.cornersDotOptions?.color || '#222222'}
                              onChange={(color) => onDataInnerEdgeColorChange(color.hex)}
                            />
                          </IonContent>
                        </IonPopover>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCol>
                <IonCol
                  className='white-background'
                  style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    paddingTop: '40px',
                  }}
                  size='6'
                >
                  <div style={{ fontSize: '14px', textAlign: 'center', color: '#424242' }}>
                    Preview
                    <IonCard className='rounded'>
                      <div ref={ref} />
                    </IonCard>
                    <IonButton
                      onClick={handleStyleUpdate}
                      fill='solid'
                      className='solid-button'
                      style={{ display: 'block', marginTop: '20px' }}
                    >
                      Save
                    </IonButton>
                  </div>
                </IonCol>{' '}
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default OriginsPage;
