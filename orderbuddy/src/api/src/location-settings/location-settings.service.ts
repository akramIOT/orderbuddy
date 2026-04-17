import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db, ObjectId } from 'mongodb';
import { UpdateLocationSettingDto } from './dto/update-location-setting.dto';
import { COLLECTIONS } from '../db/collections';
import { Location } from '../db/models';

@Injectable()
export class LocationSettingsService {
  constructor(@InjectConnection() private readonly db: Db) {}

  private readonly locationSettingsProjection = {
    _id: 1,
    restaurantId: 1,
    name: 1,
    address: 1,
    timezone: 1,
    workingHours: 1,
    orderTiming: 1,
    alertNumbers: 1,
    autoAcceptOrder: 1,
    contact: 1,
  };

  async findOne(locationId: string, restaurantId: string) {
    const location = await this.db.collection<Location>(COLLECTIONS.LOCATIONS).findOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        projection: this.locationSettingsProjection,
      },
    );

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    if (location.alertNumbers && Array.isArray(location.alertNumbers)) {
      location.alertNumbers = location.alertNumbers.map((alertNumber) => ({
        ...alertNumber,
        _id: alertNumber._id ? alertNumber._id.toString() : undefined,
      }));
    }

    return location;
  }

  async update(locationId: string, restaurantId: string, updateLocationSettingDto: UpdateLocationSettingDto) {
    if (updateLocationSettingDto.alertNumbers) {
      updateLocationSettingDto.alertNumbers = updateLocationSettingDto.alertNumbers.map((alertNumber) => {
        const objectId = !alertNumber._id
          ? new ObjectId()
          : typeof alertNumber._id === 'string'
            ? new ObjectId(alertNumber._id)
            : alertNumber._id;

        return {
          ...alertNumber,
          _id: objectId,
        };
      });
    }

    const updateResult = await this.db.collection<Location>(COLLECTIONS.LOCATIONS).updateOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        $set: updateLocationSettingDto,
      },
    );

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    // Re-fetch the updated document with projection
    return this.findOne(locationId, restaurantId);
  }
}
