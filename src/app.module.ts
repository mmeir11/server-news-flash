import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/env.validation';
import { AnalyticsEventsModule } from './modules/analytics-events/analytics-events.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CredibilityModule } from './modules/credibility/credibility.module';
import { DatabaseModule } from './modules/database/database.module';
import { FeedModule } from './modules/feed/feed.module';
import { FollowsModule } from './modules/follows/follows.module';
import { HashtagsModule } from './modules/hashtags/hashtags.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PublishersModule } from './modules/publishers/publishers.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchModule } from './modules/search/search.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PublishersModule,
    ArticlesModule,
    FeedModule,
    MediaModule,
    RatingsModule,
    CredibilityModule,
    CommentsModule,
    FollowsModule,
    BookmarksModule,
    NotificationsModule,
    ReportsModule,
    ModerationModule,
    SearchModule,
    HashtagsModule,
    AnalyticsEventsModule,
  ],
})
export class AppModule {}