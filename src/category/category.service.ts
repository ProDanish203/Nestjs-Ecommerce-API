import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  Category,
  CategoryDocument,
} from 'src/database/schema/Category.schema';
import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SearchParams } from 'src/common/types/types';
import { getPaginatedData } from 'src/common/helpers/helpers';
import { User } from 'src/database/schema/User.schema';
import { AwsService } from 'src/config/storagebucket';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: PaginateModel<CategoryDocument>,
    private readonly awsService: AwsService,
  ) {}

  async create({
    request,
    createCategoryDto,
    image,
  }: {
    request: Request;
    createCategoryDto: CreateCategoryDto;
    image: any;
  }) {
    try {
      if (!request.user) throw new UnauthorizedException();
      const { name, description, slug, parentCategory } = createCategoryDto;

      const image_url = await this.awsService.uploadFile(image);
      if (!image_url) {
        return {
          message: 'Failed to upload image',
          success: false,
        };
      }

      const category = await this.categoryModel.create({
        name,
        description,
        slug,
        parentCategory,
        createdBy: request.user._id,
        image: image_url.filename,
      });

      if (!category) {
        return {
          message: 'Failed to create category',
          success: false,
        };
      }

      return {
        message: 'Category created',
        data: category,
        success: true,
      };
    } catch (error) {
      console.error('Failed to create category:', error);
      return {
        message: error.message || 'Category not created',
        success: false,
      };
    }
  }

  async findAll(query?: SearchParams) {
    try {
      const page = +(query?.page || 1);
      const limit = +(query.limit || 10);
      const search = query.search || '';
      const filter = query.filter || '';
      const parentId = query.parentId || null;
      let sortDirection = 1;

      if (filter.toLowerCase() === 'ztoa') sortDirection = -1;
      const populate = {
        path: 'createdBy',
        model: User.name,
        select: '_id name email role',
      };

      const queryValue: any = { name: { $regex: `^${search}`, $options: 'i' } };
      if (parentId) queryValue.parentCategory = parentId;
      else queryValue.parentCategory = null;

      const { data, pagination } = await getPaginatedData({
        model: this.categoryModel,
        query: queryValue,
        page,
        limit,
        sort: { name: sortDirection },
        select: '-password',
        populate,
      });

      return {
        message: 'Categories found',
        data,
        pagination,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      return {
        message: error.message || 'Categories not found',
        success: false,
      };
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        return {
          message: 'Category not found',
          success: false,
        };
      }

      return {
        message: 'Category found',
        data: category,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      return {
        message: error.message || 'Categories not found',
        success: false,
      };
    }
  }

  async update({
    request,
    id,
    updateCategoryDto,
    image,
  }: {
    request: Request;
    id: string;
    image?: any;
    updateCategoryDto: UpdateCategoryDto;
  }) {
    try {
      if (!request.user) throw new UnauthorizedException();

      const category = await this.categoryModel.findById(id);
      if (!category) {
        return {
          message: 'Category not found',
          success: false,
        };
      }

      const { name, description, slug, parentCategory } = updateCategoryDto;

      let image_url: any;
      if (image) {
        const { filename } = await this.awsService.uploadFile(image);
        if (!filename) {
          return {
            message: 'Failed to upload image',
            success: false,
          };
        } else {
          image_url = filename;

          await this.awsService.removeFile(category.image);
        }
      }

      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        {
          name,
          description,
          slug,
          parentCategory,
          image: image_url,
        },
        { new: true },
      );

      if (!updatedCategory) {
        return {
          message: 'Failed to update category',
          success: false,
        };
      }

      return {
        message: 'Category updated',
        data: updatedCategory,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      return {
        message: error.message || 'Categories not found',
        success: false,
      };
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) {
        return {
          message: 'Category not found',
          success: false,
        };
      }

      await this.categoryModel.findByIdAndDelete(id);
      await this.categoryModel.updateMany(
        { parentCategory: id },
        { $unset: { parentCategory: '' } },
      );
      await this.awsService.removeFile(category.image);

      return {
        message: 'Category deleted',
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      return {
        message: error.message || 'Categories not found',
        success: false,
      };
    }
  }
}
