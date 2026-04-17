import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db, ObjectId } from 'mongodb';
import { MenuSummaryDto } from './dto/create-po.dto';
import { COLLECTIONS } from '../db/collections';
import { Menu } from '../db/models/menu.model';

@Injectable()
export class PosService {
  constructor(@InjectConnection() private readonly db: Db) {}

  async getMenus(restaurantId: string, locationId: string): Promise<MenuSummaryDto[]> {
    //todo: add projection
    const menus = await this.db
      .collection<Menu>(COLLECTIONS.MENUS)
      .find(
        {
          restaurantId,
          locationId: new ObjectId(locationId),
        },
        {
          projection: {
            _id: 1,
            menuSlug: 1,
            name: 1,
            available: 1,
          },
        },
      )
      .toArray();
    return menus;
  }
  async getMenu(menuId: string): Promise<Menu> {
    const menu = await this.db.collection<Menu>(COLLECTIONS.MENUS).findOne({ _id: new ObjectId(menuId) });

    if (!menu) {
      throw new NotFoundException('Invalid menu');
    }
    const filteredItems = menu.items?.filter((item) => item.isAvailable === true) || [];
    return {
      ...menu,
      items: filteredItems,
    };
  }
}
