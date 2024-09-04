import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './User.schema';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: [true, 'Category name is required'], index: true })
  name: string;

  @Prop({
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: [true, 'Category Image is required'] })
  image: string;

  @Prop({
    required: [true, 'Created by is required'],
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: User;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  parentCategory: Category;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(mongoosePaginate);
