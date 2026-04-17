import { ObjectId } from 'mongodb';

export interface Origin {
  _id: ObjectId;
  restaurantId: string;
  locationId: ObjectId; // ObjectId
  qrCodeId: string;
  type: 'table' | 'parking' | 'campaign';
  label: string;
  qrCode: string;
}
