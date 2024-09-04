import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { SearchParams } from 'src/common/types/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLES } from 'src/common/constants';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard)
  @Roles(ROLES.ADMIN)
  create(
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
    @Req() request: Request,
  ) {
    return this.categoryService.create({ request, createCategoryDto, image });
  }

  @Get()
  findAll(
    @Query()
    query?: SearchParams,
  ) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard)
  @Roles(ROLES.ADMIN)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
    @Req() request: Request,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.categoryService.update({
      id,
      updateCategoryDto,
      image,
      request,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
