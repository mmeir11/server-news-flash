import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { UsersService } from './users.service';
import { InviteUserDto, ListUsersQueryDto, UpdateUserRoleDto } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getOrCreateCurrentUser(user);
  }
}

@Controller('admin/users')
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.listAdminUsers(query);
  }

  @Patch(':id')
  updateUserRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateAdminUserRole(id, dto.role);
  }

  @Post('invite')
  inviteUser(@Body() dto: InviteUserDto) {
    return this.usersService.inviteAdminUser(dto);
  }
}