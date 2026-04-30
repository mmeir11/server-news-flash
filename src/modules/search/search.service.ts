import { Injectable } from '@nestjs/common';
import { ArticleStatus, Prisma, RatingType } from '@prisma/client';
import { presentArticle, presentPublisher } from '../../common/presenters/newsflash-presenters';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

const publisherInclude = {
  user: true,
  articles: { select: { nicheId: true }, where: { status: ArticleStatus.published, deletedAt: null } },
} satisfies Prisma.PublisherProfileInclude;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, type = 'all', niche?: string, user?: AuthenticatedUser) {
    const trimmed = query.trim();

    if (!trimmed) {
      return { articles: [], publishers: [] };
    }

    const includeArticles = type === 'all' || type === 'articles';
    const includePublishers = type === 'all' || type === 'publishers';

    const [articles, publishers] = await Promise.all([
      includeArticles
        ? this.prisma.article.findMany({
            where: {
              status: ArticleStatus.published,
              deletedAt: null,
              nicheId: niche,
              OR: [
                { title: { contains: trimmed, mode: 'insensitive' } },
                { summary: { contains: trimmed, mode: 'insensitive' } },
                { content: { contains: trimmed, mode: 'insensitive' } },
                { publisher: { displayName: { contains: trimmed, mode: 'insensitive' } } },
              ],
            },
            include: articleInclude,
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            take: 30,
          })
        : [],
      includePublishers
        ? this.prisma.publisherProfile.findMany({
            where: {
              OR: [
                { displayName: { contains: trimmed, mode: 'insensitive' } },
                { bio: { contains: trimmed, mode: 'insensitive' } },
                { handle: { contains: trimmed, mode: 'insensitive' } },
              ],
            },
            include: publisherInclude,
            orderBy: [{ credibilityScore: 'desc' }, { followerCount: 'desc' }],
            take: 30,
          })
        : [],
    ]);

    const myRatings = await this.getMyRatings(articles.map((article) => article.id), user);
    const myBookmarks = await this.getMyBookmarks(articles.map((article) => article.id), user);

    return {
      articles: articles.map((article) => presentArticle(article, myRatings.get(article.id), myBookmarks.has(article.id))),
      publishers: publishers.map(presentPublisher),
    };
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