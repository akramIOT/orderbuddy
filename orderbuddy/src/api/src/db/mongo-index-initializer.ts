import { Injectable, OnModuleInit } from '@nestjs/common';
import { Db } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { COLLECTIONS } from './collections';

@Injectable()
export class MongoIndexInitializer implements OnModuleInit {
  constructor(@InjectConnection() private readonly db: Db) {}

  async onModuleInit() {
    await Promise.all([
      // this.db
      //   .collection('origins')
      //   .createIndex({ restaurantId: 1, locationId: 1, originId: 1 }, { unique: true, name: 'unique_origin_key' }),
      // this.db
      //   .collection('locations')
      //   .createIndex({ restaurantId: 1, locationId: 1 }, { unique: true, name: 'unique_location_key' }),
      // this.db
      //   .collection('menus')
      //   .createIndex({ restaurantId: 1, locationId: 1, menuId: 1 }, { unique: true, name: 'unique_menu_key' }),
      // this.db
      //   .collection('stations')
      //   .createIndex({ restaurantId: 1, locationId: 1, stationId: 1 }, { unique: true, name: 'unique_station_key' }),
      this.db.collection(COLLECTIONS.CAMPAIGNS).createIndex({ originId: 1 }, { name: 'campaign_origin_lookup', unique: true }),
    ]);

    console.log('[MongoIndexInitializer] Compound indexes created');
  }
}
