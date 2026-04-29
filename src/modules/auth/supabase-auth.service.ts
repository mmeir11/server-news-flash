import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthenticatedUser, UserRole } from '../../common/types/authenticated-user';

@Injectable()
export class SupabaseAuthService {
  private readonly client: SupabaseClient;

  constructor(config: ConfigService) {
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
  }

  async verifyBearerToken(token: string): Promise<AuthenticatedUser> {
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
}