import { IsIn } from 'class-validator';

export class UpsertRatingDto {
  @IsIn(['reliable', 'not_reliable', 'important'])
  type!: 'reliable' | 'not_reliable' | 'important';
}