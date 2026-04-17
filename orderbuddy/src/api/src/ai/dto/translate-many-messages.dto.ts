import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty, ArrayMinSize } from 'class-validator';

export class TranslateManyMessagesDto {
  @ApiProperty({
    description: 'Array of messages to translate',
    example: ['Hello', 'How are you?'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  messages: string[];

  @ApiProperty({
    description: 'Array of ISO 639-1 language codes for translation',
    example: ['es', 'fr', 'zh', 'invalid-code'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languageCodes: string[];
}
