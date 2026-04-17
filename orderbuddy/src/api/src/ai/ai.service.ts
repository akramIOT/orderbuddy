import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as ISO6391 from 'iso-639-1';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getWorkingHours(
    restaurantName: string,
    restaurantAddress: string
  ): Promise<Record<string, { opening: string; closing: string }>> {
    try {
      const completion : any = await this.openai.responses.create({
        model: "gpt-4.1",
        input: [
          {
            "role": "system",
            "content": [
              {
                "type": "input_text",
                "text": `Perform web search for working hours of ${restaurantName} at ${restaurantAddress}.`
              }
            ]
          }
        ],
        text: {
          "format": this.workingHoursJsonSchema,
        },
        tools: [
          {
            "type": "web_search_preview",
            "user_location": {
              "type": "approximate"
            },
            "search_context_size": "medium"
          }
        ],
      });
  
      const result = completion.output_text;
      console.log(result);
      return JSON.parse(result);
    } catch (error) {
      console.log(error);
      this.logger.error('Error fetching working hours', error);
      throw new Error('Failed to retrieve working hours');
    }
  }

  async translateMessage(
    message: string,
    languageCodes: string[],
  ): Promise<{ translations: Array<{ code: string; value: string }> }> {
    const validLanguageCodes = languageCodes.filter(code => (ISO6391 as any).validate(code));

    if (validLanguageCodes.length === 0) {
      this.logger.log('No valid language codes provided for translation.');
      return { translations: [] };
    }

    try {
      const prompt = `You are a translation assistant. Translate the following message into the specified languages.
      Message: '${message}'
      Target Languages: ${validLanguageCodes.join(', ')}
      Return the translations as a JSON object with a single key 'translations', which is an array of objects. Each object in the array should have two keys: 'code' (the language code from the Target Languages list) and 'value' (the translated string). The order of objects in the array must correspond to the order of language codes provided in 'Target Languages'. If you cannot translate the message into a specific target language (e.g., due to an invalid or unsupported language code), use an empty string "" for that language's 'value' in the corresponding object. Ensure each object in the 'translations' array contains both 'code' and 'value' keys.`;

      const completion: any = await this.openai.responses.create({
        model: 'gpt-4.1', // Or your preferred model
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
        text: {
          format: this.translationJsonSchema,
        },
      });

      const result = completion.output_text;
      this.logger.log(`Translation result: ${result}`);
      const parsedResult = JSON.parse(result);

      // Ensure the response structure matches the expected format
      if (
        !parsedResult.translations ||
        !Array.isArray(parsedResult.translations) ||
        !parsedResult.translations.every(
          (t: any) => typeof t.code === 'string' && typeof t.value === 'string',
        )
      ) {
        this.logger.error('Malformed translation response from OpenAI', parsedResult);
        throw new Error('Failed to translate message due to malformed response from AI');
      }
      
      return parsedResult;
    } catch (error) {
      this.logger.error('Error translating message', error);
      throw new Error('Failed to translate message');
    }
  }

  async translateManyMessages(
    messages: string[],
    languageCodes: string[],
  ): Promise<{ messages: Array<{ translations: Array<{ code: string; value: string }> }> }> {
    const validLanguageCodes = languageCodes.filter(code => (ISO6391 as any).validate(code));

    if (validLanguageCodes.length === 0 || messages.length === 0) {
      this.logger.log('No valid language codes or no messages provided for translation.');
      return {
        messages: messages.map(() => ({ translations: [] })),
      };
    }

    try {
      const messagesString = messages.map((msg, index) => `${index + 1}. '${msg}'`).join('\n');
      const prompt = `You are a translation assistant. Translate the following list of messages into the specified languages.
      The input messages are (preserve this order in your response):
      ${messagesString}

      The target languages are (preserve this order for translations within each message): ${validLanguageCodes.join(', ')}

      Return your response as a JSON object with a single top-level key: "messages".
      The "messages" key must contain an array of objects. Each object in this array corresponds to one of the original input messages, in the same order they were provided.
      Each of these objects must contain a key "translations".
      The "translations" key must contain an array of translation objects. Each translation object must have two keys: "code" (the language code from the Target Languages list) and "value" (the translated string).
      The order of translation objects within the "translations" array must strictly correspond to the order of the "Target Languages" provided above.
      If a translation for a specific message into a specific target language is not possible or fails, use an empty string "" for that language's "value" in the corresponding translation object.
      Ensure every part of this structure is strictly followed.`;

      const completion: any = await this.openai.responses.create({
        model: 'gpt-4.1',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
        text: {
          format: this.translateManyJsonSchema,
        },
      });

      const result = completion.output_text;
      this.logger.log(`TranslateMany result: ${result}`);
      const parsedResult = JSON.parse(result);

      if (
        !parsedResult.messages ||
        !Array.isArray(parsedResult.messages) ||
        !parsedResult.messages.every(
          (msgObj: any) =>
            msgObj.translations &&
            Array.isArray(msgObj.translations) &&
            msgObj.translations.every(
              (t: any) => typeof t.code === 'string' && typeof t.value === 'string',
            ),
        )
      ) {
        this.logger.error('Malformed translateMany response from OpenAI', parsedResult);
        throw new Error('Failed to translate messages due to malformed response from AI');
      }
      
      return parsedResult;
    } catch (error) {
      this.logger.error('Error translating many messages', error);
      throw new Error('Failed to translate messages');
    }
  }

  workingHoursJsonSchema : any = {
    "type": "json_schema",
    "name": "openHours",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "openHours": {
          "type": "array",
          "description": "Weekly schedule, one object per day of the week",
          "items": {
            "type": "object",
            "required": [
              "day",
              "isClosed",
              "periods"
            ],
            "properties": {
              "day": {
                "type": "string",
                "enum": [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday"
                ]
              },
              "isClosed": {
                "type": "boolean",
                "description": "Explicitly mark the day as closed"
              },
              "periods": {
                "type": "array",
                "description": "List of open periods, if any",
                "items": {
                  "type": "object",
                  "required": [
                    "start",
                    "end"
                  ],
                  "properties": {
                    "start": {
                      "type": "string",
                      "description": "Start time of the open period in 24 hours format like 19:00"
                    },
                    "end": {
                      "type": "string",
                      "description": "End time of the open period in 24 hours format like 19:00"
                    }
                  },
                  "additionalProperties": false
                }
              }
            },
            "additionalProperties": false
          }
        }
      },
      "required": [
        "openHours"
      ],
      "additionalProperties": false
    }
  }

  translationJsonSchema: any = {
    type: 'json_schema',
    name: 'translationsResponse',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        translations: {
          type: 'array',
          description:
            'List of translation objects, each containing a language code and the translated string, in the same order as requested valid language codes.',
          items: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'ISO 639-1 language code.',
              },
              value: {
                type: 'string',
                description:
                  'Translated text. Empty string if translation failed for this language.',
              },
            },
            required: ['code', 'value'],
            additionalProperties: false,
          },
        },
      },
      required: ['translations'],
      additionalProperties: false,
    },
  };

  translateManyJsonSchema: any = {
    type: 'json_schema',
    name: 'translateManyResponse',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          description: 'Array of translation results, one for each input message, in the same order as input messages.',
          items: {
            type: 'object',
            properties: {
              translations: {
                type: 'array',
                description: 'List of translation objects for a single message, in the same order as requested valid language codes.',
                items: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      description: 'ISO 639-1 language code.',
                    },
                    value: {
                      type: 'string',
                      description: 'Translated text. Empty string if translation failed for this language.',
                    },
                  },
                  required: ['code', 'value'],
                  additionalProperties: false,
                },
              },
            },
            required: ['translations'],
            additionalProperties: false,
          },
        },
      },
      required: ['messages'],
      additionalProperties: false,
    },
  };
}