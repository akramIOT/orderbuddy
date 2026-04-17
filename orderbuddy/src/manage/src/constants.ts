export enum OrderStatus {
  OrderCreated = 'CREATED',
  OrderAccepted = 'ACCEPTED',
  ReadyForPickup = 'READY_FOR_PICKUP',
  OrderCompleted = 'PICKED_UP',
}

export enum OrderItemStatus {
  Started = 'STARTED',
  Completed = 'COMPLETED',
}
