import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { presentComment } from '../../common/presenters/newsflash-presenters';
import { PrismaService } from '../database/prisma.service';
import { CreateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticleComments(articleId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { articleId, deletedAt: null },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return { comments: comments.map(presentComment), total: comments.length };
  }

  async createComment(articleId: string, user: AuthenticatedUser, dto: CreateCommentDto) {
    await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@newsflash.local`,
        fullName: user.email?.split('@')[0] ?? 'NewsFlash Reader',
      },
    });

    const comment = await this.prisma.comment.create({
      data: { articleId, authorId: user.id, content: dto.content },
      include: { author: true },
    });

    await this.prisma.article.update({ where: { id: articleId }, data: { commentCount: { increment: 1 } } });

    return presentComment(comment);
  }
}