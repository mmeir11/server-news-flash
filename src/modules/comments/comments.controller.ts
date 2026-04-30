import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  getArticleComments(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.commentsService.getArticleComments(articleId, user);
  }

  @Post()
  createComment(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(articleId, user, dto);
  }

  @Post(':commentId/likes')
  toggleCommentLike(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.toggleCommentLike(articleId, commentId, user);
  }

  @Patch(':commentId')
  updateComment(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(articleId, commentId, user, dto);
  }

  @Delete(':commentId')
  @HttpCode(204)
  deleteComment(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.deleteComment(articleId, commentId, user);
  }
}