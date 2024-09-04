import { ROLES } from '../constants';

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface SearchParams {
  search?: string;
  limit?: number;
  page?: number;
  filter?: string;
  parentId?: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  filename: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isEmailVerified?: boolean;
  hasNotifications?: boolean;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  createdBy: IUser;
  parentCategory?: ICategory;
}
