import { ObjectId } from 'mongodb';

export type CampaignType = 'flat' | 'percent' | 'bogo' | 'free_item';

export class Reward {
  flatOffCents?: number | null;
}

export class Campaign {
  _id?: ObjectId;
  restaurantId: string;
  locationId?: ObjectId;
  name: string;
  originId?: ObjectId;
  type: CampaignType;
  reward: Reward;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
