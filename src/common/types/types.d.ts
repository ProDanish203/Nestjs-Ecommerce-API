import { ROLES } from '../constants';

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface SearchParams {
  search?: string;
  limit?: number;
  page?: number;
  filter?: string;
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
