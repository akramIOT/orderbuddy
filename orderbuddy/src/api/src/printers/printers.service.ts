import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS } from '../db/collections';
import { Location } from '../db/models';

@Injectable()
export class PrintersService {
  constructor(@InjectConnection() private readonly db: Db) {}

  async create(restaurantId: string, locationId: string, createPrinterDto: CreatePrinterDto) {
    const printer = {
      id: new ObjectId(),
      type: 'lan',
      ...createPrinterDto,
    };

    await this.db.collection<Location>(COLLECTIONS.LOCATIONS).updateOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        $push: { printers: printer },
      }
    );

    return printer;
  }

  async findAll(restaurantId: string, locationId: string) {
    const location = await this.db.collection(COLLECTIONS.LOCATIONS).findOne({
      restaurantId,
      _id: new ObjectId(locationId),
    });
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location.printers || [];
  }
}
