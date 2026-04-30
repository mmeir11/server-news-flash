import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma, RatingType } from '@prisma/client';
import { presentArticle, presentPublisher } from '../../common/presenters/newsflash-presenters';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';

const publisherInclude = {
  user: true,
  articles: { select: { nicheId: true }, where: { status: ArticleStatus.published, deletedAt: null } },
} satisfies Prisma.PublisherProfileInclude;

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

@Injectable()
export class PublishersService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishers() {
    const publishers = await this.prisma.publisherProfile.findMany({
      include: publisherInclude,
      orderBy: [{ credibilityScore: 'desc' }, { followerCount: 'desc' }],
    });

    return { publishers: publishers.map(presentPublisher) };
  }

  async getPublisher(id: string) {
    const publisher = await this.prisma.publisherProfile.findUnique({
      where: { userId: id },
      include: publisherInclude,
    });

    if (!publisher) {
      throw new NotFoundException('Publisher not found');
    }

    return presentPublisher(publisher);
  }

  async getPublisherArticles(id: string, user?: AuthenticatedUser, hasVideo?: boolean) {
    const articles = await this.prisma.article.findMany({
      where: {
        publisherId: id,
        hasVideo,
        status: ArticleStatus.published,
        deletedAt: null,
      },
      include: articleInclude,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
    const myRatings = await this.getMyRatings(articles.map((article) => article.id), user);
    const myBookmarks = await this.getMyBookmarks(articles.map((article) => article.id), user);

    return { articles: articles.map((article) => presentArticle(article, myRatings.get(article.id), myBookmarks.has(article.id))), total: articles.length };
  }

  private async getMyRatings(articleIds: string[], user?: AuthenticatedUser): Promise<Map<string, RatingType>> {
    if (!user || articleIds.length === 0) {
      return new Map();
    }

    const ratings = await this.prisma.rating.findMany({
      where: { userId: user.id, articleId: { in: articleIds } },
      select: { articleId: true, type: true },
    });

    return new Map(ratings.map((rating) => [rating.articleId, rating.type]));
  }

  private async getMyBookmarks(articleIds: string[], user?: AuthenticatedUser): Promise<Set<string>> {
    if (!user || articleIds.length === 0) {
      return new Set();
    }

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: user.id, articleId: { in: articleIds } },
      select: { articleId: true },
    });

    return new Set(bookmarks.map((bookmark) => bookmark.articleId));
  }
}