import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/database//schema/Category.schema';
import { User, UserSchema } from 'src/database/schema/User.schema';
import { AwsService } from 'src/config/storagebucket';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, AwsService],
})
export class CategoryModule {}
