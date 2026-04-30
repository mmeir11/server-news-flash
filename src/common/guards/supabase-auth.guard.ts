import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../types/authenticated-user';
import { SupabaseAuthService } from '../../modules/auth/supabase-auth.service';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: SupabaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (isPublic) {
      const optionalToken = this.extractOptionalBearerToken(request);

      if (optionalToken) {
        try {
          request.user = await this.authService.verifyBearerToken(optionalToken);
        } catch {
          request.user = undefined;
        }
      }

      return true;
    }

    const token = this.extractBearerToken(request);
    request.user = await this.authService.verifyBearerToken(token);
    return true;
  }

  private extractOptionalBearerToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    return authorization.slice('Bearer '.length);
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    return authorization.slice('Bearer '.length);
  }
}