import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { Logger } from 'pino';
import { v4 as uuid } from 'uuid'; // Import uuid for generating unique request IDs
import {} from 'pino-pretty';
import { Logger } from 'nestjs-pino/Logger';
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuid();
    req['requestId'] = requestId;
    this.logger.log(
      {
        correlationId: requestId,
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers,
      },
      `[${requestId}] Incoming request`
    );
    res.on('finish', () => {
      this.logger.log(
        {
          correlationId: requestId,
          statusCode: res.statusCode,
          responseTime: Date.now() - req.socket.bytesRead,
        },
        `[${requestId}] Request completed`
      );
    });

    next();
  }
}
