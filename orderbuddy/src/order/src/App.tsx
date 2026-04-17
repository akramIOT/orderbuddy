import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import ErrorBoundary from './services/ErrorBoundary';

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

import './theme/variables.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EntryPage from './pages/entry/EntryPage';
import MenuPage from './pages/menu/MenuPage';
import CartPage from './pages/cart/Cart';
import CheckoutPage from './pages/checkout/checkoutPage';
import StatusPage from './pages/status/Status';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TermsPage from './pages/terms/Terms';
import PrivacyPage from './pages/privacy/Privacy';
import ErrorPage from './pages/error/ErrorPage';
import MenusPage from './pages/menus/MenusPage';
import LogTestPage from './pages/test/LogTestPage';
import '../style.css';
setupIonicReact();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Add custom retry logic if needed
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <IonApp className='mobile-container'>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route exact path='/entry/:originId' component={EntryPage} />
              <Route exact path='/menus/:restaurantId/:locationSlug/:locationId' component={MenusPage} />
              <Route
                exact
                path='/menu/:restaurantId/:locationSlug/:locationId/:menuSlug/:menuId'
                component={MenuPage}
              />
              <Route
                exact
                path='/cart/:restaurantId/:locationSlug/:locationId/:menuSlug/:menuId'
                component={CartPage}
              />
              <Route
                exact
                path='/checkout/:restaurantId/:locationSlug/:locationId/:menuSlug/:menuId/:previewOrderId'
                component={CheckoutPage}
              />
              <Route exact path='/status/:restaurantId/:orderId' component={StatusPage} />
              <Route exact path='/terms' component={TermsPage} />
              <Route exact path='/privacy' component={PrivacyPage} />
              <Route exact path='/error' component={ErrorPage} />
              {/* Only include test routes in development mode */}
              {/* {import.meta.env.DEV && (
                <Route exact path='/test-logging' component={LogTestPage} />
              )} */}
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
