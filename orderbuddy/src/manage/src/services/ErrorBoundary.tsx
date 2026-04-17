import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logException } from './appInsightsService';
import { IonContent, IonText, IonButton, IonIcon } from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component to catch React rendering errors
 * Logs errors to Application Insights and displays a fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to Application Insights
    logException(error, {
      componentStack: errorInfo.componentStack,
      source: 'React Error Boundary',
      path: window.location.pathname
    });
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <IonContent className="ion-padding">
          <div className="ion-text-center">
            <h2>Something went wrong</h2>
            <IonText color="medium">
              <p>We're sorry, but an error occurred. Our team has been notified.</p>
            </IonText>
            <IonButton onClick={this.handleRetry} fill="outline">
              <IonIcon icon={refreshOutline} slot="start" />
              Retry
            </IonButton>
            {import.meta.env.DEV && this.state.error && (
              <div className="ion-padding ion-margin-top" style={{ textAlign: 'left' }}>
                <IonText color="danger">
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </IonText>
              </div>
            )}
          </div>
        </IonContent>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
