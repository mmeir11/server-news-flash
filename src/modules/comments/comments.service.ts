import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { presentComment } from '../../common/presenters/newsflash-presenters';
import { PrismaService } from '../database/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

type CommentLikeRow = { id: string; commentId: string; userId: string };

type CommentLikeDelegate = {
  findUnique(args: unknown): Promise<CommentLikeRow | null>;
  findMany(args: unknown): Promise<Array<Pick<CommentLikeRow, 'commentId'>>>;
  create(args: unknown): Promise<CommentLikeRow>;
  delete(args: unknown): Promise<CommentLikeRow>;
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticleComments(articleId: string, user?: AuthenticatedUser) {
    const comments = await this.prisma.comment.findMany({
      where: { articleId, deletedAt: null },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    const myLikes = await this.getMyCommentLikes(comments.map((comment) => comment.id), user);

    return {
      comments: comments.map((comment) => presentComment(comment, user?.id, myLikes.has(comment.id))),
      total: comments.length,
    };
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

    return presentComment(comment, user.id);
  }

  async toggleCommentLike(articleId: string, commentId: string, user: AuthenticatedUser) {
    await this.ensureProfile(user);
    const comment = await this.getExistingComment(articleId, commentId);

    const existing = await this.getCommentLikeDelegate(this.prisma).findUnique({
      where: { commentId_userId: { commentId: comment.id, userId: user.id } },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const commentLike = this.getCommentLikeDelegate(tx);

      if (existing) {
        await commentLike.delete({ where: { id: existing.id } });
        await tx.comment.updateMany({
          where: { id: comment.id, likeCount: { gt: 0 } },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await commentLike.create({ data: { commentId: comment.id, userId: user.id } });
        await tx.comment.update({ where: { id: comment.id }, data: { likeCount: { increment: 1 } } });
      }

      return tx.comment.findUniqueOrThrow({ where: { id: comment.id }, include: { author: true } });
    });

    return presentComment(updated, user.id, !existing);
  }

  async updateComment(articleId: string, commentId: string, user: AuthenticatedUser, dto: UpdateCommentDto) {
    const comment = await this.getOwnedComment(articleId, commentId, user.id);

    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data: { content: dto.content },
      include: { author: true },
    });

    return presentComment(updated, user.id);
  }

  async deleteComment(articleId: string, commentId: string, user: AuthenticatedUser) {
    const comment = await this.getOwnedComment(articleId, commentId, user.id);

    await this.prisma.$transaction([
      this.prisma.comment.update({ where: { id: comment.id }, data: { deletedAt: new Date() } }),
      this.prisma.article.updateMany({
        where: { id: articleId, commentCount: { gt: 0 } },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);
  }

  private async getOwnedComment(articleId: string, commentId: string, userId: string) {
    const comment = await this.getExistingComment(articleId, commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return comment;
  }

  private async getExistingComment(articleId: string, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, articleId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  private async getMyCommentLikes(commentIds: string[], user?: AuthenticatedUser): Promise<Set<string>> {
    if (!user || commentIds.length === 0) {
      return new Set();
    }

    const likes = await this.getCommentLikeDelegate(this.prisma).findMany({
      where: { userId: user.id, commentId: { in: commentIds } },
      select: { commentId: true },
    });

    return new Set(likes.map((like) => like.commentId));
  }

  private async ensureProfile(user: AuthenticatedUser) {
    await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@newsflash.local`,
        fullName: user.email?.split('@')[0] ?? 'NewsFlash Reader',
      },
    });
  }

  private getCommentLikeDelegate(client: unknown): CommentLikeDelegate {
    return (client as { commentLike: CommentLikeDelegate }).commentLike;
  }
}