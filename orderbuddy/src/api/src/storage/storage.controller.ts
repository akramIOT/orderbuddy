import { Controller, Post, UploadedFile, UseInterceptors, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureStorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: AzureStorageService) {}

  @Post('upload/:restaurantId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('restaurantId') restaurantId: string,
    @Body('folder') folder: string
  ) {
    console.log('Received file:', file);
    const imageUrl = await this.storageService.uploadImage(file.buffer, file.originalname, restaurantId, folder);

    return { imageUrl };
  }
}
