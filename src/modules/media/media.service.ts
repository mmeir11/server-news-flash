import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaStatus, MediaType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { MediaPurpose, SignUploadDto } from './dto';

@Injectable()
export class MediaService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly uploadTtlSeconds: number;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accountId = config.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = config.getOrThrow<string>('R2_BUCKET');
    this.publicBaseUrl = config.getOrThrow<string>('R2_PUBLIC_BASE_URL').replace(/\/$/, '');
    this.uploadTtlSeconds = config.getOrThrow<number>('R2_UPLOAD_URL_TTL_SECONDS');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async createSignedUpload(user: AuthenticatedUser, dto: SignUploadDto) {
    const mediaId = randomUUID();
    const storageKey = this.buildStorageKey(user.id, mediaId, dto);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.uploadTtlSeconds,
    });
    const publicUrl = `${this.publicBaseUrl}/${storageKey}`;

    await this.prisma.articleMedia.create({
      data: {
        id: mediaId,
        ownerId: user.id,
        type: this.getMediaType(dto.purpose),
        status: MediaStatus.pending_upload,
        storageKey,
        publicUrl,
        contentType: dto.contentType,
        fileSize: dto.fileSize,
      },
    });

    return {
      mediaId,
      media_id: mediaId,
      uploadUrl,
      upload_url: uploadUrl,
      method: 'PUT',
      headers: {
        'content-type': dto.contentType,
      },
      storageKey,
      storage_key: storageKey,
      publicUrl,
      public_url: publicUrl,
    };
  }

  async completeUpload(
    user: AuthenticatedUser,
    id: string,
    dto: { fileSize?: number; durationSeconds?: number; width?: number; height?: number },
  ) {
    await this.prisma.articleMedia.updateMany({
      where: { id, ownerId: user.id },
      data: {
        status: MediaStatus.ready,
        fileSize: dto.fileSize,
        durationSeconds: dto.durationSeconds,
        width: dto.width,
        height: dto.height,
        completedAt: new Date(),
      },
    });
    return this.prisma.articleMedia.findUniqueOrThrow({ where: { id } });
  }

  private buildStorageKey(userId: string, mediaId: string, dto: SignUploadDto): string {
    const extension = this.getSafeExtension(dto.fileName);
    const prefixByPurpose: Record<MediaPurpose, string> = {
      [MediaPurpose.Avatar]: 'users/avatars',
      [MediaPurpose.ArticleThumbnail]: 'articles/thumbnails',
      [MediaPurpose.ArticleVideo]: 'articles/videos/originals',
    };

    return `${prefixByPurpose[dto.purpose]}/${userId}/${mediaId}${extension}`;
  }

  private getSafeExtension(fileName: string): string {
    const match = fileName.toLowerCase().match(/\.[a-z0-9]{1,8}$/);
    return match?.[0] ?? '';
  }

  private getMediaType(purpose: MediaPurpose): MediaType {
    const typeByPurpose: Record<MediaPurpose, MediaType> = {
      [MediaPurpose.Avatar]: MediaType.avatar,
      [MediaPurpose.ArticleThumbnail]: MediaType.article_thumbnail,
      [MediaPurpose.ArticleVideo]: MediaType.article_video_original,
    };

    return typeByPurpose[purpose];
  }
}