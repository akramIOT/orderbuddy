import { Injectable, NotFoundException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import {
  OrderStatusResponseDto,
  RestaurantResponseDto,
} from './dtos/menu.controller.dto';
import { ConfigService } from '@nestjs/config';
import { Order, OrderItem } from '../models/order';
import { OrderStatus } from '../constants';
import { EventsGateway } from '../events/events.gateway';
import { WebPushService } from '../web-push/web-push.service';
import { plainToClass } from 'class-transformer';
import { MessageService } from '../message/message.service';
import { COLLECTIONS } from '../db/collections';
import { logger } from '../logger/pino.logger';
// import { appInsightsClient } from '../logger/appinsightss-transport';
import { CreateOrderFromPreviewDto } from './dtos/create-order-from-preview.dto';

@Injectable()
export class MenuService {
  // private readonly logger = new Logger(MenuService.name)

  private readonly ordersCollection;
  private readonly menusCollection: any;
  private readonly restaurantsCollection: any;
  private readonly locationsCollection: any;
  private readonly logger: typeof logger;

  menuService: any;
  private readonly subscriptionsCollection;

  constructor(
    @InjectConnection() private readonly db: Db,
    private readonly eventsGateway: EventsGateway,
    private readonly webPushService: WebPushService,
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
  ) {
    this.ordersCollection = db.collection(COLLECTIONS.ORDERS);
    this.subscriptionsCollection = this.db.collection(COLLECTIONS.SUBSCRIPTIONS);
    this.restaurantsCollection = db.collection(COLLECTIONS.RESTAURANTS);
    this.menusCollection = db.collection(COLLECTIONS.MENUS);
    this.locationsCollection = db.collection(COLLECTIONS.LOCATIONS);
    this.logger = logger.child({ context: 'MenuService' });
  }

  async getRestaurantById(restaurantId: string): Promise<RestaurantResponseDto> {
    const result = await this.restaurantsCollection.findOne({
      _id: restaurantId,
    });
    if (!result) {
      throw new Error('Restaurant not found');
    }
    const transformedResult = plainToClass(RestaurantResponseDto, result, {
      excludeExtraneousValues: true,
    });
    return transformedResult;
  }
  async getMenuByRestaurantId(menuId: string) {
    const result = await this.menusCollection.findOne({
      '_id.menuId': menuId,
    });

    if (!result) {
      throw new Error('menu not found');
    }
    return result;
  }
  async getAlertNumbers(restaurantId: string, locationId: string) {
    const projection = { alertNumbers: 1 };

    try {
      const location = await this.locationsCollection.findOne(
        { _id: new ObjectId(locationId), restaurantId: restaurantId },
        { projection },
      );

      return location || { alertNumbers: [] };
    } catch (error) {
      this.logger.warn({
        module: 'order',
        event: 'alert_numbers_query_failed',
        error: error.message,
        restaurantId,
        locationId,
      });

      return { alertNumbers: [] };
    }
  }

  async createOrder(body: CreateOrderFromPreviewDto, correlationId: string) {
    const previewOrderId = body.previewOrderId ;
    this.logger.trace(
      {
        module: 'order',
        event: 'create_order_started',
        correlationId,
        previewOrderId,
      },
      'Order initiated',
    );

    // Get the preview order from the collection
    const previewOrdersCollection = this.db.collection(COLLECTIONS.ORDERS_PREVIEWS);
    const previewOrder = await previewOrdersCollection.findOne({
      _id: typeof previewOrderId === 'string' ? new ObjectId(previewOrderId) : previewOrderId,
    });

    if (!previewOrder) {
      throw new Error(`Preview order not found with id: ${previewOrderId}`);
    }

    const orderId = new ObjectId();
    const orderCode = orderId.toString().slice(-4).toUpperCase();

    // Create the order from the preview order
    const orderToCreate = {
      _id: orderId,
      orderCode: orderCode,
      paymentId: body.paymentId,
      restaurantId: previewOrder.restaurantId,
      locationId: previewOrder.locationId,
      locationSlug: previewOrder.locationSlug,
      meta: {
        correlationId: correlationId,
      },
      customer: previewOrder.customer,
      origin: previewOrder.origin,
      items: previewOrder.items.map((item) => {
        return new OrderItem(
          item.id,
          item.menuItemId,
          item.name,
          item.priceCents,
          item.startedAt,
          item.completedAt,
          item.modifiers,
          item.variants,
          item.stationTags,
          item.notes,
        );
      }),
      discount: previewOrder.discount,
      status: OrderStatus.OrderCreated,
      startedAt: new Date(),
      totalPriceCents: previewOrder.totalPriceCents,
      getSms: previewOrder.getSms,
    };

    const result = await this.ordersCollection.insertOne(orderToCreate);
    const itemsCount = orderToCreate.items.length;
    // if (result.acknowledged) {
    //   appInsightsClient.trackMetric({ name: 'orderCount', value: 1 });
    //   appInsightsClient.trackMetric({ name: 'orderTotalCents', value: orderToCreate.totalPriceCents });
    //   appInsightsClient.trackMetric({ name: 'orderItemsCount', value: itemsCount });
    //   appInsightsClient.trackEvent({
    //     name: 'new_order_placed',
    //     properties: {
    //       orderItemsCount: itemsCount,
    //       orderTotalCents: orderToCreate.totalPriceCents,
    //       restaurantId: orderToCreate.restaurantId,
    //       orderId: orderId.toString(),
    //       correlationId,
    //     },
    //   });
    //   this.logger.trace(
    //     {
    //       module: 'order',
    //       event: 'create_order_success',
    //       correlationId,
    //       restaurantId: orderToCreate.restaurantId,
    //       orderId: orderId.toString(),
    //     },
    //     'Order created',
    //   );
    // }

    if (!result.acknowledged) {
      this.logger.trace(
        {
          module: 'order',
          event: 'create_order_failed',
          correlationId,
          restaurantId: orderToCreate.restaurantId,
        },
        'Order creation failed',
      );
      throw new Error('Failed to create order');
    }

    const restaurantId = orderToCreate.restaurantId;

    const restaurantData = await this.getRestaurantById(restaurantId);

    const menuEndpoint = this.configService.get<string>('MENU_ENDPOINT');
    if (!menuEndpoint) {
      throw new Error('MENU_ENDPOINT configuration is missing');
    }

    const statusLink = `${menuEndpoint}/status/${restaurantData._id}/${orderId}`;
    const message = `OrderBuddy-${restaurantData.name}: your order #${orderCode} has been accepted, track progress here ${statusLink}`; //order number

    if (orderToCreate.getSms) {
      try {
        const result = await this.messageService.sendMessage(orderToCreate.customer.phone, message);
        if (!result) {
          throw new Error('Failed to notify customer');
        }
        this.logger.trace(
          {
            module: 'order',
            event: 'sms_sent',
            correlationId,
            phone: orderToCreate.customer.phone,
          },
          'Order notified to customer',
        );
      } catch (error) {
        this.logger.error(
          {
            module: 'order',
            event: 'sms_failed',
            correlationId,
            error: error.message,
            phone: previewOrder.customer.phone,
          },
          'Exception - Failed to notify customer',
        );
        this.logger.trace(
          {
            module: 'order',
            event: 'sms_failed',
            correlationId,
            error: error.message,
            phone: previewOrder.customer.phone,
          },
          'Exception - Failed to notify customer',
        );
      }
    } else {
      this.logger.debug('SMS not requested');
    }
    const alertNumbersData = await this.getAlertNumbers(
      orderToCreate.restaurantId,
      orderToCreate.locationId.toString(),
    );
    if (alertNumbersData && alertNumbersData.alertNumbers && alertNumbersData.alertNumbers.length > 0) {
      const orderReadySms = `OrderBuddy- you have received an order #${orderCode}`;
      for (const alertNumber of alertNumbersData.alertNumbers) {
        if (alertNumber && alertNumber.phoneNumber) {
          await this.messageService.sendMessage(alertNumber.phoneNumber, orderReadySms);
        }
      }
    }
    const locationId = orderToCreate.locationId;
    const locationRoom = `${restaurantId}_${locationId}`;
    this.eventsGateway.server.to(locationRoom).emit('order_received', {
      orderId,
      restaurantId,
      locationId,
      correlationId,
    });
    // Check autoAcceptOrder from location collection
    const location = await this.locationsCollection.findOne(
      {
        _id:
          typeof orderToCreate.locationId === 'string'
            ? new ObjectId(orderToCreate.locationId)
            : orderToCreate.locationId,
      },
      { projection: { autoAcceptOrder: 1 } },
    );
    const autoAcceptOrder = location?.autoAcceptOrder === true;
    if (autoAcceptOrder) {
      await this.ordersCollection.updateOne(
        { _id: orderId },
        {
          $set: {
            status: OrderStatus.OrderAccepted,
            'meta.acceptedBy': 'system',
            'meta.acceptedAt': new Date().toISOString(),
            'meta.autoAccept': true,
          },
        },
      );
      const stationTags = [...new Set(orderToCreate.items.flatMap((item) => item.stationTags))].filter(
        (tag): tag is string => tag !== undefined,
      );
      const orderData = {
        orderId: orderId.toString(),
        restaurantId: orderToCreate.restaurantId,
        locationId:
          typeof orderToCreate.locationId === 'string' ? orderToCreate.locationId : orderToCreate.locationId.toString(),
        stationTags,
        correlationId,

        orderDetails: {
          status: OrderStatus.OrderCreated,
          items: orderToCreate.items.map((item) => ({
            name: item.name,
          })),
        },
      };
      await this.eventsGateway.handleOrderJoined(orderData); // event to all stations
      this.logger.trace(
        {
          module: 'order',
          event: 'auto_accept',
          correlationId,
          orderId: orderId.toString(),
          restaurantId: orderToCreate.restaurantId,
          meta: {
            acceptedBy: 'system',
            acceptedAt: new Date().toISOString(),
            autoAccept: true,
          },
        },
        'Order-ACCEPTED',
      );
    }

    try {
      const notificationPayload = {
        title: 'New Order',
        body: `Order #${orderCode} received!`,
        restaurantId: restaurantId,
        platform: 'all' as const, // Explicitly type as 'all'
      };

      const response = await this.webPushService.sendNotifications(
        {
          title: notificationPayload.title,
          body: notificationPayload.body,
        },
        notificationPayload,
      );
      if (response.success) {
        this.logger.trace(
          {
            module: 'order',
            event: 'notifications_sent',
            correlationId: correlationId,
            orderId: orderId.toString(),
            restaurantId: orderToCreate.restaurantId,
          },
          'Order notified to store',
        );
      }
      if (!response.success) {
        this.logger.trace(
          {
            module: 'order',
            event: 'notifications_failed',
            correlationId: correlationId,
            orderId: orderId.toString(),
          },
          'Failed to notify store',
        );
      }

      // this.logger.info('Push notifications sent:', response);
    } catch (error) {
      this.logger.error(
        {
          module: 'order',
          event: 'notifications_error',
          correlationId: correlationId,
          orderId: orderId.toString(),
          restaurantId: previewOrder.restaurantId,
          error: error.message,
        },
        'Failed to notify store',
      );
    }

    return result.insertedId;
  }

  async getStatus(orderId: string): Promise<OrderStatusResponseDto> {
    const query = { _id: new ObjectId(orderId) };
    const projection = {
      _id: 1,
      orderCode: 1,
      restaurantId: 1,
      locationId: 1,
      locationSlug: 1,
      customer: 1,
      origin: 1,
      items: 1,
      status: 1,
      totalPriceCents: 1,
      discount: 1,
    };

    const order = await this.ordersCollection.findOne(query, { projection });
    if (!order) throw new NotFoundException('Order not found');

    return order;
  }
}
