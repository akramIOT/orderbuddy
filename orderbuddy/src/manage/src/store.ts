import { create } from 'zustand';
import { produce } from 'immer';
import _ from 'lodash';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Menu = {
  _id: string;
  menu: {
    addOns: AddOn[];
    categories: CategoryItem[];
    displays: Display[];
    items: MenuItem[];
    toppings: ToppingItem[];
  };
};

export type CategoryItem = {
  id: string;
  name: string;
  description: string;
  sequence: number;
};
export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  price: number;
  imageUrl: string;
  description: string;
  toppingsAllowed: string[];
  // maxToppingsAllowed: number //changed to freeToppingsAllowed
  freeToppingsAllowed: number;
  displayIds: string[];
  addOnsAllowed: string[];
  // maxAddOnsAllowed: number //changed to maxAddOnAllowed
  maxAddOnAllowed: number;

  sizes: Size[];
};
export interface Size {
  size: string;
  price: number;
  imageUrl: string;
}
export type ToppingItem = {
  id: string;
  name: string;
};
export type AddOn = {
  id: string;
  name: string;
  price: number;
};
export type Display = {
  id: string;
  name: string;
};

export type editMenuItem = {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  price: number;
  imageUrl: string;
  description: string;
  toppingsAllowed: string[];
  freeToppingsAllowed: number;
  displayIds: string[];
  addOnsAllowed: string[];
  maxAddOnAllowed: number;

  sizes: Size[];
};
export interface order_item_started {
  orderId: string;
  itemId: string;
  startedBoolean: boolean;
}
export interface order_item_completed {
  orderId: string;
  itemId: string;
  startedBoolean: boolean;
}

export interface order_ready_for_pickup {
  orderId: string;
  startedBoolean?: boolean;
}

export interface order_completed {
  orderId: string;
  startedBoolean?: boolean;
}

export interface Store {
  id: string;
  name: string;
}

export type Order = {
  _id: string;
  origin: Origin;
  customer: Customer;
  items: OrderItem[];
  orderItemCount: number;
  startedAt: string;
  waitTimeInMinutes: number;
  status: string;
  totalPriceCents: number;
  endedAt?: string;
  isDelayed: boolean;
  hasChanged: boolean;
  isTakeaway: boolean;
  hasCompleted: boolean;
};
export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  toppings: string[];
  isStarted: boolean;
  isCompleted: boolean;
  completedAt: Date;
  notes: string;
  size: string;
  isTakeaway: boolean;
  addons: string[];
  inProgress: boolean;
};
export type Customer = {
  name: string;
  phone: string;
};
export type Origin = {
  id: string;
  name: string;
};
type State = {
  selection: {
    restaurant: {
      name?: string;
      logo?: string;
    };
    location: {
      name?: string;
      locationSlug?: string;
    };
  };
  printers: {
    id: string;
    name: string;
    ip: string;
    type: string;
  }[];
  authToken: string;
  order_ready_for_pickup: order_ready_for_pickup;
  order_completed: order_completed;
};

type Action = {
  setAuthToken: (token: string) => void;

  setOrderReadyForPickup: (value: order_ready_for_pickup) => void;
  setOrderReadyForPickupBoolean: (value: boolean) => void;

  setOrderCompleted: (value: order_completed) => void;
  setOrderCompletedBoolean: (value: boolean) => void;

  setRestaurantName: (name: string) => void;
  setLocationName: (name: string) => void;
  setRestaurantLogo: (logo: string) => void;
  setPrinters: (printers: State['printers']) => void;
  setLocationSlug: (locationSlug: string) => void;

  reset: () => void;
};
const initialState: State = {
  selection: {
    restaurant: {
      name: '',
      logo: '',
    },
    location: {
      name: '',
      locationSlug: '',
    },
  },
  authToken: '',
  order_ready_for_pickup: {
    orderId: '',
    startedBoolean: false,
  },
  order_completed: {
    orderId: '',
    startedBoolean: false,
  },
  printers: [],
};

export const appStore = create<State & Action>()(
  persist(
    (set) => ({
      ...initialState,
      authToken: '',
      order_ready_for_pickup: {
        orderId: '',
        startedBoolean: false,
      },
      order_completed: {
        orderId: '',
        startedBoolean: false,
      },
      

      reset: () => {
        set(initialState);
      },
      setRestaurantLogo: (logo: string) => {
        set(
          produce((state: State) => {
            state.selection.restaurant.logo = logo;
          }),
        );
      },
      setAuthToken(token: string) {
        set(
          produce((state: State) => {
            state.authToken = token;
          }),
        );
      },

      setLocationSlug: (locationSlug: string) => {
        set(
          produce((state: State) => {
            state.selection.location.locationSlug = locationSlug;
          }),
        );
      },
      setRestaurantName: (name: string) => {
        set(
          produce((state: State) => {
            state.selection.restaurant.name = name;
          }),
        );
      },
      setLocationName: (name: string) => {
        set(
          produce((state: State) => {
            state.selection.location.name = name;
          }),
        );
      },
      setOrderReadyForPickup(value: order_ready_for_pickup) {
        set(
          produce((state: State) => {
            state.order_ready_for_pickup.orderId = value.orderId;
            state.order_ready_for_pickup.startedBoolean = value.startedBoolean;
          }),
        );
      },
      setOrderReadyForPickupBoolean(value: boolean) {
        set(
          produce((state: State) => {
            state.order_ready_for_pickup.startedBoolean = value;
          }),
        );
      },

      setOrderCompleted(value: order_completed) {
        set(
          produce((state: State) => {
            state.order_completed.orderId = value.orderId;
            state.order_completed.startedBoolean = value.startedBoolean;
          }),
        );
      },

      setOrderCompletedBoolean(value: boolean) {
        set(
          produce((state: State) => {
            state.order_completed.startedBoolean = value;
          }),
        );
      },
      setPrinters: (printers: State['printers']) => {
        set(
          produce((state: State) => {
            state.printers = printers;
          }),
        );
      },
    }),

    {
      name: 'storev2-session-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
