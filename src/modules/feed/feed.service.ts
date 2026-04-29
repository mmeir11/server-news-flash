import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { FeedQueryDto } from './feed.dto';

@Injectable()
export class FeedService {
  getChronologicalFeed(user: AuthenticatedUser, query: FeedQueryDto) {
    return {
      data: [],
      pagination: {
        cursor: null,
        hasMore: false,
      },
      meta: {
        userId: user.id,
        strategy: 'chronological_follows_first',
        filters: query,
      },
    };
  }
}