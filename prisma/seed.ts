import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

type SeedArticle = (typeof articles)[number];

const niches = [
  { id: 'ai', label: 'AI & Tech', description: 'Artificial intelligence, automation, and emerging technology.' },
  { id: 'sports', label: 'Sports', description: 'Games, leagues, athletes, and sports business.' },
  { id: 'politics', label: 'Politics', description: 'Policy, elections, government, and civic institutions.' },
  { id: 'tech', label: 'Technology', description: 'Consumer technology, software, hardware, and platforms.' },
  { id: 'science', label: 'Science', description: 'Research, space, climate, medicine, and discovery.' },
  { id: 'business', label: 'Business', description: 'Markets, companies, labor, finance, and economy.' },
  { id: 'entertainment', label: 'Entertainment', description: 'Film, music, creators, and culture.' },
  { id: 'health', label: 'Health', description: 'Public health, wellness, medicine, and care systems.' },
  { id: 'world', label: 'World', description: 'Global news, diplomacy, conflict, and international affairs.' },
];

const profiles = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'sarah@newsflash.local',
    fullName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'AI researcher turned tech journalist. Covering the intersection of artificial intelligence and society.',
    role: 'publisher' as const,
    publisher: { displayName: 'Sarah Chen', handle: 'sarah-chen', credibilityScore: 92, followerCount: 15400, articleCount: 2 },
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'marcus@newsflash.local',
    fullName: 'Marcus Johnson',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Sports analyst with 15 years covering professional leagues. Former ESPN contributor.',
    role: 'publisher' as const,
    publisher: { displayName: 'Marcus Johnson', handle: 'marcus-johnson', credibilityScore: 87, followerCount: 23100, articleCount: 1 },
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'elena@newsflash.local',
    fullName: 'Elena Rodriguez',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Political correspondent. Providing balanced analysis of global politics and policy.',
    role: 'publisher' as const,
    publisher: { displayName: 'Elena Rodriguez', handle: 'elena-rodriguez', credibilityScore: 95, followerCount: 41200, articleCount: 1 },
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    email: 'david@newsflash.local',
    fullName: 'David Kim',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Business & economics reporter. Making complex financial news accessible to everyone.',
    role: 'publisher' as const,
    publisher: { displayName: 'David Kim', handle: 'david-kim', credibilityScore: 88, followerCount: 12800, articleCount: 2 },
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    email: 'reader@newsflash.local',
    fullName: 'Alex Turner',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    role: 'reader' as const,
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    email: 'priya@newsflash.local',
    fullName: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
    role: 'reader' as const,
  },
];

