import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonContent, IonRouterOutlet, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Azure Application Insights for error logging */
import { initAppInsights } from './services/appInsightsService';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import './theme/variables.css';
import { Suspense, useEffect, useState } from 'react';
import PWAPrompt from 'react-ios-pwa-prompt';
import PWAInstallPrompt from './pwa';
import React from 'react';

import RootPage from './root';

import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import Passwordless from 'supertokens-web-js/recipe/passwordless';

import ErrorBoundary from './services/ErrorBoundary';
import LoginPage from './pages/login/login';
import { checkSessionStatus } from './pages/checksession';
import StationsPage from './pages/stations/stations';
import RestaurantsPage from './pages/restaurants-page/RestaurantsPage';
import LocationsPage from './pages/location-page/LocationsPage';
import OriginsPage from './pages/origin-page/OriginPage';
import { MenuListPage } from './pages/menu-page/MenuListPage';
import { MenuCategoriesPage } from './pages/menu-page/MenuCategoryPage';
import { MenuItemsPage } from './pages/menu-page/MenuItemsPage';
import { ManageMenuItem } from './pages/menu-page/ManageMenuItem';
import LaunchPadPage from './pages/launch-pad/LaunchPadPage';
import IndividualKdsPage from './pages/kds/individual-kds/individualKds';
import KdsPage from './pages/kds/kds';
import PrintersPage from './pages/printers/PrintersPage';
import OrdersPage from './pages/orders-page/OrdersPage';
import HistoryPage from './pages/order-history/OrderHistoryPage';
import LocationSettingsPage from './pages/location-settings/LocationSettingsPage';
import SalesSummaryReport from './pages/sales-report/SalesSummaryPage';
import SalesItemPage from './pages/sales-item/SalesItemPage';
import SalesOriginPage from './pages/sales-origin/SalesOriginPage';
import PosPage from './pages/pos/PosPage';
import RestaurantSettingsPage from './pages/restaurant-settings/RestaurantSettingsPage';
import CampaignPage from './pages/campaign/CampaignPage';


setupIonicReact();
const apiEndPoint = import.meta.env.VITE_API_ENDPOINT as string;
initAppInsights();

SuperTokens.init({
  appInfo: {
    apiDomain: apiEndPoint,
    apiBasePath: '/login',
    appName: 'OrderBuddy',
  },
  recipeList: [Session.init(), Passwordless.init({})],
});
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const hasSession = await checkSessionStatus();
        setIsAuthenticated(hasSession);
      } catch (error) {
        console.error('Session verification failed:', error);
        // Log authentication errors to Application Insights
        if (error instanceof Error) {
          import('./services/appInsightsService').then(({ logException }) => {
            logException(error, { 
              context: 'Authentication', 
              status: 'Failed',
              path: window.location.pathname
            });
          });
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
    
    // Track route changes
    const handleRouteChange = () => {
      import('./services/appInsightsService').then(({ logPageView }) => {
        logPageView(
          document.title || window.location.pathname,
          window.location.pathname,
          { referrer: document.referrer }
        );
      });
    };
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  if (isLoading) {
    return (
      <IonApp>
        <IonContent className='ion-padding ion-text-center'>
          <IonSpinner />
        </IonContent>
      </IonApp>
    );
  }

  return (
    <ErrorBoundary>
      <IonApp style={{ userSelect: 'none' }}>
        <Suspense fallback={<IonSpinner />}>
          <IonReactRouter>
            <IonRouterOutlet>
              <Switch>
              {/* Login route - only accessible when logged out */}
              {/* //todo refactor */}
              <Route
                exact
                path='/login'
                render={() => (isAuthenticated ? <Redirect to='/root-page' /> : <LoginPage />)}
              />

              {/* Protected routes */}
              <Route
                path='/:restaurantId/:locationId/launch-pad'
                render={(props) => (isAuthenticated ? <LaunchPadPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/:restaurantId/:locationId/apps/orders'
                render={(props) => (isAuthenticated ? <OrdersPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/restaurants'
                render={(props) => (isAuthenticated ? <RestaurantsPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/locations'
                render={(props) => {
                  return isAuthenticated ? <LocationsPage /> : <Redirect to='/login' />;
                }}
              />
              <Route
                path='/:restaurantId/:locationId/apps/kds'
                render={(props) => (isAuthenticated ? <KdsPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/:restaurantId/:locationId/apps/stations'
                render={(props) => (isAuthenticated ? <StationsPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/:restaurantId/:locationId/apps/printers'
                render={(props) => (isAuthenticated ? <PrintersPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/menu/list'
                render={(props) => (isAuthenticated ? <MenuListPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/:restaurantId/:locationId/apps/menu/:menuId/categories'
                render={(props) => (isAuthenticated ? <MenuCategoriesPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/menu/:menuId/:categoryId/items/:itemId'
                render={(props) => (isAuthenticated ? <ManageMenuItem /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/menu/:menuId/:categoryId/items'
                render={(props) => (isAuthenticated ? <MenuItemsPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/root-page'
                render={(props) => (isAuthenticated ? <RootPage /> : <Redirect to='/login' />)}
              />

              <Route exact path='/:restaurantId/:locationId/apps/station/:stationId' component={IndividualKdsPage} />

              <Route
                path='/:restaurantId/:locationId/apps/origins'
                render={(props) => (isAuthenticated ? <OriginsPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/order_history'
                render={(props) => (isAuthenticated ? <HistoryPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/location-settings'
                render={(props) => (isAuthenticated ? <LocationSettingsPage /> : <Redirect to='/login' />)}
              />
                <Route
                path='/:restaurantId/:locationId/apps/sales_reports'
                render={(props) => (isAuthenticated ? <SalesSummaryReport /> : <Redirect to='/login' />)}
              />
                 <Route
                path='/:restaurantId/:locationId/apps/sales_item'
                render={(props) => (isAuthenticated ? <SalesItemPage /> : <Redirect to='/login' />)}
              />
              <Route
                path='/:restaurantId/:locationId/apps/sales_origin'
                render={(props) => (isAuthenticated ? <SalesOriginPage /> : <Redirect to='/login' />)}
              />
                 <Route
                path='/:restaurantId/:locationId/apps/pos'
                render={(props) => (isAuthenticated ? <PosPage /> : <Redirect to='/login' />)}
              />

              <Route
                path='/:restaurantId/apps/restaurant-settings'
                render={(props) => (isAuthenticated ? <RestaurantSettingsPage /> : <Redirect to='/login' />)}
              />
                  <Route
                path='/:restaurantId/:locationId/apps/campaign'
                render={(props) => (isAuthenticated ? <CampaignPage /> : <Redirect to='/login' />)}
              />
              <Route render={() => <Redirect to={isAuthenticated ? '/root-page' : '/login'} />} />
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </Suspense>
      <PWAInstallPrompt />
      <PWAPrompt />
    </IonApp>
    </ErrorBoundary>
  );
};
export default App;
