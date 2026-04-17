import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/react'

const TermsPage: React.FC = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>OrderBuddy Terms of Service</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Effective Date: March, 01 2025</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Welcome to <strong>OrderBuddy</strong>! These Terms of Service ("Terms") govern your use of our website,{' '}
              <a href="https://menu.order-buddy.app">https://menu.order-buddy.app</a>, and our SMS notification service.
              By using OrderBuddy, you agree to these Terms.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>1. Acceptance of Terms</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              By accessing or using OrderBuddy, you acknowledge that you have read, understood, and agree to be bound by
              these Terms. If you do not agree, please do not use our services.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>2. Service Description</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              OrderBuddy provides an online ordering platform for restaurants, allowing users to place food orders and
              receive SMS notifications regarding their order status.
            </p>
            <ul>
              <li>Order confirmation messages</li>
              <li>Order preparation updates</li>
              <li>Ready-for-pickup alerts</li>
              <li>Order cancellation or refund notifications</li>
              <li>Reminder messages for pending pickups</li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>3. SMS Notification Service</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>3.1 Opt-In Methods</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <p>
                  By using OrderBuddy, you agree to receive SMS notifications related to your orders. You can opt in
                  through the following methods:
                </p>
                <ul>
                  <li>
                    <strong>Website Opt-In:</strong> By providing your phone number at checkout and checking the box to
                    receive order updates.
                  </li>
                  <li>
                    <strong>SMS Opt-In:</strong> By texting <strong>START</strong> to{' '}
                    <strong>[Your Twilio Phone Number]</strong> to subscribe.
                  </li>
                  <li>
                    <strong>Account Opt-In:</strong> By opting in through your OrderBuddy account settings (if
                    applicable).
                  </li>
                </ul>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>3.2 Opt-In Keywords</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <p>
                  Users can opt in to receive order notifications by texting <strong>START</strong>,{' '}
                  <strong>SUBSCRIBE</strong>, or <strong>ORDERUP</strong> to <strong>[Your Twilio Phone Number]</strong>
                  .
                </p>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>3.3 Opt-In Message</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <p>
                  <em>
                    "Thank you for subscribing to OrderBuddy order notifications! You’ll receive updates on your orders.
                    Reply STOP to unsubscribe or HELP for support. View our Terms:{' '}
                    <a href="https://menu.order-buddy.app/terms">https://menu.order-buddy.app/terms</a>"
                  </em>
                </p>
              </IonCardContent>
            </IonCard>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>4. User Responsibilities</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ul>
              <li>You must provide accurate and up-to-date information when using OrderBuddy.</li>
              <li>You agree not to misuse the service for fraudulent, illegal, or unauthorized purposes.</li>
              <li>
                You understand that OrderBuddy is not responsible for delayed or undelivered SMS notifications due to
                carrier restrictions or service outages.
              </li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>5. Privacy Policy</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Your privacy is important to us. By using OrderBuddy, you agree to our{' '}
              <a href="https://menu.order-buddy.app/privacy-policy">Privacy Policy</a>, which explains how we collect,
              use, and protect your personal information.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>6. Changes to Terms</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              OrderBuddy reserves the right to update these Terms at any time. Changes will be posted on this page with
              the updated effective date. Your continued use of the service after updates constitutes acceptance of the
              new Terms.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>7. Contact Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>For questions or concerns regarding these Terms, please contact us at:</p>
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

export default TermsPage
