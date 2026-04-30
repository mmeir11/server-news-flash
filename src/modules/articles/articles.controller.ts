import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, ListAdminArticlesQueryDto, ListArticlesQueryDto } from './articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  listArticles(@Query() query: ListArticlesQueryDto) {
    return this.articlesService.listArticles(query);
  }

  @Public()
  @Get(':id')
  getArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.getArticle(id);
  }

  @Post()
  createArticle(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateArticleDto) {
    return this.articlesService.createArticle(user, dto);
  }
}

@Controller('admin/articles')
@Roles('admin', 'moderator')
export class AdminArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  listArticles(@Query() query: ListAdminArticlesQueryDto) {
    return this.articlesService.listAdminArticles(query);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.deleteAdminArticle(id);
  }
}