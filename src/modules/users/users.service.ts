import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { InviteUserDto, ListUsersQueryDto } from './users.dto';

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

  async listAdminUsers(query: ListUsersQueryDto) {
    const profiles = await this.prisma.profile.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
    });

    return profiles.map((profile) => this.presentAdminUser(profile));
  }

  async updateAdminUserRole(id: string, role: UserRole) {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: { role },
    }).catch(() => null);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    if (role === 'publisher') {
      await this.prisma.publisherProfile.upsert({
        where: { userId: id },
        update: {},
        create: {
          userId: id,
          displayName: profile.fullName ?? profile.email.split('@')[0],
          handle: `publisher-${id.slice(0, 8)}`,
          credibilityScore: 50,
        },
      });
    }

    return this.presentAdminUser(profile);
  }

  async inviteAdminUser(dto: InviteUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.profile.findUnique({ where: { email } });

    if (existing) {
      return this.presentAdminUser(existing);
    }

    const profile = await this.prisma.profile.create({
      data: {
        id: randomUUID(),
        email,
        fullName: email.split('@')[0],
        role: dto.role,
      },
    });

    return this.presentAdminUser(profile);
  }

  private presentAdminUser(profile: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: UserRole;
    status: string;
    createdAt: Date;
  }) {
    return {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      avatar: profile.avatarUrl,
      role: profile.role,
      status: profile.status,
      created_date: profile.createdAt.toISOString(),
    };
  }
}