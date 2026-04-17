import { Injectable } from '@nestjs/common';
import { emergepaySdk, TransactionType } from 'emergepay-sdk';
import { InjectConnection } from '@nestjs/mongoose';
import { Db, ObjectId } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateOrderBody, CreateOrderUpiBody } from './dtos/payments.controller.dto';
import { MenuService } from '../menu/menu.service';
import { COLLECTIONS } from '../db/collections';
import { logger } from '../logger/pino.logger';

@Injectable()
export class PaymentsService {
  private readonly locationCollection;
  private readonly previewOrdersCollections;
  private readonly logger: typeof logger;

  constructor(
    private readonly menuService: MenuService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly db: Db,
  ) {
    this.locationCollection = db.collection(COLLECTIONS.LOCATIONS);
    this.previewOrdersCollections = db.collection(COLLECTIONS.ORDERS_PREVIEWS);
    this.logger = logger.child({ context: 'PaymentsService' });
  }

  async startTransaction(restaurantId: string) {
    let emergepay: any;
    const projection = { payment: 1 };
    const PaymentDetails = await this.locationCollection.findOne({ restaurantId: restaurantId }, { projection });
    const oid = PaymentDetails.payment.oid;
    const authToken = PaymentDetails.payment.auth;
    const environmentUrl = this.configService.get<string>('EMERGEPAY_ENVIRONMENT_URL');
    if (!oid || !authToken) {
      throw new Error('EmergePay credentials not found');
    }
    if (!environmentUrl) {
      throw new Error('EmergePay environment URL not found');
    }
    emergepay = new emergepaySdk({
      oid,
      authToken,
      environmentUrl,
    });

    const config = {
      transactionType: TransactionType.CreditSale,
      method: 'hostedFields',
      submissionType: 'manual',
    };

    try {
      const transactionToken = await emergepay.startTransaction(config);
      return { transactionToken };
    } catch (error) {
      throw error;
    }
  }

  async completeTranscation(body: CreateOrderBody, requestId: string) {
    // Get preview order data using previewOrderId
    const previewOrder = await this.previewOrdersCollections.findOne({ _id: new ObjectId(body.previewOrderId) });
    if (!previewOrder) {
      throw new Error('Preview order not found');
    }

    // Extract data from preview order
    const restaurantId = previewOrder.restaurantId;
    const locationId: string = previewOrder.locationId;
    const orderTotalPrice = previewOrder.totalPriceCents;

    let emergepay: any;
    const projection = { payment: 1 };
    const PaymentDetails = await this.locationCollection.findOne(
      { _id: new ObjectId(locationId), restaurantId: restaurantId },
      { projection },
    );
    const oid = PaymentDetails.payment.oid;
    const authToken = PaymentDetails.payment.auth;
    const environmentUrl = this.configService.get<string>('EMERGEPAY_ENVIRONMENT_URL');
    if (!environmentUrl) {
      throw new Error('EmergePay environment URL not found');
    }
    emergepay = new emergepaySdk({
      oid,
      authToken,
      environmentUrl,
    });

    const orderTotalPriceInDollars = (orderTotalPrice / 100).toFixed(2);
    if (!emergepay) {
      throw new Error('EmergePay SDK not properly initialized');
    }
    const response = await emergepay.checkoutTransaction({
      transactionToken: body.transactionToken,
      transactionType: 'CreditSale',
      amount: orderTotalPriceInDollars,
      externalTransactionId: emergepay.getExternalTransactionId(),
    });
    let orderId = '';
    if (response.data.resultStatus === 'true') {
      this.logger.trace(
        {
          module: 'payment',
          event: 'payment_successful',
          correlationId: requestId,
          restaurantId: restaurantId,
          amount: orderTotalPriceInDollars,
          transactionId: body.transactionToken,
        },
        'Payment completed',
      );
      const orderCreateRequest = {
        previewOrderId: body.previewOrderId,
        paymentId: body.transactionToken,
      };
      orderId = await this.menuService.createOrder(orderCreateRequest, requestId);
    } else {
      this.logger.trace(
        {
          module: 'payment',
          event: 'payment_failed',
          restaurantId: restaurantId,
          correlationId: requestId,
          error: response.data.resultMessage,
        },
        'Payment failed',
      );
    }
    return { transaction: response.data, orderId: orderId };
  }

