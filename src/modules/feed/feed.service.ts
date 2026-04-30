import { Injectable } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { presentArticle } from '../../common/presenters/newsflash-presenters';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { FeedQueryDto } from './feed.dto';

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getChronologicalFeed(user: AuthenticatedUser | undefined, query: FeedQueryDto) {
    const articles = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.published,
        deletedAt: null,
        nicheId: query.niche,
        hasVideo: query.hasVideo,
        publisher: query.minCredibility ? { credibilityScore: { gte: query.minCredibility } } : undefined,
      },
      include: articleInclude,
      orderBy: this.getOrderBy(query.sort),
      take: query.limit,
    });

    return {
      data: articles.map(presentArticle),
      pagination: {
        cursor: null,
        has_more: false,
      },
      meta: {
        userId: user?.id ?? null,
        strategy: 'chronological_follows_first',
        filters: query,
      },
    };
  }

  private getOrderBy(sort: FeedQueryDto['sort']): Prisma.ArticleOrderByWithRelationInput[] {
    switch (sort) {
      case 'popular':
        return [{ viewCount: 'desc' }, { publishedAt: 'desc' }];
      case 'reliable':
        return [{ reliableCount: 'desc' }, { publishedAt: 'desc' }];
      case 'important':
        return [{ importantCount: 'desc' }, { publishedAt: 'desc' }];
      case 'recent':
      default:
        return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
    }
  }
}