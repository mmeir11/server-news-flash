import { Injectable } from '@nestjs/common';
import { Prisma, RatingType } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { UpsertRatingDto } from './ratings.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertRating(articleId: string, user: AuthenticatedUser, dto: UpsertRatingDto) {
    await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: { id: user.id, email: user.email ?? `${user.id}@newsflash.local`, fullName: user.email?.split('@')[0] },
    });

    const existing = await this.prisma.rating.findUnique({ where: { articleId_userId: { articleId, userId: user.id } } });

    const removedRating = existing?.type === dto.type;
    const article = await this.prisma.$transaction(async (tx) => {
      if (removedRating) {
        await tx.rating.delete({ where: { id: existing.id } });
        await this.decrementArticleCounter(tx, articleId, existing.type);
      } else if (existing) {
        await tx.rating.update({ where: { id: existing.id }, data: { type: dto.type } });
        await this.decrementArticleCounter(tx, articleId, existing.type);
        await this.incrementArticleCounter(tx, articleId, dto.type);
      } else {
        await tx.rating.create({ data: { articleId, userId: user.id, type: dto.type } });
        await this.incrementArticleCounter(tx, articleId, dto.type);
      }

      return tx.article.findUniqueOrThrow({
        where: { id: articleId },
        select: { reliableCount: true, notReliableCount: true, importantCount: true },
      });
    });

    return {
      rating: removedRating ? null : { article_id: articleId, user_id: user.id, type: dto.type },
      article: {
        reliable_count: article.reliableCount,
        not_reliable_count: article.notReliableCount,
        important_count: article.importantCount,
      },
    };
  }

  private async incrementArticleCounter(
    tx: Prisma.TransactionClient,
    articleId: string,
    type: RatingType,
  ) {
    await tx.article.update({
      where: { id: articleId },
      data: { [this.getCounterField(type)]: { increment: 1 } },
    });
  }

  private async decrementArticleCounter(
    tx: Prisma.TransactionClient,
    articleId: string,
    type: RatingType,
  ) {
    const field = this.getCounterField(type);

    await tx.article.updateMany({
      where: { id: articleId, [field]: { gt: 0 } },
      data: { [field]: { decrement: 1 } },
    });
  }

  private getCounterField(type: RatingType) {
    switch (type) {
      case RatingType.not_reliable:
        return 'notReliableCount';
      case RatingType.important:
        return 'importantCount';
      case RatingType.reliable:
      default:
        return 'reliableCount';
    }
  }
}