import { Body, Controller, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderBody, CreateOrderUpiBody, GetStoreInfoDto } from './dtos/payments.controller.dto';
import e, { Response } from 'express';
import { logger } from '../logger/pino.logger';

@Controller('payments')
export class PaymentsController {
  private readonly logger: typeof logger;

  constructor(private readonly paymentsService: PaymentsService) {
    this.logger = logger.child({ context: 'PaymentsController' });
  }

  @Post('start-transaction/:restaurantId')
  async startTranscation(@Param() params: GetStoreInfoDto, @Res() res: Response, @Req() req: Request) {
    const requestId = req['requestId'];
    try {
      const transactionToken = await this.paymentsService.startTransaction(params.restaurantId);
      if (transactionToken)
        this.logger.trace(
          {
            module: 'payment',
            event: 'start-transaction',
            restaurantId: params.restaurantId,
            correlationId: requestId,
          },
          'Payment initiated',
        );
      return res.status(HttpStatus.OK).json(transactionToken);
    } catch (error: any) {
      this.logger.error(
        {
          module: 'payment',
          event: 'start-transaction',
          restaurantId: params.restaurantId,
          correlationId: requestId,
          error: error.message,
          stack: error.stack,
        },
        'Exception - Payment failed to initiate',
      );
      this.logger.trace(
        {
          module: 'payment',
          event: 'start-transaction',
          restaurantId: params.restaurantId,
          correlationId: requestId,
          error: error.message,
          stack: error.stack,
        },
        'Exception - Payment failed to initiate',
      );

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('complete-transaction')
  async completeTransaction(@Body() body: CreateOrderBody, @Res() res: Response, @Req() req: Request) {
    const requestId = req['requestId'];

    try {
      const data = await this.paymentsService.completeTranscation(body, requestId);
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      this.logger.error(
        {
          module: 'payment',
          event: 'complete-transaction',
          correlationId: requestId,
          error: error.message,
          stack: error.stack,
        },
        'Exception - Payment failed to complete',
      );
      this.logger.trace(
        {
          module: 'payment',
          event: 'complete-transaction',
          correlationId: requestId,
          error: error.message,
          stack: error.stack,
        },
        'Exception - Payment failed to complete',
      );

      console.error('EmergePay transaction failed:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Transaction failed', error: error.message });
    }
  }

  @Post('complete-upi-transaction')
  async completeUpiTransaction(@Body() body: CreateOrderUpiBody, @Res() res: Response, @Req() req: Request) {
    try {
      const requestId = req['requestId'];
      const data = await this.paymentsService.completeTranscationUpi(body, requestId);
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      console.error('EmergePay transaction upi failed:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Transaction upi failed', error: error.message });
    }
  }

 @Post('place-order-without-payment')
async placeOrderWithoutPayment(@Body() body: { previewOrderId: any }, @Res() res: Response, @Req() req: Request) {
  const requestId = req['requestId'];
  try {
    const data = await this.paymentsService.placeOrderWithoutPayment(body.previewOrderId, requestId);
    return res.status(HttpStatus.OK).json(data);
  } catch (error: any) {
    this.logger.error(
      {
        module: 'payment',
        event: 'place-order-without-payment',
        correlationId: requestId,
        error: error.message,
        stack: error.stack,
      },
      'Exception - Failed to place order without payment'
    );

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to place order without payment', 
      error: error.message 
    });
  }
}
}
