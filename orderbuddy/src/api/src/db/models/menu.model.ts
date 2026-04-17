import { ObjectId } from 'mongodb';

export interface MultilingualName {
  en: string;
  es: string;
  pt: string;
}

export interface Menu {
  _id: ObjectId;
  restaurantId: string;
  locationId: ObjectId; // ObjectId;
  menuSlug: string;
  name: MultilingualName;
  categories: categoriesItem[];
  items: any[]; //todo construct this type
  schedule: {
    type: 'time' | 'location' | 'manual';
    rules?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
  available: boolean;
}
export interface categoriesItem {
  id: string;
  name: MultilingualName;
  description: MultilingualName;
  emoji?: string;
  sortOrder: number;
}
