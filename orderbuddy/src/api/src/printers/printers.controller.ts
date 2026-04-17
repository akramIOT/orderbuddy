import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrintersService } from './printers.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';

@Controller('printers')
export class PrintersController {
  constructor(private readonly printersService: PrintersService) {}

  @Post(':restaurantId/:locationId')
  create(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Body() createPrinterDto: CreatePrinterDto
  ) {
    return this.printersService.create(restaurantId, locationId, createPrinterDto);
  }

  @Get(':restaurantId/:locationId')
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Param('locationId') locationId: string,
    @Res() res: Response
  ) {
    const printers = await this.printersService.findAll(restaurantId, locationId);
    return res.status(HttpStatus.OK).json({
      data: printers,
    });
  }
}
