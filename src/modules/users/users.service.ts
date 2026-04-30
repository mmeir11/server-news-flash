import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCurrentUser(user: AuthenticatedUser) {
    const profile = await this.prisma.profile.upsert({
      where: { id: user.id },
      update: { email: user.email ?? `${user.id}@newsflash.local` },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@newsflash.local`,
        fullName: user.email?.split('@')[0] ?? 'NewsFlash User',
        role: user.roles.includes('publisher') ? 'publisher' : 'reader',
      },
      include: { publisherProfile: true },
    });

    return {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      avatar: profile.avatarUrl,
      bio: profile.bio,
      role: profile.role,
      niches: [],
      credibility_score: profile.publisherProfile?.credibilityScore ?? 50,
      follower_count: profile.publisherProfile?.followerCount ?? 0,
      article_count: profile.publisherProfile?.articleCount ?? 0,
    };
  }
}