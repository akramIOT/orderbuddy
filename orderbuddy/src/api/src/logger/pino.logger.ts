import pino from 'pino';
// import { appInsightsStream } from './appinsightss-transport';

const streams = [
  { stream: process.stdout, level: 'trace' },
  // { stream: appInsightsStream, level: 'trace' },
];

export const logger = pino(
  {
    level: 'trace',
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  pino.multistream(streams)
);
