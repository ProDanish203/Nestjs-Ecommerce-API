import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { User, UserDocument } from 'src/database/User.schema';
import { Request } from 'express';
import { SearchParams } from 'src/common/types/types';
import { getPaginatedData } from 'src/common/helpers/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
  ) {}

  async allUsers(query?: SearchParams) {
    try {
      const page = +(query?.page || 1);
      const limit = +(query.limit || 10);
      const search = query.search || '';
      const filter = query.filter || '';
      let sortDirection = 1;

      if (filter.toLowerCase() === 'ztoa') sortDirection = -1;

      const { data, pagination } = await getPaginatedData({
        model: this.userModel,
        query: { name: { $regex: `^${search}`, $options: 'i' } },
        page,
        limit,
        sort: { name: sortDirection },
        select: '-password',
      });

      return {
        message: 'Users found',
        data,
        pagination,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all users:', error);
      return {
        message: 'Users not found',
        success: false,
      };
    }
  }

  async singleUser(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password');

      if (!user) {
        return {
          message: 'User not found',
          success: false,
        };
      }

      return {
        message: 'User found',
        data: user,
        success: true,
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        message: 'User not found',
        success: false,
      };
    }
  }

  async currentUser(request: Request) {
    try {
      if (!request.user) throw UnauthorizedException;

      return {
        message: 'User found',
        data: request.user,
        success: true,
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Authentication Error');
    }
  }
}
