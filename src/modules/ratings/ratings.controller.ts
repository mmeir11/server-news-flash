import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { RatingsService } from './ratings.service';
import { UpsertRatingDto } from './ratings.dto';

@Controller('articles/:articleId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  upsertRating(
    @Param('articleId', ParseUUIDPipe) articleId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.ratingsService.upsertRating(articleId, user, dto);
  }
}