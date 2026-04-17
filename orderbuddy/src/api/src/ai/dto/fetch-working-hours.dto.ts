import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchWorkingHoursDto {
  @ApiProperty({
    description: 'Name of the restaurant',
    example: 'Olive Garden',
  })
  @IsNotEmpty()
  @IsString()
  restaurantName: string;

  @ApiProperty({
    description: 'Address of the restaurant',
    example: '123 Main St, New York, NY',
  })
  @IsNotEmpty()
  @IsString()
  restaurantAddress: string;
}
