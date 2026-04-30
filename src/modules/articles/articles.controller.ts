import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, ListArticlesQueryDto } from './articles.dto';

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
  getArticle(@Param('id') id: string) {
    return this.articlesService.getArticle(id);
  }

  @Post()
  createArticle(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateArticleDto) {
    return this.articlesService.createArticle(user, dto);
  }
}