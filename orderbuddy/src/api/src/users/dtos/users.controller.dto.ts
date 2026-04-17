import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userId!: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string

  @IsNotEmpty()
  createdAt!: Date
}

export interface DeleteUserDto {
  userId: string
}
