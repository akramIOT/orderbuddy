import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';
// import { EventsModule } from '../events/events.module'
import { MenuModule } from '../menu/menu.module';

@Module({
  // imports: [MenuModule, EventsModule],//revert this when events module is ready
  imports: [MenuModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
