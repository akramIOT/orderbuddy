import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { FetchWorkingHoursDto } from './dto/fetch-working-hours.dto';
import { TranslateMessageDto } from './dto/translate-message.dto';
import { TranslateManyMessagesDto } from './dto/translate-many-messages.dto';
import { JobService } from './job.service';

class TranslationObject {
  @ApiProperty({ example: 'es', description: 'ISO 639-1 language code' })
  code: string;

  @ApiProperty({ example: 'Hola', description: 'Translated text' })
  value: string;
}

class TranslateResponse {
  @ApiProperty({ type: [TranslationObject], description: 'Array of translation objects' })
  translations: TranslationObject[];
}

class SingleMessageTranslations {
  @ApiProperty({ type: [TranslationObject], description: 'Array of translation objects for a single message' })
  translations: TranslationObject[];
}

class TranslateManyResponse {
  @ApiProperty({
    type: [SingleMessageTranslations],
    description: 'Array of translation results, one for each input message',
  })
  messages: SingleMessageTranslations[];
}

class TranslateMenuJobResponse {
  @ApiProperty({ example: true, description: 'Indicates if the job was started successfully' })
  succeeded: boolean;

  @ApiProperty({ example: 'Job started', description: 'Status message' })
  message: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly jobService: JobService, // Added JobService injection
  ) {}

  @Post('fetch-working-hours')
  @ApiOperation({ summary: 'Fetch working hours for a restaurant' })
  @ApiResponse({ status: 200, description: 'Working hours retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchWorkingHours(@Body() fetchWorkingHoursDto: FetchWorkingHoursDto) {
    this.logger.log(
      `Fetching working hours for ${fetchWorkingHoursDto.restaurantName} at ${fetchWorkingHoursDto.restaurantAddress}`,
    );

    try {
      const workingHours = await this.aiService.getWorkingHours(
        fetchWorkingHoursDto.restaurantName,
        fetchWorkingHoursDto.restaurantAddress,
      );

      return workingHours;
    } catch (error) {
      this.logger.error('Error fetching working hours', error);
      throw error;
    }
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate a message into multiple languages' })
  @ApiResponse({ status: 200, description: 'Message translated successfully', type: TranslateResponse })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async translate(@Body() translateMessageDto: TranslateMessageDto) {
    this.logger.log(
      `Translating message "${translateMessageDto.message}" into languages: ${translateMessageDto.languageCodes.join(', ')}`,
    );

    try {
      const translations = await this.aiService.translateMessage(
        translateMessageDto.message,
        translateMessageDto.languageCodes,
      );
      return translations;
    } catch (error) {
      this.logger.error('Error translating message in controller', error);
      throw error;
    }
  }

  @Post('translate-many')
  @ApiOperation({ summary: 'Translate multiple messages into multiple languages' })
  @ApiResponse({ status: 200, description: 'Messages translated successfully', type: TranslateManyResponse })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async translateMany(@Body() translateManyMessagesDto: TranslateManyMessagesDto) {
    this.logger.log(
      `Translating ${translateManyMessagesDto.messages.length} messages into languages: ${translateManyMessagesDto.languageCodes.join(', ')}`,
    );

    try {
      const result = await this.aiService.translateManyMessages(
        translateManyMessagesDto.messages,
        translateManyMessagesDto.languageCodes,
      );
      return result;
    } catch (error) {
      this.logger.error('Error translating messages in controller', error);
      throw error;
    }
  }

  @Post('job/translateMenus')
  @ApiOperation({ summary: 'Start a job to translate menus' })
  @ApiResponse({ status: 202, description: 'Job accepted for processing', type: TranslateMenuJobResponse }) // 202 Accepted is more appropriate for async jobs
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async translateMenusJob() {
    this.logger.log(`Received request to start menu translation job.`);
    try {
      const result = await this.jobService.translateMenuJob();

      return result;
    } catch (error) {
      this.logger.error('Error starting menu translation job in controller', error);
      throw error;
    }
  }
}
