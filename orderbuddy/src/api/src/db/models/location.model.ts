import { ObjectId } from 'mongodb';
import { QrCodeStyle } from '../../origins/dto/update-origin.dtos';

export interface AlertNumber {
  _id?: string | ObjectId;
  phoneNumber: string;
}

export interface Location {
  _id: ObjectId;
  restaurantId: string;
  locationSlug: string;
  name: string;
  address: string;
  timezone: string;
  isActive: boolean;
  qrCodeStyle: QrCodeStyle;
  qrCodeImage: string;
  qrCodeId: string;
  createdAt: Date;
  updatedAt: Date;
  contact: {
    email: string;
  };
  payment: {
    acceptPayment: boolean;
    emergepayWalletsPublicId?: string;
  };
  workingHours: DayWorkingHours[];
  orderTiming: {
    acceptOrdersAfterMinutes: number;
    stopOrdersBeforeMinutes: number;
  };
  alertNumbers?: AlertNumber[];
  isMobile: boolean;
  printers: PrinterData[];
  autoAcceptOrder: boolean;
}

export interface PrinterData {
  id: ObjectId;
  name: string;
  ip: string;
  type?: string;
}

export interface DayWorkingHours {
  day: string;
  startTime: string | null;
  endTime: string | null;
  isOpen: boolean;
}
