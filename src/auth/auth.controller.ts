import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IssueInviteCodeDto } from './dto/issue-invite-code.dto';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { CreateUserResponseDto } from './dto/create-user-response.dto';
import type { InviteCodeResponseDto } from './dto/invite-code-response.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('invite-codes')
  issueInviteCode(@Body() dto: IssueInviteCodeDto): InviteCodeResponseDto {
    return this.authService.issueInviteCode(dto);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto): CreateUserResponseDto {
    return this.authService.createUser(dto);
  }

  @Post('login')
  login(@Body() dto: LoginWithCodeDto): AuthResponseDto {
    return this.authService.loginWithCode(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() authenticatedUser: AuthenticatedUser): {
    id: string;
    displayName: string;
  } {
    return this.authService.getProfile(authenticatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() authenticatedUser: AuthenticatedUser): {
    success: true;
  } {
    this.authService.logout(authenticatedUser);
    return { success: true };
  }
}
