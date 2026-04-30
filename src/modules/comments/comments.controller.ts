import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './comments.dto';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  getArticleComments(@Param('articleId') articleId: string) {
    return this.commentsService.getArticleComments(articleId);
  }

  @Post()
  createComment(
    @Param('articleId') articleId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(articleId, user, dto);
  }
}