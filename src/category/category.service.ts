import { Request } from 'express';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  Category,
  CategoryDocument,
} from 'src/database/schema/Category.schema';
import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SearchParams } from 'src/common/types/types';
import { getPaginatedData, throwError } from 'src/common/helpers/helpers';
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
      if (!request.user)
        throw throwError('Unauthorized Access', HttpStatus.UNAUTHORIZED);
      const { name, description, slug, parentCategory } = createCategoryDto;

      const image_url = await this.awsService.uploadFile(image);
      if (!image_url)
        throw throwError('Failed to upload image', HttpStatus.BAD_REQUEST);

      const category = await this.categoryModel.create({
        name,
        description,
        slug,
        parentCategory,
        createdBy: request.user._id,
        image: image_url.filename,
      });

      if (!category)
        throwError('Failed to create category', HttpStatus.BAD_REQUEST);

      return {
        message: 'Category created',
        data: category,
        success: true,
      };
    } catch (error) {
      console.error('Failed to create category:', error);
      throw throwError(error, HttpStatus.BAD_REQUEST);
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
      throw throwError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category)
        throw throwError('Category not found', HttpStatus.NOT_FOUND);

      return {
        message: 'Category found',
        data: category,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      throw throwError(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (!request.user)
        throw throwError('Unauthorized Access', HttpStatus.UNAUTHORIZED);

      const category = await this.categoryModel.findById(id);
      if (!category)
        throw throwError('Category not found', HttpStatus.NOT_FOUND);

      const { name, description, slug, parentCategory } = updateCategoryDto;

      let image_url: any;
      if (image) {
        const { filename } = await this.awsService.uploadFile(image);
        if (!filename)
          throw throwError('Failed to upload image', HttpStatus.BAD_REQUEST);
        else {
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

      if (!updatedCategory)
        throw throwError('Failed to update category', HttpStatus.BAD_REQUEST);

      return {
        message: 'Category updated',
        data: updatedCategory,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get all categories:', error);
      throw throwError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category)
        throw throwError('Category not found', HttpStatus.NOT_FOUND);

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
      throw throwError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
