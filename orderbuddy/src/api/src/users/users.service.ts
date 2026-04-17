import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { deleteUser } from 'supertokens-node';
import { User } from '../models/users';
import { COLLECTIONS } from '../db/collections';

@Injectable()
export class UsersService {
  private readonly usersCollection;
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectConnection() private readonly db: Db) {
    this.usersCollection = db.collection(COLLECTIONS.USERS);
  }

  async getUser(id: string) {
    const result = await this.usersCollection.findOne({
      userId: id,
    });
    return result;
  }

  async createUser(user: User): Promise<string> {
    try {
      // Check if user exists
      const existingUser = await this.getUser(user.userId);

      if (existingUser) {
        // Update existing user's contact info if new method provided
        const updateData: Partial<User> = {
          updatedAt: new Date(),
        };

        if (user.email && !existingUser.email) {
          updateData.email = user.email;
        }
        if (user.phoneNumber && !existingUser.phoneNumber) {
          updateData.phoneNumber = user.phoneNumber;
        }

        const result = await this.usersCollection.updateOne({ userId: user.userId }, { $set: updateData });

        return existingUser._id.toString();
      }

      // Create new user
      const result = await this.usersCollection.insertOne({
        ...user,
        updatedAt: new Date(),
      });

      this.logger.debug(`Created new user with ID: ${result.insertedId}`);
      return result.insertedId.toString();
    } catch (error) {
      this.logger.error('Error creating/updating user:', error);
      throw error;
    }
  }

  async userExist(id: string) {
    const query = { userId: id };
    const user = await this.usersCollection.countDocuments(query);
    return user > 0 ? true : false;
  }

  async deleteUserForId(userId: string) {
    await deleteUser(userId);
  }
}
