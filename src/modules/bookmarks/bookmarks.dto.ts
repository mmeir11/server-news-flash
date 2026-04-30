import { IsUUID } from 'class-validator';

export class CreateBookmarkDto {
  @IsUUID()
  article_id!: string;
}