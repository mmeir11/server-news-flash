import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { AuthenticatedUser, UserRole } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class SupabaseAuthService {
  private readonly client: SupabaseClient;
  private readonly localTokenSecret: string;
  private readonly tokenTtlSeconds: number;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.client = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
    this.localTokenSecret = config.getOrThrow<string>('AUTH_TOKEN_SECRET');
    this.tokenTtlSeconds = config.getOrThrow<number>('AUTH_TOKEN_TTL_SECONDS');
  }

  async login(dto: LoginDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { authCredential: true, publisherProfile: true },
    });

    if (!profile?.authCredential || !this.verifyPassword(dto.password, profile.authCredential.salt, profile.authCredential.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(profile);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.profile.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = randomBytes(16).toString('base64url');
    const passwordHash = this.hashPassword(dto.password, salt);
    const role = dto.role ?? 'reader';
    const handleBase = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'publisher';

    const profile = await this.prisma.profile.create({
      data: {
        id: randomUUID(),
        email,
        fullName: dto.fullName,
        role,
        authCredential: {
          create: { salt, passwordHash },
        },
        ...(role === 'publisher'
          ? {
              publisherProfile: {
                create: {
                  displayName: dto.fullName,
                  handle: `${handleBase}-${randomBytes(3).toString('hex')}`,
                  credibilityScore: 50,
                },
              },
            }
          : {}),
      },
      include: { publisherProfile: true },
    });

    return this.createAuthResponse(profile);
  }

  async verifyBearerToken(token: string): Promise<AuthenticatedUser> {
    if (token.startsWith('nf_local.')) {
      return this.verifyLocalToken(token);
    }

    const { data, error } = await this.client.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid Supabase token');
    }

    const roles = this.extractRoles(data.user.app_metadata?.roles);

    return {
      id: data.user.id,
      email: data.user.email,
      roles: roles.length > 0 ? roles : ['reader'],
    };
  }

  private extractRoles(value: unknown): UserRole[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const allowedRoles: UserRole[] = ['reader', 'publisher', 'moderator', 'editor', 'admin'];
    return value.filter((role): role is UserRole => allowedRoles.includes(role as UserRole));
  }

  private createAuthResponse(profile: { id: string; email: string; fullName: string | null; role: UserRole; avatarUrl?: string | null; bio?: string | null; publisherProfile?: { credibilityScore: number; followerCount: number; articleCount: number } | null }) {
    const user = {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      avatar: profile.avatarUrl ?? null,
      bio: profile.bio ?? null,
      role: profile.role,
      niches: [],
      credibility_score: profile.publisherProfile?.credibilityScore ?? 50,
      follower_count: profile.publisherProfile?.followerCount ?? 0,
      article_count: profile.publisherProfile?.articleCount ?? 0,
    };

    return {
      access_token: this.signLocalToken({ id: profile.id, email: profile.email, roles: [profile.role] }),
      token_type: 'Bearer',
      expires_in: this.tokenTtlSeconds,
      user,
    };
  }

  private hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString('base64url');
  }

  private verifyPassword(password: string, salt: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hashPassword(password, salt), 'base64url');
    const expected = Buffer.from(expectedHash, 'base64url');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private signLocalToken(payload: AuthenticatedUser): string {
    const expiresAt = Math.floor(Date.now() / 1000) + this.tokenTtlSeconds;
    const body = this.encode({ ...payload, exp: expiresAt });
    const signature = this.sign(body);
    return `nf_local.${body}.${signature}`;
  }

  private verifyLocalToken(token: string): AuthenticatedUser {
    const [, body, signature] = token.split('.');

    if (!body || !signature || this.sign(body) !== signature) {
      throw new UnauthorizedException('Invalid local auth token');
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AuthenticatedUser & { exp: number };

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Expired local auth token');
    }

    return { id: payload.id, email: payload.email, roles: payload.roles };
  }

  private encode(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private sign(body: string): string {
    return createHmac('sha256', this.localTokenSecret).update(body).digest('base64url');
  }
}