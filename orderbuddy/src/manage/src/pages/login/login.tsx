import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  useIonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonCard,
  IonText,
} from '@ionic/react';
import { useState } from 'react';
import { mailOutline, phonePortraitOutline } from 'ionicons/icons';
import { createCode, consumeCode, clearLoginAttemptInfo } from 'supertokens-web-js/recipe/passwordless';
import { createUserApi } from '../../queries/useUser';
import { logExceptionError } from '../../utils/errorLogger';
import '../../../style.css';
import AppInsightsTester from '../../components/AppInsightsTester';


type AuthMethod = 'phone' | 'email';

const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [present] = useIonToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await createCode(
        authMethod === 'phone'
          ? {
              phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
            }
          : { email }
      );

      if (response.status === 'SIGN_IN_UP_NOT_ALLOWED') {
        console.error('Sign in/up not allowed');
        present({
          message: response.reason,
          duration: 3000,
          color: 'danger',
        });
      } else {
        present({
          message: `Verification code sent to your ${authMethod}!`,
          duration: 3000,
          color: 'success',
        });
        setShowOtpInput(true);
      }
    } catch (err: any) {
      logExceptionError(
        err instanceof Error ? err : new Error(String(err)),
        'login.handleLogin',
        { authMethod, phoneNumber: authMethod === 'phone' ? phoneNumber : undefined, email: authMethod === 'email' ? email : undefined }
      );
      present({
        message: err.isSuperTokensGeneralError ? err.message : 'Something went wrong',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    setLoading(true);
    try {
      const response = await consumeCode({
        userInputCode: otp,
      });

      if (response.status === 'OK') {
        await clearLoginAttemptInfo();

        // If this is a new user, create user record
        if (response.createdNewRecipeUser) {
          try {
            const userData = {
              userId: response.user.id,
              createdAt: response.user.timeJoined,
              ...(authMethod === 'email' && response.user.emails[0] && { email: response.user.emails[0] }),
              ...(authMethod === 'phone' &&
                response.user.phoneNumbers[0] && {
                  phoneNumber: response.user.phoneNumbers[0],
                }),
            };

            await createUserApi(userData);

            present({
              message: 'Sign up successful!',
              duration: 2000,
              color: 'success',
            });
          } catch (error) {
            logExceptionError(
              error instanceof Error ? error : new Error(String(error)),
              'login.createUserApi',
              { userId: response.user.id, authMethod }
            );
            console.error('Failed to create user:', error);
            present({
              message: 'Account created but profile setup failed',
              duration: 3000,
              color: 'warning',
            });
          }
        } else {
          present({
            message: 'Login successful!',
            duration: 2000,
            color: 'success',
          });
        }

        window.location.assign('/root-page');
      } else if (response.status === 'INCORRECT_USER_INPUT_CODE_ERROR') {
        present({
          message: `Wrong OTP! Attempts left: ${
            response.maximumCodeInputAttempts - response.failedCodeInputAttemptCount
          }`,
          duration: 3000,
          color: 'warning',
        });
      } else if (response.status === 'EXPIRED_USER_INPUT_CODE_ERROR') {
        await clearLoginAttemptInfo();
        present({
          message: 'OTP expired. Please request a new code',
          duration: 3000,
          color: 'danger',
        });
        setShowOtpInput(false);
      } else {
        await clearLoginAttemptInfo();
        present({
          message: 'Login failed. Please try again',
          duration: 3000,
          color: 'danger',
        });
        setShowOtpInput(false);
      }
    } catch (err: any) {
      logExceptionError(
        err instanceof Error ? err : new Error(String(err)),
        'login.handleOTPVerification',
        { authMethod, otpLength: otp.length }
      );
      present({
        message: err.isSuperTokensGeneralError ? err.message : 'Something went wrong',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setShowOtpInput(false);
    setOtp('');
    clearLoginAttemptInfo();
  };

  return (
    <IonPage>
      <IonContent className='ion-padding'>
        {/* <div>
          <AppInsightsTester />
        </div> */}
        <div className='login-container'>
          <IonCard className='auth-card'>
            <h3>
              <IonText>Welcome to OrderBuddy</IonText>
            </h3>
            <p>Choose your authentication method</p>

            <IonSegment
              value={authMethod}
              onIonChange={(e) => handleAuthMethodChange(e.detail.value as AuthMethod)}
              className='auth-segment'
            >
              <IonSegmentButton value='phone'>
                <IonIcon icon={phonePortraitOutline} />
                <IonLabel>Phone</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value='email'>
                <IonIcon icon={mailOutline} />
                <IonLabel>Email</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <IonGrid>
              <IonRow>
                <IonCol>
                  {!showOtpInput ? (
                    <>
                      <IonItem>
                        <IonLabel position='stacked'>
                          {authMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                        </IonLabel>
                        <IonInput
                          type={authMethod === 'phone' ? 'tel' : 'email'}
                          placeholder={authMethod === 'phone' ? '+1234567890' : 'you@example.com'}
                          value={authMethod === 'phone' ? phoneNumber : email}
                          onIonChange={(e) =>
                            authMethod === 'phone' ? setPhoneNumber(e.detail.value!) : setEmail(e.detail.value!)
                          }
                          enterKeyHint='send'
                          onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                              const canSubmit = authMethod === 'phone' ? phoneNumber : email;
                              if (canSubmit && !loading) {
                                handleLogin();
                              }
                            }
                          }}
                        />
                      </IonItem>

                      <IonButton
                        fill='solid'
                        expand='block'
                        className='ion-margin-top solid-button'
                        onClick={handleLogin}
                        disabled={(authMethod === 'phone' ? !phoneNumber : !email) || loading}
                      >
                        {loading ? 'Sending...' : 'Send Code'}
                      </IonButton>
                    </>
                  ) : (
                    <div className='otp-container'>
                      <p className='verification-sent'>
                        Verification code sent to <strong>{authMethod === 'phone' ? phoneNumber : email}</strong>
                      </p>

                      <IonItem>
                        <IonLabel position='stacked'>Enter Verification Code</IonLabel>
                        <IonInput
                          type='number'
                          placeholder='Enter code'
                          value={otp}
                          onIonChange={(e) => setOtp(e.detail.value!)}
                          class='otp-input'
                          enterKeyHint='done'
                          onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                              if (otp && !loading) {
                                handleOTPVerification();
                              }
                            }
                          }}
                        />
                      </IonItem>

                      <IonButton
                        fill='solid'
                        expand='block'
                        className='ion-margin-top solid-button'
                        onClick={handleOTPVerification}
                        disabled={!otp || loading}
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </IonButton>

                      <IonButton
                        expand='block'
                        fill='clear'
                        className='ion-margin-top resend-button'
                        onClick={() => {
                          clearLoginAttemptInfo();
                          setShowOtpInput(false);
                          setOtp('');
                        }}
                      >
                        Request New Code
                      </IonButton>
                    </div>
                  )}
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
