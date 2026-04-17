import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Db, Collection, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CreateOriginDto } from './dto/create-origin.dto';
import { COLLECTIONS } from '../db/collections';
import { Origin } from '../db/models/origin.model';
import { Restaurant } from '../db/models/restaurant.model';
import { Location } from '../db/models/location.model';
import { OriginDto, OriginsResponseDto } from './dto/get-origin.dtos';
import { UpdateQrStyleDto } from './dto/update-origin.dtos';
import { AzureStorageService } from '../storage/storage.service';
import { EMAIL_SENDER } from '../email/email.module';
import { EmailTemplateService } from '../email/email-template.service';
const { QRCodeStyling } = require('qr-code-styling/lib/qr-code-styling.common.js');
const nodeCanvas = require('canvas');
const { JSDOM } = require('jsdom');
@Injectable()
export class OriginsService {
  private readonly originsCollection: Collection<Origin>;
  private readonly restaurantsCollection: Collection<Restaurant>;
  private readonly locationCollection: Collection<Location>;

  constructor(
    @InjectConnection() private readonly db: Db,
    private readonly storageService: AzureStorageService,
    @Inject(EMAIL_SENDER) private readonly emailService: any,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly configService: ConfigService,
  ) {
    this.originsCollection = this.db.collection<Origin>(COLLECTIONS.ORIGINS);
    this.restaurantsCollection = this.db.collection(COLLECTIONS.RESTAURANTS);
    this.locationCollection = this.db.collection<Location>(COLLECTIONS.LOCATIONS);
  }
  async getRestaurantDetails(restaurantId: string) {
    const restaurantdata = this.db
      .collection<Restaurant>(COLLECTIONS.RESTAURANTS)
      .findOne({ _id: restaurantId }, { projection: { _id: 1, name: 1, concept: 1, logo: 1 } });
    if (!restaurantdata) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    return restaurantdata;
  }
  async getLocationDetails(restaurantId: string, locationId: string) {
    const location = await this.locationCollection.findOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        projection: {
          locationSlug: 1,
          name: 1,
        },
      },
    );

    if (!location) {
      throw new NotFoundException(`Location ${locationId} not found`);
    }

    return location;
  }
  async findAllOrigins(restaurantId: string, locationId: string): Promise<OriginsResponseDto> {
    const location = await this.locationCollection.findOne(
      { restaurantId, _id: new ObjectId(locationId) },
      { projection: { qrCodeStyle: 1, qrCodeImage: 1 } },
    );

    const query = {
      restaurantId,
      locationId: new ObjectId(locationId),
    };

    const projection = {
      _id: 1,
      restaurantId: 1,
      locationId: 1,
      label: 1,
      qrCodeId: 1,
      qrCode: 1,
      type: 1,
    };
    const origins = await this.originsCollection.find<Origin>(query, { projection }).toArray();

    if (!origins || origins.length === 0) {
      throw new NotFoundException(`No origins found for restaurant ${restaurantId} and location ${locationId}`);
    }

    return {
      qrCodeStyle: location?.qrCodeStyle,
      qrCodeImage: location?.qrCodeImage,
      originData: origins,
    };
  }

  async createOrigin(restaurantId: string, locationId: string, createOriginDto: CreateOriginDto): Promise<OriginDto> {
    const originId = new ObjectId();

    const origin = {
      _id: originId,
      restaurantId,
      locationId: new ObjectId(locationId),
      label: createOriginDto.name,
      qrCode: createOriginDto.qrCode,
      qrCodeId: createOriginDto.qrCodeId,
      type: (createOriginDto.type || 'table') as 'table' | 'parking' | 'campaign',
    };

    const result = await this.originsCollection.insertOne(origin);

    if (!result.acknowledged) {
      throw new Error('Failed to create origin');
    }

    return origin;
  }

  async updateOrigin(originId: ObjectId, updateData: Partial<Origin>): Promise<OriginDto> {
    const result = await this.originsCollection.findOneAndUpdate(
      { _id: originId },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (!result) {
      throw new NotFoundException(`Origin ${originId} not found`);
    }

    return result;
  }

  async updateQrStyle(restaurantId: string, locationId: string, updateQrStyleDto: UpdateQrStyleDto): Promise<void> {
    const result = await this.locationCollection.updateOne(
      {
        restaurantId,
        _id: new ObjectId(locationId),
      },
      {
        $set: {
          qrCodeStyle: updateQrStyleDto.qrCodeStyle,
          qrCodeImage: updateQrStyleDto.qrCodeImage,
        },
      },
    );

    if (!result.matchedCount) {
      throw new NotFoundException(`Origin not found for restaurant ${restaurantId} and location ${locationId}`);
    }

    if (!result.modifiedCount) {
      throw new Error('Failed to update QR style');
    }
  }
  async uploadLogo(file: Express.Multer.File, restaurantId: string): Promise<string> {
    try {
      const imageUrl = await this.storageService.uploadLogoImage(file.buffer, file.originalname, restaurantId, 'logo');
      await this.restaurantsCollection.updateOne(
        { _id: restaurantId },
        {
          $set: {
            logo: imageUrl,
            updatedAt: new Date(),
          },
        },
      );
      return imageUrl;
    } catch (error) {
      throw new Error(`Failed to upload logo: ${error.message}`);
    }
  }

  async sendQrCodeLink(restaurantId: string, locationId: string, originId: string): Promise<void> {
    try {
      // Get the origin details
      const origin = await this.originsCollection.findOne({
        _id: new ObjectId(originId),
        restaurantId,
        locationId: new ObjectId(locationId),
      });

      if (!origin) {
        throw new NotFoundException(`Origin ${originId} not found`);
      }

      // Get restaurant details
      const restaurant = await this.restaurantsCollection.findOne({ _id: restaurantId }, { projection: { name: 1 } });

      if (!restaurant) {
        throw new NotFoundException(`Restaurant ${restaurantId} not found`);
      }

      // Get location details including contact email
      const location = await this.locationCollection.findOne(
        { _id: new ObjectId(locationId), restaurantId },
        { projection: { name: 1, contact: 1 } },
      );

      if (!location) {
        throw new NotFoundException(`Location ${locationId} not found`);
      }

      if (!location.contact.email) {
        throw new Error('Location does not have a contact email configured');
      }

      // Get the smart scan URL
      const smartScanUrl = this.configService.get<string>('SMART_SCAN_URL');
      const qrCodeUrl = `${smartScanUrl}/${origin.qrCodeId}`;

      const qrOptions = {
        width: 300,
        height: 300,
        data: qrCodeUrl,
        // Optionally add logo or styling here
        dotsOptions: {
          color: '#4267b2',
          type: 'rounded',
        },
        backgroundOptions: {
          color: '#e9ebee',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 20,
          saveAsBlob: true,
        },
        jsdom: JSDOM,
        nodeCanvas,
      };
      const qrCodeImage = new QRCodeStyling(qrOptions);
      const qrPngBuffer = await qrCodeImage.getRawData('png');
      const qrCodeImageUrl = `data:image/png;base64,${qrPngBuffer.toString('base64')}`;
      // Create the email HTML using the template service
      const templateData = {
        restaurantName: restaurant.name,
        locationName: location.name,
        originName: origin.label,
        qrCodeUrl: qrCodeUrl,
        originType: origin.type || 'table',
         qrCodeImageUrl
      };

      // Render the HTML from the template
      const html = this.emailTemplateService.renderHtml('qrcode-link', templateData);

      // --- Send email with attachment ---
      await this.emailService.send({
        to: location.contact.email,
        subject: `QR Code Link for ${origin.label} at ${location.name}`,
        html: html,
        attachments: [
          {
            filename: `${origin.label || 'qrname'}.png`,
            content: qrPngBuffer,
            contentType: 'image/png',
          },
        ],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to send QR code link: ${error.message}`);
    }
  }
}
