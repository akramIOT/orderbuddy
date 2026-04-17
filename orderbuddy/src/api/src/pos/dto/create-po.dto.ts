import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { VariantDto, ModifierDto } from '../../restaurant/dto/restaurant.dto';
export class GetMenusParamDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;
}

export class GetMenuParamDto extends GetMenusParamDto {
  @IsNotEmpty()
  @IsString()
  menuId: string;
}
export class MultilingualDto {
  @IsNotEmpty()
  @IsString()
  en: string;

  @IsNotEmpty()
  @IsString()
  es: string;

  @IsNotEmpty()
  @IsString()
  pt: string;
}
export class MenuSummaryDto {
  @IsNotEmpty()
  @Type(() => ObjectId)
  _id: ObjectId;

  @IsNotEmpty()
  @IsString()
  menuSlug: string;

  @ValidateNested()
  @Type(() => MultilingualDto)
  name: MultilingualDto;

  @IsNotEmpty()
  available: boolean;
}

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => MultilingualDto)
  name: MultilingualDto;

  @ValidateNested()
  @Type(() => MultilingualDto)
  description: MultilingualDto;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  sortOrder: number;

  @IsOptional()
  @IsString()
  @MaxLength(4, { message: 'Only one emoji allowed' })
  emoji?: string;
}
export class MenuItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => MultilingualDto)
  name: MultilingualDto;

  @ValidateNested()
  @Type(() => MultilingualDto)
  description: MultilingualDto;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsNumber()
  priceCents: number;

  @IsNotEmpty()
  @IsNumber()
  makingCostCents: number;

  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean;

  @IsArray()
  @IsString({ each: true })
  stationTags: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierDto)
  modifiers?: ModifierDto[];
}

export class MenuDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  menuId: string;

  @ValidateNested()
  @Type(() => MultilingualDto)
  name: MultilingualDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items: MenuItemDto[];

  @IsNumber()
  salesTax: number;
}
