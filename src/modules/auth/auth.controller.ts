import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto, RegisterDto } from './auth.dto';
import { SupabaseAuthService } from './supabase-auth.service';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: SupabaseAuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}