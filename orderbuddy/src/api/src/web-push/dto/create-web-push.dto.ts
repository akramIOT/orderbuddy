import { IsString, IsNotEmpty, IsEnum } from 'class-validator'

export interface WebPushSubscription {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export class CreateWebPushDto {
  @IsString()
  @IsNotEmpty()
  restaurantId!: string

  @IsString()
  token!: string

  @IsEnum(['android', 'web'])
  platform!: 'android' | 'web'
}

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  body!: string

  @IsString()
  @IsNotEmpty()
  restaurantId!: string

  @IsEnum(['all', 'android', 'web'])
  platform?: 'all' | 'android' | 'web' = 'all'
}
