export interface User {
  _id?: any;
  restaurants: string[];
  userId: string;
  email?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt?: Date;
}
