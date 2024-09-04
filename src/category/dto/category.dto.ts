import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty({ message: 'Category slug is required' })
  slug: string;

  @IsOptional()
  parentCategory: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
