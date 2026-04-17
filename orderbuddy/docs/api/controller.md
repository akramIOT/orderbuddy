// Shared response types
// @location: lib/types/api-response.ts
export interface ApiResponse<T> {
    data: T | T[] | null;
    meta?: {
      status?: number;
      message?: string;
      pagination?: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
      [key: string]: any;
    };
    error?: ApiError;
  }
  
  // @location: lib/types/api-error.ts
  export interface ApiError {
    code: string;
    message: string;
    details?: any;
  }
  
  // GET /menus/:id handler (example NestJS route handler)
  import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
  import { ApiResponse, ApiError } from './types';
  
  // @location: lib/types/menu-response.dto.ts
  interface Menu {
    id: string;
    name: { [lang: string]: string };
    tags: string[];
    // ... other fields from menu schema
  }
  
  @Controller('menus')
  export class MenuController {
    @Get(':id')
    async getMenuById(@Param('id') id: string): Promise<ApiResponse<Menu>> {
      // Simulate DB fetch
      const menu = await this.mockFindMenuById(id);
  
      if (!menu) {
        return {
          data: null,
          error: {
            code: 'MENU_NOT_FOUND',
            message: `Menu with ID '${id}' not found`
          },
          meta: { status: 404 }
        };
      }
  
      return {
        data: menu,
        meta: {
          status: 200
        }
      };
    }
  
    private async mockFindMenuById(id: string): Promise<Menu | null> {
      if (id === 'lunch_menu') {
        return {
          id: 'lunch_menu',
          name: { en: 'Lunch Menu', es: 'Menú de Almuerzo' },
          tags: ['dine_in', 'food_court']
        };
      }
      return null;
    }
  }
  