  async placeOrderWithoutPayment(previewOrderId: string, requestId: string) {
    try {
      // Get preview order data
      const previewOrder = await this.previewOrdersCollections.findOne({ _id: new ObjectId(previewOrderId) });

      if (!previewOrder) {
        throw new Error('Preview order not found');
      }

      // Create order without payment
      const orderCreateRequest = {
        previewOrderId: previewOrderId,
        paymentId: ''
      };

      // Log the no-payment order creation
      this.logger.trace(
        {
          module: 'payment',
          event: 'order_without_payment',
          correlationId: requestId,
          restaurantId: previewOrder.restaurantId,
          previewOrderId: previewOrderId,
        },
        'Creating order without payment',
      );

      // Use the menu service to create the order
      const orderId = await this.menuService.createOrder(orderCreateRequest, requestId);

      return {
        orderId,
        success: true,
        message: 'Order created successfully without payment',
      };
    } catch (error) {
      this.logger.error(
        {
          module: 'payment',
          event: 'order_without_payment_failed',
          correlationId: requestId,
          error: error.message,
        },
        'Failed to create order without payment',
      );
      throw error;
    }
  }

  async completeTranscationUpi(body: CreateOrderUpiBody, requestId: string) {
    // Get preview order data using previewOrderId
    const previewOrder = await this.previewOrdersCollections.findOne({ _id: new ObjectId(body.previewOrderId) });
    if (!previewOrder) {
      throw new Error('Preview order not found');
    }

    // Extract data from preview order
    const restaurantId = previewOrder.restaurantId;
    const locationId = previewOrder.locationId;
    const orderTotalPrice = previewOrder.totalPriceCents;

    const projection = { payment: 1 };
    const PaymentDetails = await this.locationCollection.findOne(
      { _id: typeof locationId === 'string' ? new ObjectId(locationId) : locationId, restaurantId: restaurantId },
      { projection },
    );
    const oid = PaymentDetails.payment.oid;
    const authToken = PaymentDetails.payment.auth;
    const environmentUrl = this.configService.get<string>('EMERGEPAY_ENVIRONMENT_URL');
    const url = `${environmentUrl}/orgs/${oid}/transactions/wallets`;

    if (!oid || !authToken) {
      throw new Error('EmergePay credentials not found');
    }
    if (!environmentUrl) {
      throw new Error('EmergePay environment URL not found');
    }

    const orderTotalPriceInDollars = orderTotalPrice / 100;

    const totalPriceWithTax = orderTotalPriceInDollars.toFixed(2);
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    };

    const transactionData: any = {};

    transactionData.type = body.transactionDetails.type;
    transactionData.isSandbox = body.transactionDetails.isSandbox;
    transactionData.billing = body.transactionDetails.billing;
    transactionData.card = body.transactionDetails.card;
    transactionData.token = body.transactionDetails.token;
    transactionData.amount = totalPriceWithTax;
    transactionData.transactionType = 'CreditSale';
    transactionData.externalTransactionId = requestId;
    transactionData.transactionReference = requestId;

    try {
      const response = await axios.post(url, { transactionData }, requestConfig);
      let orderId = '';
      if (response.data && response.data.transactionResponse.resultMessage === 'Approved') {
        this.logger.trace(
          {
            module: 'payment',
            event: 'upi_payment_successful',
            correlationId: requestId,
            restaurantId: restaurantId,
            amount: totalPriceWithTax,
            transactionId: requestId,
          },
          'UPI Payment completed',
        );
        const orderCreateRequest = {
          previewOrderId: body.previewOrderId,
          paymentId: body.transactionDetails.token.data,
        };
        orderId = await this.menuService.createOrder(orderCreateRequest, requestId);
      } else {
        this.logger.trace(
          {
            module: 'payment',
            event: 'upi_payment_failed',
            restaurantId: restaurantId,
            correlationId: requestId,
            error: response.data,
          },
          'UPI Payment failed',
        );
      }

      return { transaction: response.data, orderId: orderId };
    } catch (error: any) {
      console.error('EmergePay API error:', error.response?.data || error.message);
      throw new Error('Failed to process payment');
    }
  }
}
