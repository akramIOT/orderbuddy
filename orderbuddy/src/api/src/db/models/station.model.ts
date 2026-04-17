import { ObjectId } from 'mongodb';

export interface Stations {
  _id: ObjectId;
  restaurantId: string;
  locationId: ObjectId; // ObjectId;
  name: string;
  tags: string[];
}
