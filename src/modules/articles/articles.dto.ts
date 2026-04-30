import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListArticlesQueryDto {
  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  publisherId?: string;

  @IsOptional()
  @IsString()
  publisher_id?: string;

  @IsOptional()
  @IsIn(['recent', 'popular', 'reliable', 'important'])
  sort?: 'recent' | 'popular' | 'reliable' | 'important';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasVideo?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  has_video?: boolean;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;
}

export class CreateArticleDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  niche!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media_ids?: string[];

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';
}