const articles = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    publisherId: profiles[0].id,
    nicheId: 'ai',
    title: 'GPT-5 Achieves Human-Level Reasoning in New Benchmark Tests',
    summary: "OpenAI's latest model shows unprecedented performance across multiple cognitive benchmarks, raising both excitement and ethical concerns in the AI community.",
    content: '<p>OpenAI has revealed that its latest model achieved human-level reasoning capabilities across several standardized benchmark tests.</p><p>The model demonstrated proficiency in abstract reasoning, causal inference, and multi-step problem solving.</p><p>Researchers say the results point to meaningful progress, while AI safety experts warn that deployment needs strong governance.</p>',
    videoUrl: 'https://static.videezy.com/system/resources/previews/000/055/866/original/Weather-news-intro.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    reliableCount: 1243,
    notReliableCount: 56,
    importantCount: 892,
    commentCount: 2,
    shareCount: 2100,
    viewCount: 45600,
    hasVideo: true,
    publishedAt: new Date('2026-04-29T10:30:00Z'),
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    publisherId: profiles[1].id,
    nicheId: 'sports',
    title: 'Champions League Final: Barcelona Stuns Manchester City with Last-Minute Goal',
    summary: "A dramatic stoppage-time winner seals Barcelona's 3-2 victory in one of the greatest finals ever played.",
    content: '<p>Barcelona completed a stunning comeback to defeat Manchester City 3-2 at the Stade de France.</p><p>The winning goal arrived in stoppage time after a match full of momentum swings.</p>',
    videoUrl: 'https://static.videezy.com/system/resources/previews/000/055/934/original/Corona-news-intro-4K.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    reliableCount: 3421,
    notReliableCount: 12,
    importantCount: 567,
    commentCount: 1,
    shareCount: 8900,
    viewCount: 128000,
    hasVideo: true,
    publishedAt: new Date('2026-04-28T22:15:00Z'),
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    publisherId: profiles[2].id,
    nicheId: 'politics',
    title: 'Global Climate Summit Reaches Historic Carbon Tax Agreement',
    summary: '196 nations agree on a unified carbon pricing framework, marking the most significant climate policy achievement since the Paris Agreement.',
    content: '<p>Representatives from 196 nations reached an agreement on a unified carbon tax framework during the Global Climate Summit in Geneva.</p><p>The framework establishes a minimum global carbon price and support for developing nations.</p>',
    // videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    video_url: "https://samplelib.com/mp4/sample-5s.mp4",
    thumbnailUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop',
    reliableCount: 5621,
    notReliableCount: 234,
    importantCount: 4312,
    commentCount: 1,
    shareCount: 12400,
    viewCount: 234000,
    hasVideo: true,
    publishedAt: new Date('2026-04-28T18:00:00Z'),
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    publisherId: profiles[3].id,
    nicheId: 'tech',
    title: 'Apple Unveils Neural Interface Headset at WWDC 2026',
    summary: "Apple's latest product uses non-invasive neural signals to control interfaces, promising to reshape human-computer interaction.",
    content: '<p>Apple introduced a headset that reads non-invasive neural signals to enable direct interface control.</p><p>Early demos showed users navigating menus and typing messages using neural intent patterns.</p>',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&h=600&fit=crop',
    reliableCount: 2341,
    notReliableCount: 187,
    importantCount: 1567,
    commentCount: 0,
    shareCount: 5600,
    viewCount: 89000,
    hasVideo: false,
    publishedAt: new Date('2026-04-27T14:00:00Z'),
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    publisherId: profiles[0].id,
    nicheId: 'science',
    title: 'CRISPR Gene Therapy Cures Sickle Cell Disease in Landmark Trial',
    summary: 'All 45 patients in Phase 3 trial show complete remission after receiving one-time CRISPR-based gene therapy treatment.',
    content: '<p>A Phase 3 clinical trial demonstrated that CRISPR-based gene therapy can effectively cure sickle cell disease.</p><p>All participants showed remission after a one-time treatment.</p>',
    videoUrl: 'https://static.videezy.com/system/resources/previews/000/002/820/original/flyoverny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop',
    reliableCount: 4532,
    notReliableCount: 23,
    importantCount: 3890,
    commentCount: 0,
    shareCount: 9800,
    viewCount: 156000,
    hasVideo: true,
    publishedAt: new Date('2026-04-27T09:00:00Z'),
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6',
    publisherId: profiles[3].id,
    nicheId: 'business',
    title: 'Global Markets Rally as Fed Signals Rate Cuts Ahead',
    summary: 'Wall Street surges to new highs after the Federal Reserve signals a rate-cutting cycle beginning in May.',
    content: '<p>Global financial markets surged after the Federal Reserve signaled it may begin cutting rates.</p><p>Analysts expect a broad rally across equities and lower bond yields if inflation keeps cooling.</p>',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    reliableCount: 1876,
    notReliableCount: 145,
    importantCount: 2345,
    commentCount: 0,
    shareCount: 3200,
    viewCount: 67000,
    hasVideo: false,
    publishedAt: new Date('2026-04-26T16:30:00Z'),
  },
];

