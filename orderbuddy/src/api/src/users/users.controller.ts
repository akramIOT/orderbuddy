import { Body, Controller, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, DeleteUserDto } from '../users/dtos/users.controller.dto';
import { Request, Response } from 'express';
import { User } from '../models/users';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);
  @Post('create-user')
  async createUser(@Body() userInfo: CreateUserDto, @Res() res: Response) {
    try {
      // Validate that at least one contact method is provided
      if (!userInfo.email && !userInfo.phoneNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Either email or phone number is required' });
      }

      const user: User = {
        restaurants: [],
        userId: userInfo.userId,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
        createdAt: new Date(userInfo.createdAt),
      };

      const userId = await this.userService.createUser(user);

      this.logger.debug(`User created/updated: ${userId}`);
      return res.status(HttpStatus.CREATED).json({ userId });
    } catch (error) {
      this.logger.error('Error in createUser:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create user' });
    }
  }

  @Post('delete-user')
  async deleteUser(@Body() body: DeleteUserDto, @Req() req: Request, @Res() res: Response) {
    this.userService.deleteUserForId(body.userId);
    res.status(HttpStatus.OK).send('User deleted');
  }
}
