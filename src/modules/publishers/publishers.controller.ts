import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublishersService } from './publishers.service';

@Public()
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  listPublishers() {
    return this.publishersService.listPublishers();
  }

  @Get(':id')
  getPublisher(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.getPublisher(id);
  }

  @Get(':id/articles')
  getPublisherArticles(@Param('id', ParseUUIDPipe) id: string, @Query('has_video') hasVideo?: string) {
    return this.publishersService.getPublisherArticles(
      id,
      hasVideo === undefined ? undefined : hasVideo === 'true',
    );
  }
}