import { Injectable, NotFoundException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { COLLECTIONS } from '../db/collections';
import { Origin, Location, DayWorkingHours } from '../db/models';
import { Menu } from '../db/models/menu.model';
import { Restaurant } from '../db/models/restaurant.model';
import {
  CheckoutFormDto,
  CreateOrderDto,
  MenuSummaryDto,
  OrderConfirmationDto,
  OrderStatusDto,
} from './dtos/order-app.controller.dto';
import { DateTime } from 'luxon';
import { OrderItem } from '../models/order';
import { OrderStatus } from '../constants';

@Injectable()
export class OrderAppService {
  private readonly previewOrdersCollection: any;

  constructor(@InjectConnection() private readonly db: Db) {
    this.previewOrdersCollection = db.collection(COLLECTIONS.ORDERS_PREVIEWS);
  }

  private calculateModifierPrice(modifier: any, selectedOptions: any[], options: any[]): number {
    const freeChoices = modifier.freeChoices;
    const maxChoices = modifier.maxChoices;

    // Enforce maxChoices limit - take only up to maxChoices options
    const enforcedSelectedOptions = selectedOptions.slice(0, maxChoices);

    // Log if we had to enforce the maxChoices limit
    if (enforcedSelectedOptions.length < selectedOptions.length) {
      console.warn(
        `Enforced maxChoices ${maxChoices} for modifier ${modifier.id}. Selected: ${selectedOptions.length}, Used: ${enforcedSelectedOptions.length}`,
      );
    }

    // Calculate total price based on the selected options
    let total = 0;
    enforcedSelectedOptions.forEach((optionItem, index) => {
      // Handle both string IDs and object options
      // const optionId = typeof optionItem === 'string' ? optionItem : optionItem.id;
      const optionId = optionItem.id;

      const option = options.find((o) => o.id === optionId);
      if (!option) {
        console.warn(`Option not found for ID: ${optionId}`);
        return;
      }

      // Logic for determining price based on index and free choices
      if (index < freeChoices) {
        // If this is a free choice and freeChoices > 0, don't add to price
        if (freeChoices === 0) {
          // But if freeChoices is 0, we still charge the option price
          total += option.priceCents;
        }
      } else {
        // This is beyond the free choices limit
        if (modifier.extraChoicePriceCents > 0) {
          // Use the extraChoicePriceCents for additional options
          total += modifier.extraChoicePriceCents;
        } else {
          // If no extra choice price specified, use the individual option price
          total += option.priceCents;
        }
      }
    });

    return total;
  }

  async getRestaurant(restaurantId: string) {
    const restaurant = await this.db
      .collection<Restaurant>(COLLECTIONS.RESTAURANTS)
      .findOne({ _id: restaurantId }, { projection: { _id: 1, name: 1, concept: 1, logo: 1 } });

    if (!restaurant) throw new NotFoundException('INVALID_RESTAURANT');
    return restaurant;
  }

  async getLocation(restaurantId: string, locationId: string) {
    const location = await this.db.collection<Location>(COLLECTIONS.LOCATIONS).findOne(
      { _id: new ObjectId(locationId), restaurantId },
      {
        projection: {
          _id: 1,
          locationSlug: 1,
          name: 1,
          isActive: 1,
          workingHours: 1,
          timezone: 1,
          'orderTiming.acceptOrdersAfterMinutes': 1,
          'orderTiming.stopOrdersBeforeMinutes': 1,
          'payment.acceptPayment': 1,
          'payment.emergepayWalletsPublicId': 1,
        },
      },
    );

    if (!location) throw new NotFoundException('INVALID_LOCATION');

    const isOpen = this.isOpen(
      location.workingHours,
      location.timezone,
      location.orderTiming.acceptOrdersAfterMinutes,
      location.orderTiming.stopOrdersBeforeMinutes,
      restaurantId,
      location._id.toString(),
    );

    return {
      _id: location._id.toString(),
      locationSlug: location.locationSlug,
      name: location.name,
      isActive: location.isActive,
      acceptPayment: location.payment?.acceptPayment || false,
      emergepayWalletsPublicId: location.payment?.emergepayWalletsPublicId,
      isOpen,
    };
  }

  async getOrigin(originId: string) {
    try {
      const origin = await this.db.collection<Origin>(COLLECTIONS.ORIGINS).findOne(
        { _id: new ObjectId(originId) },
        {
          projection: {
            _id: 1,
            label: 1,
            restaurantId: 1,
            locationId: 1,
            type: 1,
          },
        },
      );

      if (!origin) {
        return {
          _id: '',
          label: '',
          restaurantId: '',
          locationId: '',
          type: '',
        };
      }

      return {
        ...origin,
        locationId: origin.locationId instanceof ObjectId ? origin.locationId.toString() : origin.locationId,
      };
    } catch (error) {
      // If there's an error with the ObjectId or database query, return an empty object
      console.error('Error fetching origin:', error);
    }
  }

  async getCampaign(restaurantId: string, locationId: string, originId: string) {
    try {
      const campaign = await this.db.collection(COLLECTIONS.CAMPAIGNS).findOne(
        {
          restaurantId,
          locationId: new ObjectId(locationId),
          originId: new ObjectId(originId),
          isActive: true,
        },
        {
          projection: {
            name: 1,
            type: 1,
            reward: 1,
          },
        },
      );

      if (!campaign) {
        return null;
      }

      return {
        name: campaign.name,
        type: campaign.type,
        reward: campaign.reward,
      };
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  isOpen(
    workingHours: DayWorkingHours[],
    timezone: string,
    acceptOrdersAfterMinutes: number,
    stopOrdersBeforeMinutes: number,
    restaurantId: string,
    locationId: string,
  ): boolean {
    const now = DateTime.now().setZone(timezone);

    if (!now.isValid) throw new Error(`Invalid timezone: ${timezone}`);

    const currentDay = now.toFormat('cccc').toLowerCase();
    const dayWorkingHours = workingHours.find((workingHour) => workingHour.day === currentDay);

    if (!dayWorkingHours)
      throw new Error(`working hours: ${currentDay}, restaurantId: ${restaurantId}, locationId: ${locationId}`);

    const isValidTimeFormat = (time: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (!dayWorkingHours.isOpen) return false;

    if (!dayWorkingHours.startTime || !dayWorkingHours.endTime) {
      throw new Error(`Invalid working hours for ${currentDay}: startTime or endTime is null`);
    }
    if (!isValidTimeFormat(dayWorkingHours.startTime)) throw new Error('Invalid time format: startTime');
    if (!isValidTimeFormat(dayWorkingHours.endTime)) throw new Error('Invalid time format: endTime');

    const currentMinutes = now.hour * 60 + now.minute;

    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const fromMinutes = timeToMinutes(dayWorkingHours.startTime);
    const toMinutes = timeToMinutes(dayWorkingHours.endTime);
    return (
      currentMinutes >= fromMinutes + acceptOrdersAfterMinutes && currentMinutes <= toMinutes - stopOrdersBeforeMinutes
    );
  }

  async getMenu(restaurantId: string, locationId: string, menuId: string): Promise<Menu> {
    const menu = await this.db.collection<Menu>(COLLECTIONS.MENUS).findOne({ _id: new ObjectId(menuId) });

    if (!menu) {
      throw new NotFoundException('Invalid menu');
    }
    const filteredItems = menu.items?.filter((item) => item.isAvailable === true) || [];
    return {
      ...menu,
      items: filteredItems,
    };
  }

  async getMenus(restaurantId: string, locationId: string): Promise<MenuSummaryDto[]> {
    //todo: add projection
    const menus = await this.db
      .collection<Menu>(COLLECTIONS.MENUS)
      .find(
        {
          restaurantId,
          locationId: new ObjectId(locationId),
        },
        {
          projection: {
            _id: 1,
            menuSlug: 1,
            name: 1,
            available: 1,
          },
        },
      )
      .toArray();
    return menus;
  }


//comments for testing purposes

  // async createPreviewOrder(
  //   body: CreateOrderDto,
  //   correlationId: string,
  // ): Promise<{ previewOrderId: string; totalPriceCents: number }> {
  //   const previewOrderId = new ObjectId();
  //   const orderCode = previewOrderId.toString().slice(-4).toUpperCase();
  //   const orderTotalPrice = body.items.reduce(
  //     (accumulator: number, currentValue: OrderItemDto) => accumulator + currentValue.price,
  //     0,
  //   );
  //   const taxRate = this.configService.get<number>('TAX_RATE');

  //   if (!taxRate) throw new Error('TAX_RATE not configured');
  //   const totalPriceWithTax = Math.round(orderTotalPrice + orderTotalPrice * taxRate);
  //   let OrderTotalPrice = totalPriceWithTax;
  //   if (body.discount && body.discount.amountCents) {
  //     const discountAmount = Math.min(body.discount.amountCents, totalPriceWithTax);
  //     OrderTotalPrice = Math.max(0, totalPriceWithTax - discountAmount);
  //   }

  //   const previewOrderToCreate = {
  //     _id: previewOrderId,
  //     orderCode: orderCode,
  //     paymentId: body.paymentId,
  //     restaurantId: body.restaurantId,
  //     locationId: new ObjectId(body.locationId),
  //     locationSlug: body.locationSlug,
  //     meta: {
  //       correlationId: correlationId,
  //     },
  //     customer: body.customer,
  //     origin: {
  //       id: body.origin.id ? body.origin.id : '',
  //       name: body.origin.name,
  //     },
  //     items: body.items.map((item) => {
  //       return new OrderItem(
  //         item.id,
  //         item.menuItemId,
  //         item.name,
  //         item.price,
  //         item.startedAt,
  //         item.completedAt,
  //         item.modifiers,
  //         item.variants,
  //         item.stationTags,
  //         item.notes,
  //       );
  //     }),
  //     discount: body.discount,
  //     status: OrderStatus.OrderCreated,
  //     startedAt: new Date(),
  //     totalPriceCents: OrderTotalPrice,
  //     getSms: body.getSms,
  //   };
  //   // Save the preview order to database
  //   await this.previewOrdersCollection.insertOne(previewOrderToCreate);

  //   return {
  //     previewOrderId: previewOrderId.toString(),
  //     totalPriceCents: OrderTotalPrice,
  //   };
  // }

  async createPreviewOrder(
    body: CreateOrderDto,
    correlationId: string,
  ): Promise<{ previewOrderId: string; totalPriceCents: number }> {
    const previewOrderId = new ObjectId();
    const orderCode = previewOrderId.toString().slice(-4).toUpperCase();

    // Fetch the menu to validate items and prices
    const menusCollection = this.db.collection<Menu>(COLLECTIONS.MENUS);
    const menu = await menusCollection.findOne({
      restaurantId: body.restaurantId,
      locationId: new ObjectId(body.locationId),
    });

    if (!menu) {
      throw new NotFoundException(`Menu not found for restaurant ${body.restaurantId} and location ${body.locationId}`);
    }

    // Validate each item against the menu and get the correct prices
    let calculatedOrderTotal = 0;

    // Process each order item to validate and update prices
    for (const orderItem of body.items) {
      // Find the menu item by ID
      const menuItem = menu.items.find((item) => item.id === orderItem.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Menu item ${orderItem.menuItemId} not found in menu`);
      }

      // Check if the item is available
      if (!menuItem.isAvailable) {
        throw new NotFoundException(`Menu item ${orderItem.menuItemId} is not available`);
      }

      // Calculate the correct price based on variants and modifiers
      let itemPrice = menuItem.priceCents;
      // Check variants if present
      if (orderItem.variants && orderItem.variants.length > 0) {
        for (const variantItem of orderItem.variants) {
          // Handle both string IDs and object variants

          const variant = menuItem.variants.find((v) => v.id === variantItem.id);
          if (!variant) {
            throw new NotFoundException(`Variant ${variantItem.id} not found for menu item ${orderItem.menuItemId}`);
          }

          // Use the variant price instead of the base price
          itemPrice = variant.priceCents;
        }
      }

      // Check modifiers if present
      if (orderItem.modifiers && orderItem.modifiers.length > 0) {
        for (const modifier of orderItem.modifiers) {
          const menuModifier = menuItem.modifiers.find((m) => m.id === modifier.id);
          if (!menuModifier) {
            throw new NotFoundException(`Modifier ${modifier.id} not found for menu item ${orderItem.menuItemId}`);
          }

          // Calculate additional costs from modifier options
          if (modifier.options && modifier.options.length > 0) {
            // Check if we need to enforce maxChoices
            const maxChoices = menuModifier.maxChoices;
            const selectedOptionsCount = modifier.options.length;

            // Log if the user tried to select more than maxChoices
            if (selectedOptionsCount > maxChoices) {
              console.warn(
                `Item ${menuItem.id} modifier ${menuModifier.id}: User tried to select ${selectedOptionsCount} options but maxChoices is ${maxChoices}. Enforcing limit.`,
              );
              // Note: we don't modify the options here - that's handled in calculateModifierPrice
            }

            // Calculate the modifier price using the same logic as in MenuItemModal.tsx
            const modifierPrice = this.calculateModifierPrice(menuModifier, modifier.options, menuModifier.options);
            itemPrice += modifierPrice;
          }
        }
      }
      orderItem.price = itemPrice;
      calculatedOrderTotal += itemPrice;
    }

    // Use the salesTax from the menu
    const salesTax = (menu as any).salesTax;

    const totalPriceWithTax = Math.round(calculatedOrderTotal + calculatedOrderTotal * (salesTax / 100));

    // Get discount from campaigns collection based on restaurantId and locationId
    let discountAmountCents = 0;
    try {
      // Get active campaign for this restaurant and location
      const campaign = await this.db.collection(COLLECTIONS.CAMPAIGNS).findOne({
        restaurantId: body.restaurantId,
        locationId: new ObjectId(body.locationId),
        originId: new ObjectId(body.origin.id),
        isActive: true,
      });

      if (campaign && campaign.reward) {
        // Check if the campaign has a flat discount amount
        if (campaign.reward.flatOffCents) {
          discountAmountCents = campaign.reward.flatOffCents;
        }
      } else {
        console.warn(`No active campaign found for restaurant ${body.restaurantId} and location ${body.locationId}`);
      }
    } catch (error) {
      console.error('Error fetching campaign discount:', error);
    }

    // Apply the discount from campaign
    let OrderTotalPrice = totalPriceWithTax;
    if (discountAmountCents > 0) {
      // Use campaign discount
      const discountAmount = Math.min(discountAmountCents, totalPriceWithTax);
      OrderTotalPrice = Math.max(0, totalPriceWithTax - discountAmount);
    }

    const previewOrderToCreate = {
      _id: previewOrderId,
      orderCode: orderCode,
      paymentId: body.paymentId,
      restaurantId: body.restaurantId,
      locationId: new ObjectId(body.locationId),
      locationSlug: body.locationSlug,
      meta: {
        correlationId: correlationId,
      },
      customer: body.customer,
      origin: {
        id: body.origin.id ? body.origin.id : '',
        name: body.origin.name,
      },
      items: body.items.map((item) => {
        return new OrderItem(
          item.id,
          item.menuItemId,
          item.name,
          item.price, 
          item.startedAt,
          item.completedAt,
          item.modifiers,
          item.variants,
          item.stationTags,
          item.notes,
        );
      }),
      discount: body.discount,
      status: OrderStatus.OrderCreated,
      startedAt: new Date(),
      totalPriceCents: OrderTotalPrice,
      getSms: body.getSms,
    };

    // Save the preview order to database
    await this.previewOrdersCollection.insertOne(previewOrderToCreate);

    return {
      previewOrderId: previewOrderId.toString(),
      totalPriceCents: OrderTotalPrice,
    };
  }

  async checkout(dto: CheckoutFormDto): Promise<OrderConfirmationDto> {
    const orderId = new ObjectId();
    const createdAt = new Date().toISOString();

    // TODO: create `orders` collection & schema
    await this.db.collection(COLLECTIONS.ORDERS).insertOne({
      _id: orderId,
      originId: dto.originId,
      menuId: dto.menuId,
      items: dto.items,
      paymentMethod: dto.paymentMethod,
      customerInfo: dto.customerInfo,
      createdAt,
      status: 'pending',
    });

    return {
      orderId: orderId.toString(),
      createdAt,
      status: 'pending',
    };
  }

  async getOrderStatus(orderId: string): Promise<OrderStatusDto> {
    const order = await this.db.collection(COLLECTIONS.ORDERS).findOne({ _id: new ObjectId(orderId) });
    if (!order) throw new NotFoundException('Order not found');

    return {
      orderId,
      status: order.status,
      updatedAt: order.updatedAt || order.createdAt,
    };
  }
}
