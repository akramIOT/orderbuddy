import { logExceptionError } from '../utils/errorLogger';

const assertParam = (name: string, value: string | undefined | null) => {
  if (!value || value.trim() === '') {
    const error = new Error(`Missing or invalid route param: ${name}`);

    // Log to Application Insights with application context
    logExceptionError(error, 'RouteParamValidation', {
      paramName: name,
      paramValue: value,
      stack: new Error().stack,
    });

    throw error;
  }
};

export const Paths = {
  entry: (restaurantId: string, locationSlug: string, locationId: string): string => {
    assertParam('restaurantId', restaurantId);
    assertParam('locationSlug', locationSlug);
    assertParam('locationId', locationId);

    return `/entry/${restaurantId}/${locationSlug}/${locationId}`;
  },
  menu: (
    restaurantId: string,
    locationSlug: string,
    locationId: string,
    menuSlug: string,
    menuId: string,
    originId: string,
  ): string => {
    assertParam('restaurantId', restaurantId);
    assertParam('locationSlug', locationSlug);
    assertParam('locationId', locationId);
    assertParam('menuSlug', menuSlug);
    assertParam('menuId', menuId);
    assertParam('originId', originId);

    return `/menu/${restaurantId}/${locationSlug}/${locationId}/${menuSlug}/${menuId}?originId=${originId}`;
  },
  menus(restaurantId: string, locationSlug: string, locationId: string, originId: string): string {
    assertParam('restaurantId', restaurantId);
    assertParam('locationSlug', locationSlug);
    assertParam('locationId', locationId);
    assertParam('originId', originId);

    return `/menus/${restaurantId}/${locationSlug}/${locationId}?originId=${encodeURIComponent(originId)}`;
  },
  cart: (
    restaurantId: string,
    locationSlug: string,
    locationId: string,
    menuSlug: string,
    menuId: string,
    originId: string,
  ): string => {
    assertParam('restaurantId', restaurantId);
    assertParam('locationSlug', locationSlug);
    assertParam('locationId', locationId);
    assertParam('menuSlug', menuSlug);
    assertParam('menuId', menuId);
    assertParam('originId', originId);

    return `/cart/${restaurantId}/${locationSlug}/${locationId}/${menuSlug}/${menuId}?originId=${originId}`;
  },
  status: (restaurantId: string, orderId: string): string => {
    assertParam('restaurantId', restaurantId);
    assertParam('orderId', orderId);

    return `/status/${restaurantId}/${orderId}`;
  },
  checkout: (
    restaurantId: string,
    locationSlug: string,
    locationId: string,
    menuSlug: string,
    menuId: string,
    previewOrderId: string,
    originId: string,
  ): string => {
    assertParam('restaurantId', restaurantId);
    assertParam('locationSlug', locationSlug);
    assertParam('locationId', locationId);
    assertParam('menuSlug', menuSlug);
    assertParam('menuId', menuId);
    assertParam('previewOrderId', previewOrderId);
    assertParam('originId', originId);

    return `/checkout/${restaurantId}/${locationSlug}/${locationId}/${menuSlug}/${menuId}/${previewOrderId}?originId=${originId}`;
  },
  terms: (): string => '/terms',
  privacy: (): string => '/privacy',
  error: (): string => '/error',
};
