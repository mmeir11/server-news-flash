import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, MediaType, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { CreateArticleDto, ListArticlesQueryDto } from './articles.dto';
import { presentArticle } from '../../common/presenters/newsflash-presenters';

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async listArticles(query: ListArticlesQueryDto) {
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

    return {
      data: articles.map(presentArticle),
      pagination: { cursor: null, has_more: false },
    };
  }

  async getArticle(id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: articleInclude,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return presentArticle(article);
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

    return this.getArticle(article.id);
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