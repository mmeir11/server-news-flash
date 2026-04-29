import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { FeedQueryDto } from './feed.dto';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(@CurrentUser() user: AuthenticatedUser, @Query() query: FeedQueryDto) {
    return this.feedService.getChronologicalFeed(user, query);
  }
}