const comments = [
  { id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1', articleId: articles[0].id, authorId: profiles[4].id, content: 'This is genuinely exciting but also terrifying. We need robust AI governance frameworks before deploying systems this capable.', likeCount: 234, createdAt: new Date('2026-04-29T11:00:00Z') },
  { id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2', articleId: articles[0].id, authorId: profiles[5].id, content: 'Great reporting Sarah. Can you do a follow-up on the specific benchmark methodologies used?', likeCount: 89, createdAt: new Date('2026-04-29T11:30:00Z') },
  { id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3', articleId: articles[1].id, authorId: profiles[4].id, content: 'That final goal will be replayed for decades.', likeCount: 567, createdAt: new Date('2026-04-28T23:00:00Z') },
  { id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4', articleId: articles[2].id, authorId: profiles[5].id, content: '$75/ton is a good start, but enforcement will matter more than the headline agreement.', likeCount: 342, createdAt: new Date('2026-04-28T19:00:00Z') },
];

function getArticleVideoUrl(article: SeedArticle) {
  return 'videoUrl' in article ? article.videoUrl : article.video_url;
}

export async function seedDatabase() {
  for (const niche of niches) {
    await prisma.niche.upsert({ where: { id: niche.id }, update: niche, create: niche });
  }

  for (const profile of profiles) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: {
        email: profile.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        role: profile.role,
      },
      create: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        role: profile.role,
      },
    });

    if (profile.publisher) {
      await prisma.publisherProfile.upsert({
        where: { userId: profile.id },
        update: profile.publisher,
        create: { userId: profile.id, ...profile.publisher },
      });
    }
  }

  for (const article of articles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        thumbnailUrl: article.thumbnailUrl,
        reliableCount: article.reliableCount,
        notReliableCount: article.notReliableCount,
        importantCount: article.importantCount,
        commentCount: article.commentCount,
        shareCount: article.shareCount,
        viewCount: article.viewCount,
        hasVideo: article.hasVideo,
        publishedAt: article.publishedAt,
        status: 'published',
      },
      create: {
        id: article.id,
        publisherId: article.publisherId,
        nicheId: article.nicheId,
        title: article.title,
        summary: article.summary,
        content: article.content,
        thumbnailUrl: article.thumbnailUrl,
        reliableCount: article.reliableCount,
        notReliableCount: article.notReliableCount,
        importantCount: article.importantCount,
        commentCount: article.commentCount,
        shareCount: article.shareCount,
        viewCount: article.viewCount,
        hasVideo: article.hasVideo,
        publishedAt: article.publishedAt,
        status: 'published',
      },
    });

    const videoUrl = getArticleVideoUrl(article);

    if (videoUrl) {
      const mediaId = article.id.replace('aaaaaaaa', 'bbbbbbbb');
      await prisma.articleMedia.upsert({
        where: { id: mediaId },
        update: { publicUrl: videoUrl, status: 'ready' },
        create: {
          id: mediaId,
          articleId: article.id,
          ownerId: article.publisherId,
          type: 'article_video_original',
          status: 'ready',
          storageKey: `seed/videos/${article.id}.mp4`,
          publicUrl: videoUrl,
          contentType: 'video/mp4',
          completedAt: article.publishedAt,
        },
      });
    }
  }

  for (const comment of comments) {
    await prisma.comment.upsert({ where: { id: comment.id }, update: comment, create: comment });
  }

  await prisma.notification.upsert({
    where: { id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1' },
    update: {},
    create: {
      id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
      userId: profiles[4].id,
      actorId: profiles[0].id,
      articleId: articles[0].id,
      type: 'new_article',
      title: 'New from Sarah Chen',
      message: articles[0].title,
      isRead: false,
      createdAt: articles[0].publishedAt,
    },
  });
  await prisma.bookmark.upsert({
    where: { userId_articleId: { userId: profiles[4].id, articleId: articles[0].id } },
    update: {},
    create: { userId: profiles[4].id, articleId: articles[0].id },
  });

  console.log(`Seeded ${niches.length} niches, ${profiles.length} profiles, ${articles.length} articles.`);
}

if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}