import { Injectable } from '@nestjs/common';
import { RatingType } from '@prisma/client';
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

    if (existing?.type === dto.type) {
      await this.prisma.rating.delete({ where: { id: existing.id } });
    } else if (existing) {
      await this.prisma.rating.update({ where: { id: existing.id }, data: { type: dto.type } });
    } else {
      await this.prisma.rating.create({ data: { articleId, userId: user.id, type: dto.type } });
    }

    const counts = await this.prisma.rating.groupBy({
      by: ['type'],
      where: { articleId },
      _count: { type: true },
    });
    const countByType = new Map(counts.map((item) => [item.type, item._count.type]));

    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        reliableCount: countByType.get(RatingType.reliable) ?? 0,
        notReliableCount: countByType.get(RatingType.not_reliable) ?? 0,
        importantCount: countByType.get(RatingType.important) ?? 0,
      },
      select: { reliableCount: true, notReliableCount: true, importantCount: true },
    });

    return {
      rating: existing?.type === dto.type ? null : { article_id: articleId, user_id: user.id, type: dto.type },
      article: {
        reliable_count: article.reliableCount,
        not_reliable_count: article.notReliableCount,
        important_count: article.importantCount,
      },
    };
  }
}