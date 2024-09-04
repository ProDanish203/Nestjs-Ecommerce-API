import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ROLES } from 'src/common/constants';

export type UserDocument = User &
  Document & {
    comparePassword(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
  };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ required: false, minlength: 7 })
  phone: string;

  @Prop({ default: ROLES.USER })
  role: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  hasNotifications: boolean;

  _id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = async function (
  this: UserDocument,
): Promise<string> {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.plugin(mongoosePaginate);
