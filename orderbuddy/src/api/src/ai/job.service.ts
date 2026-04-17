import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { console } from 'inspector';
import { AiService } from './ai.service'; // Added import

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  private readonly menusCollection: any;
  private readonly locationsCollection: any;

  constructor(
    @InjectConnection() private readonly db: Db,
    private readonly aiService: AiService // Injected AiService
  ) {
    this.menusCollection = db.collection('menus');
    this.locationsCollection = db.collection('locations');
  }

  async translateMenuJob(): Promise<{ succeeded: boolean; message: string }> {
    this.logger.log(`Starting menu translation job.`);

    let menusToTranslate = [];

    try {
      menusToTranslate = await this.getMenusForTranslation();
      console.log(`Found ${menusToTranslate.length} menus that need translation.`);
      console.log(menusToTranslate);
    } catch (error) {
      this.logger.error('Error fetching menus for translation', error);

      return {
        succeeded: false,
        message: 'Error fetching menus for translation',
      };
    }

    menusToTranslate.forEach(async (menu: any) => {
      const { locationId, restaurantId } = menu;
      console.log('Fetching supportedLanguages');
      if (locationId && restaurantId) {
        const location = await this.locationsCollection.findOne({
          _id: locationId,
          restaurantId: restaurantId,
        });
        if (location && location.supportedLanguages) {
          if (location.supportedLanguages.length > 0) {
            console.log('Translating menu name for ' + menu._id);
            let nameTranslationsResult = await this.aiService.translateMessage(
              menu.name.en,
              location.supportedLanguages
            );

            if (nameTranslationsResult.translations && nameTranslationsResult.translations.length > 0) {
              menu.name = menu.name || {};
              nameTranslationsResult.translations.forEach((translation) => {
                menu.name[translation.code] = translation.value;
              });
            } else {
              this.logger.warn(`No translations found for menu name with menu ID: ${menu._id}`);
            }

            const itemNames: string[] = [];
            const itemDescriptions: string[] = [];
            menu.items.forEach((item: any) => {
              if (item.name && item.name.en) {
                itemNames.push(item.name.en);
              }
              if (item.description && item.description.en) {
                itemDescriptions.push(item.description.en);
              }
            });

            const categoryNames: string[] = [];
            const categoryDescriptions: string[] = [];
            menu.categories.forEach((category: any) => {
              if (category.name && category.name.en) {
                categoryNames.push(category.name.en);
              }
              if (category.description && category.description.en) {
                categoryDescriptions.push(category.description.en);
              }
            });

            const fieldsToTranslate = {
              itemNames: itemNames,
              itemDescriptions: itemDescriptions,
              categoryNames: categoryNames,
              categoryDescriptions: categoryDescriptions,
            };

            const translatedFields: any = {
              itemNames: [],
              itemDescriptions: [],
              categoryNames: [],
              categoryDescriptions: [],
            };

            for (const [key, value] of Object.entries(fieldsToTranslate)) {
              if (value.length > 0) {
                try {
                  console.log('Translating ' + key + ' for menu ID: ' + menu._id);
                  let translationsResult = await this.aiService.translateManyMessages(
                    value,
                    location.supportedLanguages
                  );

                  console.log('Translations result:');
                  console.log(translationsResult);

                  if (translationsResult.messages && translationsResult.messages.length > 0) {
                    translatedFields[key] = translationsResult.messages;
                  } else {
                    this.logger.warn(`No translations found for ${key} in menu ID: ${menu._id}`);
                  }
                } catch (error) {
                  this.logger.error(`Error translating ${key} for menu ID: ${menu._id}`, error);
                }
              }
            }

            // Update the menu with translated fields
            const updateSet: any = {
              needsTranslation: false,
            };

            if (menu.name) {
              updateSet.name = menu.name;
            }

            if (translatedFields.itemNames.length > 0 || translatedFields.itemDescriptions.length > 0) {
              menu.items.forEach((item: any, index: number) => {
                if (translatedFields.itemNames[index] && translatedFields.itemNames[index].translations.length > 0) {
                  item.name = item.name || {};
                  translatedFields.itemNames[index].translations.forEach((translation) => {
                    item.name[translation.code] = translation.value;
                  });
                  updateSet[`items.${index}.name`] = item.name;
                }
                if (
                  translatedFields.itemDescriptions[index] &&
                  translatedFields.itemDescriptions[index].translations.length > 0
                ) {
                  item.description = item.description || {};
                  translatedFields.itemDescriptions[index].translations.forEach((translation) => {
                    item.description[translation.code] = translation.value;
                  });
                  updateSet[`items.${index}.description`] = item.description;
                }
              });
            }

            if (translatedFields.categoryNames.length > 0 || translatedFields.categoryDescriptions.length > 0) {
              menu.categories.forEach((category: any, index: number) => {
                if (
                  translatedFields.categoryNames[index] &&
                  translatedFields.categoryNames[index].translations.length > 0
                ) {
                  category.name = category.name || {};
                  translatedFields.categoryNames[index].translations.forEach((translation) => {
                    category.name[translation.code] = translation.value;
                  });
                  updateSet[`categories.${index}.name`] = category.name;
                }
                if (
                  translatedFields.categoryDescriptions[index] &&
                  translatedFields.categoryDescriptions[index].translations.length > 0
                ) {
                  category.description = category.description || {};
                  translatedFields.categoryDescriptions[index].translations.forEach((translation) => {
                    category.description[translation.code] = translation.value;
                  });
                  updateSet[`categories.${index}.description`] = category.description;
                }
              });
            }

            if (Object.keys(updateSet).length > 1) {
              // needsTranslation is always there
              await this.menusCollection.updateOne({ _id: menu._id }, { $set: updateSet });
              console.log(`Successfully translated and updated menu ID: ${menu._id}`);
            } else {
              await this.menusCollection.updateOne({ _id: menu._id }, { $set: { needsTranslation: false } });
              this.logger.log(
                `Menu ID: ${menu._id} processed, no new translations applied, marked as not needing translation.`
              );
            }
          } else {
            this.logger.warn(
              `No supported languages found for menu ID: ${menu._id}, Location ID: ${locationId}, Restaurant ID: ${restaurantId}`
            );
          }
        } else {
          this.logger.warn(
            `Location not found or supportedLanguages missing for menu ID: ${menu._id}, Location ID: ${locationId}, Restaurant ID: ${restaurantId}`
          );
        }
      } else {
        this.logger.warn(`Missing locationId or restaurantId for menu ID: ${menu._id}`);
      }
    });

    return {
      succeeded: true,
      message: 'Job started',
    };
  }

  async getMenusForTranslation() {
    const menus = await this.menusCollection.find({ needsTranslation: true }).toArray();
    return menus;
  }
}
