import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/reports')
@Roles('admin', 'moderator')
export class ModerationController {
  @Get()
  listReports() {
    return {
      data: [],
      pagination: {
        cursor: null,
        hasMore: false,
      },
    };
  }
}