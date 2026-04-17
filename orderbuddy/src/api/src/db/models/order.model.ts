import { ObjectId } from 'mongodb';

export interface Order {
  _id: ObjectId;
  originId: ObjectId; // ObjectId of the origin
  items: Array<{
    menuItemId: ObjectId;
    quantity: number;
    modifiers?: Record<string, any>;
  }>;
  paymentMethod: 'card' | 'wallet';
  customerInfo: {
    name: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  status: 'pending' | 'accepted' | 'ready' | 'picked_up' | 'cancelled';
}
