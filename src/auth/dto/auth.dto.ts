import { ROLES } from '../../common/constants';
import {
  IsEnum,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsStrongPassword({ minLength: 6 }, { message: 'Password is too weak' })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsEnum(ROLES, {
    message: `Role must be one of these: ${Object.values(ROLES)}`,
  })
  role: keyof typeof ROLES;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
