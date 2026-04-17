import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsObject,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType, Reward } from '../../db/models';

export class CampaignParams {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;
}
export class CampaignParamsWithId  {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  campaignId: string;
}



export class RewardDto implements Reward {
  @IsOptional()
  @IsNumber()
  flatOffCents?: number | null;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: CampaignType;

  @IsObject()
  @ValidateNested()
  @Type(() => RewardDto)
  reward: RewardDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
