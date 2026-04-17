import { Injectable, NotFoundException } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { COLLECTIONS } from '../db/collections';
import { Location } from '../db/models/location.model';
import { DateTime } from 'luxon';
import { SalesByItemResponse, SalesByOriginResponse } from './dto/reports.dto';
import { OrderStatus } from '../constants';

@Injectable()
export class ReportService {
  private readonly restaurantsCollection: any;
  private readonly ordersCollection: any;
  private readonly locationCollection: Collection<Location>;
  private readonly originsCollection: Collection;

  constructor(
    @InjectConnection() private readonly db: Db,
    private readonly configService: ConfigService,
  ) {
    this.restaurantsCollection = db.collection(COLLECTIONS.RESTAURANTS);
    this.ordersCollection = db.collection(COLLECTIONS.ORDERS);
    this.locationCollection = this.db.collection<Location>(COLLECTIONS.LOCATIONS);
    this.originsCollection = this.db.collection(COLLECTIONS.ORIGINS);
  }

  async getHistoryOrders(restaurantId: string, locationId: string, date: string) {
    const location = await this.locationCollection.findOne(
      {
        _id: new ObjectId(locationId),
        restaurantId: restaurantId,
      },
      {
        projection: {
          timezone: 1,
          name: 1,
          _id: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found for restaurant ${restaurantId}`);
    }

    if (!location.timezone) {
      throw new Error('Store opening hours or timezone not configured');
    }

    const timezone = location.timezone;
    const localDay = DateTime.fromISO(date).setZone(timezone).startOf('day');

    const startUTC = localDay.toUTC().toJSDate();
    const endUTC = localDay.endOf('day').toUTC().toJSDate();
    if (!localDay.isValid) {
      throw new Error(`Invalid localDate: ${localDay.invalidReason}`);
    }

    const orders = await this.ordersCollection
      .find({
        restaurantId,
        locationId: new ObjectId(locationId),
        startedAt: {
          $gte: startUTC,
          $lt: endUTC,
        },
      })
      .toArray();

    return orders;
  }

  async getSalesSummary(restaurantId: string, locationId: string, days: number = 7) {
    const location = await this.locationCollection.findOne(
      {
        _id: new ObjectId(locationId),
        restaurantId: restaurantId,
      },
      {
        projection: {
          timezone: 1,
          name: 1,
          _id: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found for restaurant ${restaurantId}`);
    }

    if (!location.timezone) {
      throw new Error('Store timezone not configured');
    }

    // Get tax rate from config service
    const TAX_RATE = this.configService.getOrThrow<number>('TAX_RATE');

    const daysAgo = DateTime.now()
      .setZone(location.timezone)
      .startOf('day')
      .minus({ days: days - 1 })
      .toJSDate();

    const salesData = await this.ordersCollection
      .aggregate([
        {
          $match: {
            restaurantId,
            locationId: new ObjectId(locationId),
            status: OrderStatus.OrderCompleted,
            endedAt: { $gte: daysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$endedAt',
                timezone: location.timezone,
              },
            },
            grossSalesCents: { $sum: '$totalPriceCents' },
          },
        },
        {
          $addFields: {
            taxCents: {
              $multiply: [{ $divide: ['$grossSalesCents', { $add: [1, TAX_RATE] }] }, TAX_RATE],
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            grossSales: { $divide: ['$grossSalesCents', 100] },
            tax: { $divide: ['$taxCents', 100] },
          },
        },
        {
          $sort: { date: 1 },
        },
      ])
      .toArray();

    const allDatesMap = new Map();
    const currentDate = DateTime.now().setZone(location.timezone);

    for (let i = days - 1; i >= 0; i--) {
      const date = currentDate.minus({ days: i }).startOf('day');
      const dateStr = date.toFormat('yyyy-MM-dd');
      allDatesMap.set(dateStr, {
        date: dateStr,
        grossSales: 0,
        tax: 0,
      });
    }

    salesData.forEach((day) => {
      if (allDatesMap.has(day.date)) {
        allDatesMap.set(day.date, day);
      }
    });

    const fullSalesData = Array.from(allDatesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return fullSalesData;
  }

  async getSalesByItem(restaurantId: string, locationId: string, date: string): Promise<SalesByItemResponse[]> {
    // Find the location to get timezone info
    const location = await this.locationCollection.findOne(
      {
        _id: new ObjectId(locationId),
        restaurantId: restaurantId,
      },
      {
        projection: {
          timezone: 1,
          name: 1,
          _id: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found for restaurant ${restaurantId}`);
    }

    if (!location.timezone) {
      throw new Error('Store timezone not configured');
    }

    const timezone = location.timezone;
    const localDay = DateTime.fromISO(date).setZone(timezone).startOf('day');

    if (!localDay.isValid) {
      throw new Error(`Invalid date: ${localDay.invalidReason}`);
    }

    const startOfDay = localDay.toUTC().toJSDate();
    const endOfDay = localDay.endOf('day').toUTC().toJSDate();

    const salesByItem = await this.ordersCollection
      .aggregate([
        {
          $match: {
            restaurantId,
            locationId: new ObjectId(locationId),
            status: OrderStatus.OrderCompleted,
            endedAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.menuItemId',
            itemName: { $first: '$items.name' },
            soldCount: { $sum: 1 },
            grossSalesCents: { $sum: '$items.priceCents' },
          },
        },
        {
          $addFields: {
            grossSales: { $divide: ['$grossSalesCents', 100] },
          },
        },
        {
          $project: {
            _id: 0,
            menuItemId: '$_id',
            itemName: 1,
            soldCount: 1,
            grossSales: 1,
          },
        },
        { $sort: { grossSales: -1 } },
      ])
      .toArray();
    return salesByItem;
  }
  async getSalesByOrigin(restaurantId: string, locationId: string, date: string): Promise<SalesByOriginResponse[]> {
    // Find the location to get timezone info
    const location = await this.locationCollection.findOne(
      {
        _id: new ObjectId(locationId),
        restaurantId: restaurantId,
      },
      {
        projection: {
          timezone: 1,
          name: 1,
          _id: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found for restaurant ${restaurantId}`);
    }

    if (!location.timezone) {
      throw new Error('Store timezone not configured');
    }

    const timezone = location.timezone;
    const localDay = DateTime.fromISO(date).setZone(timezone).startOf('day');

    if (!localDay.isValid) {
      throw new Error(`Invalid date: ${localDay.invalidReason}`);
    }

    const startOfDay = localDay.toUTC().toJSDate();
    const endOfDay = localDay.endOf('day').toUTC().toJSDate();

    const salesByItem = await this.ordersCollection.aggregate([
      {
        $match: {
          restaurantId,
          locationId: new ObjectId(locationId),
          status: OrderStatus.OrderCompleted,
          endedAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          itemName: { $first: '$items.name' },
          soldCount: { $sum: 1 },
          grossSalesCents: { $sum: '$items.priceCents' },
        },
      },
      {
        $addFields: {
          grossSales: { $divide: ['$grossSalesCents', 100] },
        },
      },
      {
        $project: {
          _id: 0,
          menuItemId: '$_id',
          itemName: 1,
          soldCount: 1,
          grossSales: 1,
        },
      },
      { $sort: { grossSales: -1 } },
    ]);
    const salesByOrigin = await this.ordersCollection
      .aggregate([
        {
          $match: {
            restaurantId,
            locationId: new ObjectId(locationId),
            status: OrderStatus.OrderCompleted,
            endedAt: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
        {
          $group: {
            _id: '$origin.id',
            name: { $first: '$origin.name' },
            soldCount: { $sum: { $size: '$items' } },
            grossSales: { $sum: { $divide: ['$totalPriceCents', 100] } },
          },
        },
        {
          $project: {
            _id: 0,
            originId: { $toString: '$_id' },
            name: 1,
            soldCount: 1,
            grossSales: 1,
          },
        },
        { $sort: { grossSales: -1 } },
      ])
      .toArray();
    return salesByOrigin;
  }
}
