import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { FeedQueryDto } from './feed.dto';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Get()
  getFeed(@CurrentUser() user: AuthenticatedUser | undefined, @Query() query: FeedQueryDto) {
    return this.feedService.getChronologicalFeed(user, query);
  }
}