import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(
    @Res({ passthrough: true }) response: Response,
    @Body(ValidationPipe) loginDto: LoginDto,
  ) {
    return this.authService.login({ response, loginDto });
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true }) response: Response,
    // @Req() request: Request,
  ) {
    // console.log(request.cookies);
    return this.authService.logout(response);
  }
}
