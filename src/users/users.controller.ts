import { Request } from 'express';
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchParams } from 'src/common/types/types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROLES } from 'src/common/constants';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(ROLES.ADMIN) //Only admins can access this route
  allUsers(
    @Query()
    query?: SearchParams,
  ) {
    return this.usersService.allUsers(query);
  }

  @Get('current')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  currentUser(@Req() request: Request) {
    return this.usersService.currentUser(request);
  }

  @Get(':id')
  singleUser(@Param('id') id: string) {
    return this.usersService.singleUser(id);
  }
}
