import { IsString, IsBoolean, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class WorkingHourDto {
  @IsString()
  day: string;

  @IsBoolean()
  isOpen: boolean;

  @IsString()
  @IsOptional()
  startTime: string | null;

  @IsString()
  @IsOptional()
  endTime: string | null;
}

export class OrderTimingDto {
  @IsNumber()
  @IsOptional()
  acceptOrdersAfterMinutes: number;

  @IsNumber()
  @IsOptional()
  stopOrdersBeforeMinutes: number;
}

export class AlertNumberDto {
  @IsString()
  @IsOptional()
  _id?: string | ObjectId;

  @IsString()
  phoneNumber: string;
}
export class ContactDto {
  @IsString()
  @IsOptional()
  email: string;
}


export class CreateLocationSettingDto {
  @IsString()
  restaurantId: string;

  @IsString()
  locationId: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderTimingDto)
  orderTiming?: OrderTimingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertNumberDto)
  alertNumbers?: AlertNumberDto[];

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  autoAcceptOrder?: boolean;

   @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;
}


