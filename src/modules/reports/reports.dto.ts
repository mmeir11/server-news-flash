import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsIn(['article', 'comment', 'publisher'])
  targetType!: 'article' | 'comment' | 'publisher';

  @IsUUID()
  targetId!: string;

  @IsString()
  @MaxLength(100)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}