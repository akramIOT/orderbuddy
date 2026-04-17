import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { COLLECTIONS } from '../db/collections';

@Injectable()
export class EventsService {
  private logger = new Logger(EventsService.name);
  private readonly stationsCollection;

  constructor(@InjectConnection() private readonly db: Db) {
    this.stationsCollection = this.db.collection(COLLECTIONS.STATIONS);
  }

  join(socket: Socket, roomId: string): void {
    socket.join(roomId);
    console.log(`socket ${socket.id} joined room ${roomId}`);
    this.logger.debug(`${socket.id} joined room :${roomId}]`);
  }

  broadcast(socket: Socket, event: string, toRoomId: string, data: any): void {
    socket.broadcast.to(toRoomId).emit(event, data);
    console.log(`broadcasting event ${event} to room ${toRoomId}`);
    this.logger.debug(`broadcasting event ${event} to room ${toRoomId}`);
  }

  async getStationsByTags(restaurantId: string, locationId: string, tags: string[]) {
    this.logger.debug(
      `Finding stations for restaurant=${restaurantId}, location=${locationId}, tags=${tags.join(',')}`,
    );

    const locationObjectId = new ObjectId(locationId);

    const stations = await this.stationsCollection
      .find({
        restaurantId: restaurantId,
        locationId: locationObjectId,
        tags: { $in: tags },
      })
      .toArray();

    this.logger.debug(`Found ${stations.length} matching stations for location ${locationId}`);

    return stations.map((station) => ({
      id: station._id.toString(),
      restaurantId: station.restaurantId,
      locationId: station.locationId.toString(),
      stationTags: station.tags,
    }));
  }
}
