import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, MediaType, Prisma, RatingType } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { CreateArticleDto, ListAdminArticlesQueryDto, ListArticlesQueryDto } from './articles.dto';
import { presentArticle } from '../../common/presenters/newsflash-presenters';

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async listArticles(query: ListArticlesQueryDto, user?: AuthenticatedUser) {
    const articles = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.published,
        deletedAt: null,
        nicheId: query.niche,
        publisherId: query.publisherId ?? query.publisher_id,
        hasVideo: query.hasVideo ?? query.has_video,
      },
      include: articleInclude,
      orderBy: this.getOrderBy(query.sort),
      take: query.limit,
    });
    const myRatings = await this.getMyRatings(articles.map((article) => article.id), user);
    const myBookmarks = await this.getMyBookmarks(articles.map((article) => article.id), user);

    return {
      data: articles.map((article) => presentArticle(article, myRatings.get(article.id), myBookmarks.has(article.id))),
      pagination: { cursor: null, has_more: false },
    };
  }

  async listAdminArticles(query: ListAdminArticlesQueryDto) {
    const articles = await this.prisma.article.findMany({
      where: {
        deletedAt: null,
        nicheId: query.niche,
        publisherId: query.publisherId ?? query.publisher_id,
        hasVideo: query.hasVideo ?? query.has_video,
      },
      include: articleInclude,
      orderBy: [{ createdAt: 'desc' }],
      take: query.limit,
    });

    return {
      data: articles.map((article) => presentArticle(article)),
      pagination: { cursor: null, has_more: false },
    };
  }

  async getArticle(id: string, user?: AuthenticatedUser) {
    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: articleInclude,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const myRatings = await this.getMyRatings([article.id], user);
    const myBookmarks = await this.getMyBookmarks([article.id], user);
    return presentArticle(article, myRatings.get(article.id), myBookmarks.has(article.id));
  }

  async createArticle(user: AuthenticatedUser, dto: CreateArticleDto) {
    await this.ensurePublisher(user);

    const media = dto.media_ids?.length
      ? await this.prisma.articleMedia.findMany({ where: { id: { in: dto.media_ids }, ownerId: user.id } })
      : [];
    const thumbnail = media.find((item) => item.type === MediaType.article_thumbnail);
    const hasVideo = media.some((item) => item.type === MediaType.article_video_original);
    const status = dto.status ?? 'published';

    const article = await this.prisma.article.create({
      data: {
        publisherId: user.id,
        nicheId: dto.niche,
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        hasVideo,
        thumbnailUrl: thumbnail?.publicUrl,
      },
      include: articleInclude,
    });

    if (media.length > 0) {
      await this.prisma.articleMedia.updateMany({
        where: { id: { in: media.map((item) => item.id) } },
        data: { articleId: article.id },
      });
    }

    await this.prisma.publisherProfile.update({
      where: { userId: user.id },
      data: { articleCount: { increment: 1 } },
    });

    return this.getArticle(article.id, user);
  }

  async deleteAdminArticle(id: string) {
    const article = await this.prisma.article.findFirst({ where: { id, deletedAt: null } });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.removed, deletedAt: new Date() },
    });

    return null;
  }

  private getOrderBy(sort: ListArticlesQueryDto['sort']): Prisma.ArticleOrderByWithRelationInput[] {
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

  private async ensurePublisher(user: AuthenticatedUser) {
    await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@newsflash.local`,
        fullName: user.email?.split('@')[0] ?? 'NewsFlash Publisher',
        role: 'publisher',
      },
    });

    await this.prisma.publisherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.email?.split('@')[0] ?? 'NewsFlash Publisher',
        handle: `publisher-${user.id.slice(0, 8)}`,
        credibilityScore: 50,
      },
    });
  }
}