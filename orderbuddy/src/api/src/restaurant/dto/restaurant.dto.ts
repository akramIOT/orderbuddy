import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongodb';

//request
export class GetRestaurantInfoDto {
  @IsNotEmpty() restauranId!: string;
}

export class GetMenuInfoDto {
  @IsNotEmpty() menuId!: string;
}

export class GetRestaurantsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
export class GetRestaurantLocationsParamDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}
export class getTodayOrdersDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
  @IsNotEmpty()
  @IsString()
  locationId: string;
}
export class OrderHistoryDto {
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  date: string;
}
export class getMultilingualDto {
  @IsNotEmpty()
  @IsString()
  en: string;

  @IsOptional()
  es: string;

  @IsOptional()
  pt: string;
}
export class GetCategoryDtoBody {
  @IsOptional()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => getMultilingualDto)
  name: getMultilingualDto;

  @ValidateNested()
  @Type(() => getMultilingualDto)
  description: getMultilingualDto;

  @IsNotEmpty()
  @IsNumber()
  sortOrder: number;

  @IsOptional()
  @IsString()
  @MaxLength(4, { message: 'Only one emoji allowed' })
  emoji?: string;
}
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
export class GetMenuItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => getMultilingualDto)
  name: {
    en: string;
    es?: string;
    pt?: string;
  };

  @ValidateNested()
  @Type(() => getMultilingualDto)
  description: {
    en: string;
    es?: string;
    pt?: string;
  };

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  makingCostCents?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stationTags?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModifierDto)
  modifiers?: ModifierDto[];
}
export class UpdateCategorySortOrderDto {
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsNumber()
  sortOrder: number;
}
//response
export class MultilingualDto {
  @IsNotEmpty()
  @IsString()
  en: string;

  @IsNotEmpty()
  @IsOptional()
  es: string;

  @IsNotEmpty()
  @IsOptional()
  pt: string;
}

export class MultilingualModifiersDtoName {
  @IsNotEmpty()
  @IsString()
  en: string;
  @IsOptional()
  @IsString()
  es?: string;
  @IsOptional()
  @IsString()
  pt?: string;
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
export class UserDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  restaurants: string[];

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class RestaurantDto {
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  concept: string;

  @IsNotEmpty()
  @IsString()
  logo: string;
}

export class LocationDto {
  @IsNotEmpty()
  @IsString()
  _id: ObjectId;

  @IsNotEmpty()
  @IsString()
  locationSlug: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isMobile: boolean;
}

export class VariantDto {
  @IsNotEmpty()
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  priceCents: number;

  @IsOptional()
  @IsBoolean()
  default?: boolean;
}

export class ModifierOptionDto {
  @IsOptional()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => getMultilingualDto)
  name: getMultilingualDto;

  @IsNotEmpty()
  @IsNumber()
  priceCents: number;
}

export class ModifierDto {
  @IsOptional()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => MultilingualModifiersDtoName)
  name: MultilingualModifiersDtoName;

  @IsString()
  type: string;

  @IsBoolean()
  required: boolean;

  @IsString()
  selectionMode: string;

  @IsNumber()
  maxChoices: number;

  @IsNumber()
  freeChoices: number;

  @IsNumber()
  extraChoicePriceCents: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options: ModifierOptionDto[];
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

  @IsOptional()
  @IsOptional()
  sortOrder: number;

  @IsOptional()
  @IsString()
  @MaxLength(4, { message: 'Only one emoji allowed' })
  emoji?: string;
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
