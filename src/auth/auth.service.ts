import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/database/schema/User.schema';
import { Model } from 'mongoose';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register({ email, name, password, phone, role }: RegisterDto) {
    try {
      // Check if user already exists
      const userExist = await this.userModel.findOne({
        email,
      });

      if (userExist) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userModel.create({
        email,
        name,
        password,
        phone,
        role,
      });
      if (!user) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        message: 'User created successfully',
        data: user,
        success: true,
      };
    } catch (error) {
      console.log(error);
      return {
        message: error.message || 'Failed to create user',
        success: false,
      };
    }
  }

  async login({
    response,
    loginDto,
  }: {
    response: Response;
    loginDto: LoginDto;
  }) {
    try {
      const { email, password } = loginDto;
      const user = await this.userModel.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = await user.generateAccessToken();
      const cookieOptions = {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: 'none' as 'none',
        httpOnly: true,
        secure: true,
      };
      response.cookie('token', accessToken, cookieOptions);
      return {
        message: 'Login successful',
        data: { user, accessToken },
        success: true,
      };
    } catch (error: any) {
      console.log(error.message);
      return {
        message: error.message || 'Invalid Credentials',
        success: false,
      };
    }
  }

  async logout(request: Request, response: Response) {
    try {
      if (!request.user) throw new UnauthorizedException('Unauthorized Access');
      const cookieOptions = {
        sameSite: 'none' as 'none',
        httpOnly: true,
        secure: true,
      };

      response.clearCookie('token', cookieOptions);
      return {
        message: 'Logout successful',
        success: true,
      };
    } catch (error) {
      console.log(error);
      return {
        message: error.message || 'Logout failed',
        success: false,
      };
    }
  }
}
