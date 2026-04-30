import { Prisma, RatingType } from '@prisma/client';

export type ArticleForCard = Prisma.ArticleGetPayload<{
  include: {
    publisher: { include: { user: true } };
    media: true;
  };
}>;

export type PublisherForCard = Prisma.PublisherProfileGetPayload<{
  include: {
    user: true;
    articles: { select: { nicheId: true } };
  };
}>;

export type CommentForClient = Prisma.CommentGetPayload<{
  include: { author: true };
}>;

export type NotificationForClient = Prisma.NotificationGetPayload<{}>;

export function presentArticle(article: ArticleForCard, myRating?: RatingType | null, isBookmarked = false) {
  const video = article.media.find((item) => item.type === 'article_video_original' && item.publicUrl);

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    content: article.content,
    video_url: video?.publicUrl ?? null,
    thumbnail_url: article.thumbnailUrl,
    niche: article.nicheId,
    publisher_id: article.publisherId,
    publisher_name: article.publisher.displayName,
    publisher_avatar: article.publisher.avatarUrl ?? article.publisher.user.avatarUrl,
    reliable_count: article.reliableCount,
    not_reliable_count: article.notReliableCount,
    important_count: article.importantCount,
    comment_count: article.commentCount,
    share_count: article.shareCount,
    view_count: article.viewCount,
    has_video: article.hasVideo,
    my_rating: myRating ?? null,
    is_bookmarked: isBookmarked,
    created_date: (article.publishedAt ?? article.createdAt).toISOString(),
  };
}

export function presentPublisher(publisher: PublisherForCard) {
  const niches = [...new Set(publisher.articles.map((article) => article.nicheId))];

  return {
    id: publisher.userId,
    full_name: publisher.displayName,
    email: publisher.user.email,
    avatar: publisher.avatarUrl ?? publisher.user.avatarUrl,
    bio: publisher.bio ?? publisher.user.bio,
    niches,
    credibility_score: Math.round(publisher.credibilityScore),
    follower_count: publisher.followerCount,
    article_count: publisher.articleCount,
  };
}

export function presentComment(comment: CommentForClient, currentUserId?: string, myLike = false) {
  return {
    id: comment.id,
    article_id: comment.articleId,
    author_id: comment.authorId,
    author_name: comment.author.fullName ?? comment.author.email,
    author_avatar: comment.author.avatarUrl,
    content: comment.content,
    likes: comment.likeCount,
    my_like: myLike,
    is_mine: currentUserId ? comment.authorId === currentUserId : false,
    created_date: comment.createdAt.toISOString(),
    updated_date: comment.updatedAt.toISOString(),
  };
}

export function presentNotification(notification: NotificationForClient) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    article_id: notification.articleId,
    publisher_id: notification.actorId,
    read: notification.isRead,
    created_date: notification.createdAt.toISOString(),
  };
}