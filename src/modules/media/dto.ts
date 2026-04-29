import { IsEnum, IsInt, IsMimeType, IsOptional, IsString, Max, Min } from 'class-validator';

export enum MediaPurpose {
  Avatar = 'avatar',
  ArticleThumbnail = 'article_thumbnail',
  ArticleVideo = 'article_video',
}

export class SignUploadDto {
  @IsEnum(MediaPurpose)
  purpose!: MediaPurpose;

  @IsString()
  fileName!: string;

  @IsMimeType()
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(1_500_000_000)
  fileSize!: number;
}

export class CompleteUploadDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  fileSize?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}