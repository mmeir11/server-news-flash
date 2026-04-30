import { Injectable } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { presentArticle, presentPublisher } from '../../common/presenters/newsflash-presenters';
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

  async search(query: string, type = 'all', niche?: string) {
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

    return { articles: articles.map(presentArticle), publishers: publishers.map(presentPublisher) };
  }
}