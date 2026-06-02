import {
  Body,
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Post,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signupDto.dto';
import { IssueInviteCodeDto } from './dto/issue-invite-code.dto';
import { signinDto } from './dto/signinDto.dto';
import type { CreateUserResponseDto } from './dto/create-user-response.dto';
import type { InviteCodeResponseDto } from './dto/invite-code-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  DEFAULT_REFRESH_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  getCookieOptions,
  readPositiveIntEnv,
} from './auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  private readonly refreshTtlSeconds = readPositiveIntEnv(
    'REFRESH_EXPIRES_IN_SECONDS',
    DEFAULT_REFRESH_EXPIRES_IN_SECONDS,
  );

  constructor(private readonly authService: AuthService) {}

  @Post('invite-codes')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async issueInviteCode(
    @Body() dto: IssueInviteCodeDto,
  ): Promise<InviteCodeResponseDto> {
    return this.authService.issueInviteCode(dto);
  }

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  signup(@Body() dto: signupDto): Promise<CreateUserResponseDto> {
    return this.authService.createUser(dto);
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async signin(
    @Body() dto: signinDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const { refreshToken, ...authResponse } = await this.authService.login(dto);
    this.setRefreshCookie(response, refreshToken);
    return authResponse;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.readRefreshToken(request);
    const { refreshToken: nextRefreshToken, ...authResponse } =
      await this.authService.refreshSession(refreshToken);

    this.setRefreshCookie(response, nextRefreshToken);
    return authResponse;
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('me')
  me(@CurrentUser() authenticatedUser: AuthenticatedUser): Promise<{
    id: string;
    username: string;
  }> {
    return this.authService.getProfile(authenticatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Post('logout')
  async logout(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    await this.authService.logout(authenticatedUser);
    this.clearRefreshCookie(response);
    return { success: true };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...getCookieOptions(),
      maxAge: this.refreshTtlSeconds * 1000,
      path: '/auth',
    });
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      ...getCookieOptions(),
      path: '/auth',
    });
  }

  private readRefreshToken(request: Request): string {
    const refreshToken = (
      request.cookies as Record<string, string> | undefined
    )?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie is missing');
    }
    return refreshToken;
  }
}
