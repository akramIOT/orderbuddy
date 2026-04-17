import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Collection, Db, ObjectId } from 'mongodb';
import { InjectConnection } from '@nestjs/mongoose';
import { Campaign } from '../db/models';
import { COLLECTIONS } from '../db/collections';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CampaignService {
  private readonly campaignCollection: Collection<Campaign>;
  private readonly ordersCollection: Collection<any>;

  constructor(
    @InjectConnection() private readonly db: Db,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.campaignCollection = this.db.collection<Campaign>(COLLECTIONS.CAMPAIGNS);
    this.ordersCollection = this.db.collection('orders'); // Initialize ordersCollection
  }

  async createCampaign(
    restaurantId: string,
    locationId: string,
    createCampaignDto: CreateCampaignDto,
    authToken?: string,
  ): Promise<Campaign> {
    try {
      const originName = createCampaignDto.name;
      const apiUrl = this.configService.get<string>('API_ENDPOINT');
      const originResponse = await firstValueFrom(
        this.httpService.post(
          `${apiUrl}/origins/${restaurantId}/${locationId}`,
          { name: originName, type: 'campaign' },
          {
            headers: {
              ...(authToken ? { Authorization: authToken } : {}),
            },
          },
        ),
      );
      const originId: string = originResponse.data.data._id;

      const now = new Date();

      const campaignData = {
        ...createCampaignDto,
        restaurantId,
        locationId: new ObjectId(locationId),
        originId: new ObjectId(originId),
        isActive: createCampaignDto.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.campaignCollection.insertOne(campaignData);
      return this.findOne(result.insertedId.toString());
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(`Failed to create origin: ${error.response.data.message || error.message}`);
      }
      throw new BadRequestException(`Failed to create campaign: ${error.message}`);
    }
  }

  async findByRestaurantAndLocationId(restaurantId: string, locationId: string) {
    return this.campaignCollection
      .find({ restaurantId, locationId: new ObjectId(locationId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findOne(id: string) {
    const campaign = await this.campaignCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async getCampaignSummary(restaurantId: string, locationId: string, campaignId: string) {
    try {
      const campaign = await this.findOne(campaignId);

      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
      }

      // Ensure we have the originId and convert it to string
      if (!campaign.originId) {
        throw new BadRequestException('Campaign has no associated origin ID');
      }

      const originId = campaign.originId.toString();

   

      // const startDate = new Date('2025-09-01T00:00:00Z');
      // const endDate = new Date('2025-09-30T23:59:59Z');

      const matchCondition: any = {
        restaurantId: restaurantId,
        // createdAt: {
        //   $gte: startDate,
        //   $lte: endDate,
        // },
      };

      matchCondition.$and = [
        {
          $or: [{ locationId: new ObjectId(locationId) }],
        },
       
        {
          $or: [
            { 'origin.id': originId },
            { 'origin.name': campaign.name }, 
          ],
        },
      ];



      const pipeline = [
        {
          $match: matchCondition,
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            grossSalesCents: { $sum: '$totalPriceCents' }, 
            customers: { $addToSet: '$customer.name' },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            grossSalesCents: 1,
            totalCustomers: { $size: '$customers' },
            avgOrderValueCents: {
              $cond: [{ $gt: ['$totalOrders', 0] }, { $divide: ['$grossSalesCents', '$totalOrders'] }, 0],
            },
          },
        },
      ];

 
      try {
        const result = await this.ordersCollection.aggregate(pipeline).toArray();

        // If no data found, return default values
        if (!result || result.length === 0) {
   
          // Count total orders for the restaurant/location to help debug
          const totalOrders = await this.ordersCollection.countDocuments({
            restaurantId: restaurantId,
            locationId: new ObjectId(locationId),
          });

          return {
            totalOrders: 0,
            grossSalesCents: 0,
            totalCustomers: 0,
            avgOrderValueCents: 0,
          };
        }

        return result[0];
      } catch (dbError) {
        console.error('Error executing aggregation pipeline:', dbError);
        throw new BadRequestException(`Database error when fetching campaign summary: ${dbError.message}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Unexpected error in getCampaignSummary:', error);
      throw new BadRequestException(`Failed to get campaign summary: ${error.message}`);
    }
  }
}
