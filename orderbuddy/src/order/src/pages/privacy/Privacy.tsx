import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react'

const PrivacyPage = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Privacy Policy</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Effective Date: March, 01 2025</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Welcome to <strong>OrderBuddy</strong>. This Privacy Policy explains how we collect, use, disclose, and
              protect your information when you use our services at{' '}
              <a href="https://menu.order-buddy.app">https://menu.order-buddy.app</a>.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>1. Information We Collect</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ul>
              <li>
                <strong>Personal Information:</strong> Name, phone number, email address, and payment details when
                placing an order.
              </li>
              <li>
                <strong>Usage Data:</strong> Information on how you interact with our website and services.
              </li>
              <li>
                <strong>SMS Data:</strong> Messages sent via our notification service, including order updates and
                status.
              </li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>2. How We Use Your Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ul>
              <li>To process and manage orders.</li>
              <li>To send SMS notifications regarding order status.</li>
              <li>To improve and personalize user experience.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>3. Sharing of Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>We do not sell or rent your personal information. However, we may share it with:</p>
            <ul>
              <li>Service providers (e.g., payment processors, Twilio for SMS notifications).</li>
              <li>Law enforcement if required by law.</li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>4. Opt-Out and Data Control</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              You can opt out of SMS notifications at any time by replying <strong>STOP</strong>. You may also request
              data deletion by contacting support.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>5. Security Measures</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              We implement security measures to protect your data, including encryption and secure payment processing.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>6. Changes to This Policy</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
              effective date.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>7. Contact Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              📧 <strong>Email:</strong> ob-support@advancedautomations.tech
            </p>
            <p>
              📞 <strong>Phone:</strong> 206-338-2098
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </>
  )
}

export default PrivacyPage
