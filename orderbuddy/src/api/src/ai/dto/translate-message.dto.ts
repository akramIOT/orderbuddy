import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class TranslateMessageDto {
  @ApiProperty({
    example: 'Hello, world!',
    description: 'The message to translate',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: ['es', 'fr', 'ta', 'xx'],
    description: 'Array of ISO 639-1 language codes (e.g., es, fr, de). Invalid codes will be ignored.',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  languageCodes: string[];
}
