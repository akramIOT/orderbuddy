import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { ObjectId } from 'mongodb';

@Injectable()
export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;
  private readonly containerName = 'assets';
  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.getOrThrow<string>('AZURE_STORAGE_CONNECTION_STRING');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadImage(fileBuffer: Buffer, originalName: string, restaurantId: string, folder: string): Promise<string> {
    const extension = extname(originalName);
    const blobName = `${restaurantId}/${folder}/${new ObjectId()}${extension}`;
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: this.getMimeType(extension) },
    });

    return blockBlobClient.url;
  }

  async uploadLogoImage(
    fileBuffer: Buffer,
    originalName: string,
    restaurantId: string,
    folder: string
  ): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const folderPath = `${restaurantId}/${folder}/`;
      const blobList = containerClient.listBlobsFlat({ prefix: folderPath });

      for await (const blob of blobList) {
        if (blob.name.startsWith(folderPath + 'logo.')) {
          await containerClient.deleteBlob(blob.name);
        }
      }

      const extension = extname(originalName);
      const blobName = `${restaurantId}/${folder}/logo${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: this.getMimeType(extension),
        },
      });

      return blockBlobClient.url;
    } catch (error) {
      throw new Error(`Failed to upload logo: ${error.message}`);
    }
  }
  private getMimeType(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
