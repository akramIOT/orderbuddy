import { Injectable, NotFoundException } from '@nestjs/common';
import { Db, Collection, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import {
  CreateStationDto,
  OrderItemStatus,
  StationDto,
  StationOrderResponseDto,
  UpdateOrderItemDto,
} from './dto/create-station.dto';
import { COLLECTIONS } from '../db/collections';
import { Stations } from '../db/models/station.model';
import { DateTime } from 'luxon';
import { OrderStatus } from '../constants';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  priceCents: number;
  stationTags: string[];
  isStarted?: boolean;
  isCompleted?: boolean;
  variants?: any[];
  modifiers?: any[];
  notes?: string;
}

export interface Order {
  _id: ObjectId;
  orderCode: string;
  meta: {
    correlationId: string;
  };
  status: string;
  createdAt: Date;
  startedAt: Date;
  locationId: ObjectId;
  items: OrderItem[];
  customer: any;
  totalPriceCents: number;
}

export interface MatchedOrder {
  _id: ObjectId;
  orderCode: string;
  meta: {
    correlationId: string;
  };
  status: string;
  createdAt: Date;
  locationId: ObjectId;
  items: OrderItem[];
}
@Injectable()
export class StationsService {
  private readonly stationsCollection: Collection<Stations>;
  private readonly ordersCollection: Collection<Order>;
  private readonly locationsCollection: Collection;

  constructor(@InjectConnection() private readonly db: Db) {
    this.stationsCollection = this.db.collection<Stations>(COLLECTIONS.STATIONS);
    this.ordersCollection = this.db.collection<Order>(COLLECTIONS.ORDERS);
    this.locationsCollection = this.db.collection(COLLECTIONS.LOCATIONS);
  }

  async getStations(restaurantId: string, locationId: string): Promise<StationDto[]> {
    const query = {
      restaurantId,
      locationId: new ObjectId(locationId),
    };

    const projection = {
      _id: 1,
      restaurantId: 1,
      locationId: 1,
      name: 1,
      tags: 1,
    };

    const stations = await this.stationsCollection.find<Stations>(query, { projection }).toArray();

    if (!stations || stations.length === 0) {
      throw new NotFoundException(`No stations found for restaurant ${restaurantId} and location ${locationId}`);
    }

    return stations;
  }

  async getOrdersByStationId(restaurantId: string, locationId: string, stationId: string): Promise<any> {
    // Get station details
    const station = await this.stationsCollection.findOne<Stations>({
      _id: new ObjectId(stationId),
      restaurantId,
      locationId: new ObjectId(locationId),
    });
    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // Get location details
    const location = await this.locationsCollection.findOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        projection: {
          name: 1,
          timezone: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException('Location not found');
    }
    if (!location?.timezone) {
      throw new Error('Store opening hours or timezone not configured');
    }
    const timezone = location.timezone;
    const localToday = DateTime.now().setZone(timezone).startOf('day');

    if (!localToday.isValid) {
      throw new Error(`Invalid localDate: ${localToday.invalidReason}`);
    }

    const startUTC = localToday.toUTC().toJSDate();
    const endUTC = localToday.endOf('day').toUTC().toJSDate();
    // Get orders with matching station tags
    const orders = await this.ordersCollection
      .find<Order>({
        restaurantId,
        locationId: new ObjectId(locationId),
        status: OrderStatus.OrderAccepted,
        startedAt: {
          $gte: startUTC,
          $lt: endUTC,
        },
        items: {
          $elemMatch: {
            stationTags: {
              $in: station.tags,
            },
          },
        },
      })
      .toArray();

    // Filter items in each order
    const matchedOrders: MatchedOrder[] = orders
      .map((order) => ({
        _id: order._id,
        orderCode: order.orderCode,
        status: order.status,
        createdAt: order.createdAt,
        locationId: order.locationId,
        meta: {
          correlationId: order.meta?.correlationId,
        },
        items: order.items.filter(
          (item) =>
            Array.isArray(item.stationTags) &&
            item.stationTags.some((tag) => Array.isArray(station.tags) && station.tags.includes(tag)),
        ),
      }))
      .filter((order) => order.items && order.items.length > 0);

    return {
      locationName: location.name,
      locationId: location.locationId,
      stationName: station.name,
      stationTags: station.tags,
      matchedOrders,
    };
  }

  async createStation(createStationDto: CreateStationDto): Promise<StationDto> {
    const station = {
      _id: new ObjectId(),
      restaurantId: createStationDto.restaurantId,
      locationId: new ObjectId(createStationDto.locationId),
      name: createStationDto.name,
      tags: createStationDto.tags,
    };

    const result = await this.stationsCollection.insertOne(station);

    if (!result.acknowledged) {
      throw new Error('Failed to create station');
    }

    return {
      _id: result.insertedId,
      ...createStationDto,
    };
  }

  async getStationSingleOrder(
    restaurantId: string,
    locationId: string,
    orderId: string,
    stationTags: string[],
  ): Promise<StationOrderResponseDto> {
    const order = await this.ordersCollection.findOne({
      _id: new ObjectId(orderId),
      restaurantId,
      locationId: new ObjectId(locationId),
      status: OrderStatus.OrderAccepted,
      items: {
        $elemMatch: {
          stationTags: {
            $in: stationTags,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const filteredItems = order.items.filter((item) => item.stationTags.some((tag) => stationTags.includes(tag)));
    return {
      _id: order._id.toString(),
      orderCode: order.orderCode,
      meta: {
        correlationId: order.meta?.correlationId,
      },
      status: order.status,
      startedAt: order.startedAt,
      customer: order.customer,
      items: filteredItems,
      totalPriceCents: order.totalPriceCents,
    };
  }

  async updateOrderItem(updateOrderItemDto: UpdateOrderItemDto): Promise<boolean> {
    const { orderId, itemId, orderItemStatus } = updateOrderItemDto;
    const now = new Date();

    const updateQuery =
      orderItemStatus === OrderItemStatus.STARTED
        ? {
            $set: {
              'items.$[item].startedAt': now,
              'items.$[item].completedAt': null,
            },
          }
        : {
            $set: {
              'items.$[item].completedAt': now,
            },
          };

    const result = await this.ordersCollection.updateOne({ _id: new ObjectId(orderId) }, updateQuery, {
      arrayFilters: [{ 'item.id': itemId }],
    });

    if (!result.acknowledged) {
      throw new Error('Failed to update order item status');
    }

    if (result.matchedCount === 0) {
      throw new NotFoundException('Order or item not found');
    }

    return result.modifiedCount > 0;
  }
}
