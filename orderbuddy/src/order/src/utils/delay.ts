import { logger } from '@/logger';

export const delay = (ms: number) =>
  new Promise((resolve) => {
    logger.debug(`Delaying for ${ms} milliseconds`);
    setTimeout(resolve, ms);
  });
