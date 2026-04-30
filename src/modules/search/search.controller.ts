import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { SearchService } from './search.service';

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('q') query = '',
    @Query('type') type = 'all',
    @Query('niche') niche?: string,
  ) {
    return this.searchService.search(query, type, niche, user);
  }
}