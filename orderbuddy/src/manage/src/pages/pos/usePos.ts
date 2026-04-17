import { useMenus, MenusResponse } from '../../queries/pos/useMenus';
import { fetchMenuById } from '../../queries/pos/useMenu';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useIonToast } from '@ionic/react';
import { axiosInstance } from '../../queries/axiosInstance';
import { ApiResponse } from '../../queries/api-response';
import _ from 'lodash';
import { useQueries } from '@tanstack/react-query';
import { MenuItemType } from '../../types/menu';
import { appStore } from '../../store';
import { useCreateOrder } from '../../queries/pos/useCreateOrder';

export interface Menu {
  _id: string;
  name: {
    en: string;
    es: string;
    pt: string;
  };

  imageUrls?: string[] | null;
  isAvailable?: boolean | null;
  items: MenuItemType[];
  categories?: Array<{
    id: string;
    name: {
      en: string;
      es: string;
      pt: string;
    };
    description: {
      en: string;
      es: string;
      pt: string;
    };
    sortOrder: number;
    emoji?: string | null;
  }> | null;
}

export interface CustomerData {
  name: string;
  phone: string;
  getSms: boolean;
}
export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  notes?: string;
  variants: Array<{
    id: string;
    name: string;
    priceCents: number;
  }>;
  modifiers: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      priceCents: number;
    }>;
  }>;
  stationTags: string[];
};
export const usePos = () => {
  const { restaurantId = '', locationId = '' } = useParams<{
    restaurantId: string;
    locationId: string;
  }>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [present] = useIonToast();
  const createOrderMutation = useCreateOrder();
  const locationSlug = appStore((state) => state.selection.location.locationSlug);

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    getSms: false,
  });

  const onCustomerDataChange = (data: CustomerData) => {
    setCustomerData(data);
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };
  const { data: menusData, isLoading: isLoadingMenus, error: menusError } = useMenus(restaurantId, locationId);
  const menuQueries = useQueries({
    queries: (menusData ?? []).map((menu) => ({
      queryKey: ['posmenuitem', menu._id],
      queryFn: () => fetchMenuById(restaurantId, locationId, menu._id),
      enabled: !!menusData,
      staleTime: 1000 * 60 * 10, 
    })),
  });

  const menusMap = menuQueries.reduce((acc, query) => {
    if (query.data) {
      acc[query.data._id] = query.data;
    }
    return acc;
  }, {} as Record<string, Menu>);
  const addOrderItem = (orderItem: OrderItem) => {
    setOrderItems((prev) => [...prev, orderItem]);
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomerData({
      name: '',
      phone: '',
      getSms: false,
    });
  };

  const placeOrder = async () => {
    const orderItemsDetails = orderItems.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      notes: item.notes,
      variants:
        item.variants?.map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceCents: variant.priceCents,
        })) || [],
      modifiers:
        item.modifiers?.map((mod) => ({
          id: mod.id,
          name: mod.name,
          options:
            mod.options?.map((option) => ({
              id: option.id,
              name: option.name,
              priceCents: option.priceCents,
            })) || [],
        })) || [],
      stationTags: item.stationTags,
    }));

    const createOrder = {
      restaurantId: restaurantId,
      locationId: locationId,
      locationSlug: locationSlug,
      paymentId: '',
      origin: { id: '', name: 'pos' },
      customer: {
        name: customerData.name,
        phone: customerData.phone,
      },
      items: orderItemsDetails,
      getSms: customerData.getSms,
    };

    try {
      const orderId = await createOrderMutation.mutateAsync(createOrder);
      clearOrder(); 
      present({
        message: `Order placed successfully! Order ID: ${orderId}`,
        duration: 3000,
        color: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      present({
        message: 'Failed to place order.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
    }
  };
  return {
    menus: menusData || [],
    menusMap,
    isLoadingMenus,
    addOrderItem,
    orderItems,
    removeOrderItem,
    onCustomerDataChange,
    placeOrder,
    clearOrder,
  };
};
