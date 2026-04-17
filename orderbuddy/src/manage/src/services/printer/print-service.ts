import { registerPlugin } from '@capacitor/core';

export const StarPrinter = registerPlugin<{
  printOverNetwork(options: { data: string }): Promise<void>;
}>('StarPrinter');