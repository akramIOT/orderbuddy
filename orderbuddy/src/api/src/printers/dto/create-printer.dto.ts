import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreatePrinterDto {
  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
