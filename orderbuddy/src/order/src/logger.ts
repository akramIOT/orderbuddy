import pino from 'pino';

export const logger = pino({
  browser: {
    serialize: true,
    asObject: true,
  },
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'h:MM:ss TT',
      ignore: 'pid,hostname',
    },
  },
});
