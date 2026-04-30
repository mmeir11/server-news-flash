import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CompleteUploadDto, SignUploadDto } from './dto';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('sign-upload')
  signUpload(@CurrentUser() user: AuthenticatedUser, @Body() dto: SignUploadDto) {
    return this.mediaService.createSignedUpload(user, dto);
  }

  @Patch(':id/complete')
  completeUpload(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CompleteUploadDto) {
    return this.mediaService.completeUpload(user, id, dto);
  }
}