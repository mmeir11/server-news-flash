import { Injectable } from '@nestjs/common';
import { Prisma, RatingType } from '@prisma/client';
import { presentArticle } from '../../common/presenters/newsflash-presenters';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { CreateBookmarkDto } from './bookmarks.dto';

const articleInclude = {
  publisher: { include: { user: true } },
  media: true,
} satisfies Prisma.ArticleInclude;

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookmarks(user: AuthenticatedUser) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { article: { include: articleInclude } },
      orderBy: { createdAt: 'desc' },
    });

    const myRatings = await this.getMyRatings(bookmarks.map((bookmark) => bookmark.articleId), user);

    return {
      bookmarks: bookmarks.map((bookmark) => presentArticle(bookmark.article, myRatings.get(bookmark.articleId), true)),
      total: bookmarks.length,
    };
  }

  async createBookmark(user: AuthenticatedUser, dto: CreateBookmarkDto) {
    await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: { id: user.id, email: user.email ?? `${user.id}@newsflash.local`, fullName: user.email?.split('@')[0] },
    });

    return this.prisma.bookmark.upsert({
      where: { userId_articleId: { userId: user.id, articleId: dto.article_id } },
      update: {},
      create: { userId: user.id, articleId: dto.article_id },
    });
  }

  async deleteBookmark(user: AuthenticatedUser, articleId: string) {
    await this.prisma.bookmark.deleteMany({ where: { userId: user.id, articleId } });
  }

  private async getMyRatings(articleIds: string[], user: AuthenticatedUser): Promise<Map<string, RatingType>> {
    if (articleIds.length === 0) {
      return new Map();
    }

    const ratings = await this.prisma.rating.findMany({
      where: { userId: user.id, articleId: { in: articleIds } },
      select: { articleId: true, type: true },
    });

    return new Map(ratings.map((rating) => [rating.articleId, rating.type]));
  }
}