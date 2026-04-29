import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}