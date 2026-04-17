import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationSettingDto } from './create-location-setting.dto';

export class UpdateLocationSettingDto extends PartialType(CreateLocationSettingDto) {}
