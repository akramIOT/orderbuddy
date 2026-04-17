import { Module } from '@nestjs/common';
import { PrintersService } from './printers.service';
import { PrintersController } from './printers.controller';

@Module({
  controllers: [PrintersController],
  providers: [PrintersService],
})
export class PrintersModule {}
