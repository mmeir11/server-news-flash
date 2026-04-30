import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './bookmarks.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  getBookmarks(@CurrentUser() user: AuthenticatedUser) {
    return this.bookmarksService.getBookmarks(user);
  }

  @Post()
  createBookmark(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.createBookmark(user, dto);
  }

  @Delete(':articleId')
  @HttpCode(204)
  deleteBookmark(@CurrentUser() user: AuthenticatedUser, @Param('articleId', ParseUUIDPipe) articleId: string) {
    return this.bookmarksService.deleteBookmark(user, articleId);
  }
}