import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/database/User.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register({ email, name, password, phone, role }: RegisterDto) {
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
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
    return {
      message: 'User created successfully',
      data: user,
      success: true,
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userModel.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await user.generateAccessToken();

    return {
      message: 'Login successful',
      data: { user, accessToken },
      success: true,
    };
  }
  async logout() {
    return `Logout`;
  }
}
