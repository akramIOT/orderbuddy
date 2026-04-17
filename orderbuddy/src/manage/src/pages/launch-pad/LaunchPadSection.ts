import { MdCampaign, MdOutlineCampaign, MdOutlineDashboard } from 'react-icons/md';
import { LuGitBranchPlus } from 'react-icons/lu';
import { BiFoodMenu } from 'react-icons/bi';
import { TiPrinter } from 'react-icons/ti';
import { qrCodeOutline } from 'ionicons/icons';
import { LaunchPadSection } from './types';
import { GoHistory } from 'react-icons/go';
import { SlLocationPin } from 'react-icons/sl';
import { FaChartBar } from 'react-icons/fa';
import { BiMenuAltLeft } from 'react-icons/bi';
import { MdOutlinePointOfSale } from 'react-icons/md';
import { IoRestaurant } from 'react-icons/io5';
import { ImQrcode } from 'react-icons/im';

export const getLaunchPadConfig = (restaurantId: string, locationId: string): LaunchPadSection[] => [
  {
    name: 'Daily Operations',
    apps: [
      {
        name: 'Orders',
        icon: MdOutlineDashboard,
        link: `/${restaurantId}/${locationId}/apps/orders`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'KDS',
        icon: LuGitBranchPlus,
        link: `/${restaurantId}/${locationId}/apps/kds`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'POS',
        icon: MdOutlinePointOfSale,
        link: `/${restaurantId}/${locationId}/apps/pos`,
        iconProps: {
          size: 32,
        },
      },
    ],
  },
  {
    name: 'Setup and Configuration',
    apps: [
      {
        name: 'Menu',
        icon: BiFoodMenu,
        link: `/${restaurantId}/${locationId}/apps/menu/list`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Origins',
        icon: qrCodeOutline,
        link: `/${restaurantId}/${locationId}/apps/origins`,
        iconProps: {},
        isIonIcon: true,
      },
      {
        name: 'Stations',
        icon: LuGitBranchPlus,
        link: `/${restaurantId}/${locationId}/apps/stations`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Printers',
        icon: TiPrinter,
        link: `/${restaurantId}/${locationId}/apps/printers`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Location',
        icon: SlLocationPin,
        link: `/${restaurantId}/${locationId}/apps/location-settings`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Restaurant',
        icon: IoRestaurant,
        link: `/${restaurantId}/apps/restaurant-settings`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Campaign',
        icon: MdOutlineCampaign,
        link: `/${restaurantId}/${locationId}/apps/campaign`,
        iconProps: {
          size: 32,
        },
      },
    ],
  },
  {
    name: 'Reports',
    apps: [
      {
        name: 'Order History',
        icon: GoHistory,
        link: `/${restaurantId}/${locationId}/apps/order_history`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Sales Summary ',
        icon: FaChartBar,
        link: `/${restaurantId}/${locationId}/apps/sales_reports`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Sales by Item',
        icon: BiMenuAltLeft,
        link: `/${restaurantId}/${locationId}/apps/sales_item`,
        iconProps: {
          size: 32,
        },
      },
      {
        name: 'Sales by Origin',
        icon: ImQrcode,
        link: `/${restaurantId}/${locationId}/apps/sales_origin`,
        iconProps: {
          size: 32,
        },
      },
    ],
  },
];
