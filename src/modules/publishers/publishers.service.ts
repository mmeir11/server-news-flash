import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { presentArticle, presentPublisher } from '../../common/presenters/newsflash-presenters';
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

  async getPublisherArticles(id: string, hasVideo?: boolean) {
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

    return { articles: articles.map(presentArticle), total: articles.length };
  }
}