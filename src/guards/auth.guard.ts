import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schema/User.schema';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { Role } from '../common/types/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized Access');
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as jwt.JwtPayload;

      const user = await this.userModel
        .findById(payload.id)
        .select('-password');

      if (!user) throw new UnauthorizedException('Unauthorized Access');

      const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

      if (roles && !roles.includes(user.role as Role))
        throw new ForbiddenException('Forbidden Access');

      (request as any).user = user;

      return true;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Authentication Error');
    }
  }

  private extractToken(request: Request): string | null {
    let token = '';
    if (request.cookies?.token) {
      token = request.cookies.token;
    }

    const authorization = request.headers['authorization'];
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.replace('Bearer ', '');
    }

    return token;
  }
}
