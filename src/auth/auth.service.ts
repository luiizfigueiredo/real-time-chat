import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../db/db.provider';
import * as schema from '../db/schema';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { InviteCodeResponseDto } from './dto/invite-code-response.dto';
import { IssueInviteCodeDto } from './dto/issue-invite-code.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { BaseError } from '../shared/error/base-error';
import { authError } from '../shared/error/messages/auth.error';
import { signupDto } from './dto/signupDto.dto';
import { signinDto } from './dto/signinDto.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  DEFAULT_INVITE_TTL_SECONDS,
  DEFAULT_JWT_EXPIRES_IN_SECONDS,
  DEFAULT_REFRESH_EXPIRES_IN_SECONDS,
  readPositiveIntEnv,
} from './auth.constants';

interface InviteCodeRecord {
  expiresAt: number;
  consumedAt?: number;
}

@Injectable()
export class AuthService {
  private readonly jwtTtlSeconds = readPositiveIntEnv(
    'JWT_EXPIRES_IN_SECONDS',
    DEFAULT_JWT_EXPIRES_IN_SECONDS,
  );
  private readonly defaultInviteTtlSeconds = readPositiveIntEnv(
    'AUTH_INVITE_TTL_SECONDS',
    DEFAULT_INVITE_TTL_SECONDS,
  );
  private readonly refreshTtlSeconds = readPositiveIntEnv(
    'REFRESH_EXPIRES_IN_SECONDS',
    DEFAULT_REFRESH_EXPIRES_IN_SECONDS,
  );
  private readonly inviteCodes = new Map<string, InviteCodeRecord>();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {
    this.seedInviteCodes();
  }

  issueInviteCode(dto: IssueInviteCodeDto = {}): InviteCodeResponseDto {
    const ttlSeconds = dto.ttlSeconds ?? this.defaultInviteTtlSeconds;
    const code = this.normalizeCode(dto.code ?? this.generateInviteCode());

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.inviteCodes.set(code, { expiresAt });

    return {
      code,
      expiresAt: new Date(expiresAt).toISOString(),
      ttlSeconds,
    };
  }

  async createUser(dto: signupDto): Promise<CreateUserResponseDto> {
    const { username, email, password } = dto;

    const [emailTaken] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (emailTaken) {
      throw new BaseError(authError.AUTH_002);
    }

    const [existingUsername] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (existingUsername) {
      throw new BaseError(authError.AUTH_005);
    }

    const hashedPassword = await hash(password, 12);

    const inviteCode = `USER-${randomBytes(4).toString('hex').toUpperCase()}`;
    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        id: randomUUID(),
        email,
        username,
        passwordHash: hashedPassword,
        inviteCode,
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      inviteCode: newUser.inviteCode,
      createdAt: newUser.createdAt.toISOString(),
    };
  }

  async login(
    dto: signinDto,
  ): Promise<AuthResponseDto & { refreshToken: string }> {
    const { username } = dto;
    const sessionId = randomUUID();
    const [user] = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        passwordHash: schema.users.passwordHash,
      })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user) {
      throw new BaseError(authError.AUTH_001);
    }

    const validPassword = await compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new BaseError(authError.AUTH_001);
    }

    const refreshToken = this.generateRefreshToken(sessionId);
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshExpiresAt = new Date(
      Date.now() + this.refreshTtlSeconds * 1000,
    );

    await this.db.insert(schema.refreshTokens).values({
      id: sessionId,
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshExpiresAt,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      sessionId,
      username: user.username,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtTtlSeconds,
      user: {
        id: user.id,
        username: user.username,
      },
      refreshToken,
    };
  }

  async getProfile(authenticatedUser: AuthenticatedUser): Promise<{
    id: string;
    username: string;
  }> {
    const [user] = await this.db
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.id, authenticatedUser.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found for token');
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  async refreshSession(
    rawRefreshToken: string,
  ): Promise<AuthResponseDto & { refreshToken: string }> {
    const sessionId = this.extractSessionId(rawRefreshToken);
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    const [session] = await this.db
      .select({
        id: schema.refreshTokens.id,
        userId: schema.refreshTokens.userId,
        expiresAt: schema.refreshTokens.expiresAt,
        tokenHash: schema.refreshTokens.tokenHash,
      })
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, sessionId))
      .limit(1);

    if (!session) {
      throw new UnauthorizedException('Refresh session not found');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.db
        .delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.id, session.id));
      throw new UnauthorizedException('Refresh token expired');
    }

    if (session.tokenHash !== refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const [user] = await this.db
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found for session');
    }

    const nextRefreshToken = this.generateRefreshToken(session.id);
    const nextRefreshTokenHash = this.hashToken(nextRefreshToken);
    const nextExpiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);

    await this.db
      .update(schema.refreshTokens)
      .set({ tokenHash: nextRefreshTokenHash, expiresAt: nextExpiresAt })
      .where(eq(schema.refreshTokens.id, session.id));

    const accessToken = this.jwtService.sign({
      sub: user.id,
      sessionId: session.id,
      username: user.username,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtTtlSeconds,
      user: {
        id: user.id,
        username: user.username,
      },
      refreshToken: nextRefreshToken,
    };
  }

  // async changePassword(userId: string, newPassword: string) {
  //   try {
  //     const user = await this.userRepository.findById(userId);

  //     if (!user) {
  //       throw new BaseError(authError.AUTH_004);
  //     }

  //     const hashedNewPassword = await hash(newPassword, 12);

  //     await this.userRepository.updatePassword(userId, hashedNewPassword);

  //     return {
  //       success: true,
  //       message: 'Password changed successfully.',
  //     };
  //   } catch (error) {
  //     console.error('Error changing password:', error);
  //     throw error;
  //   }
  // }

  async logout(authenticatedUser: AuthenticatedUser): Promise<void> {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, authenticatedUser.sessionId));
  }

  async isSessionActive(userId: string, sessionId: string): Promise<boolean> {
    const [session] = await this.db
      .select({
        userId: schema.refreshTokens.userId,
        expiresAt: schema.refreshTokens.expiresAt,
      })
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, sessionId))
      .limit(1);

    if (!session) {
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.db
        .delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.id, sessionId));
      return false;
    }

    return true;
  }

  private validateInviteCode(code: string): void {
    const inviteCode = this.inviteCodes.get(code);
    if (!inviteCode) {
      throw new UnauthorizedException('Invalid invitation code');
    }

    if (inviteCode.expiresAt <= Date.now()) {
      this.inviteCodes.delete(code);
      throw new UnauthorizedException('Invitation code is expired');
    }

    if (inviteCode.consumedAt) {
      throw new UnauthorizedException('Invitation code already used');
    }

    inviteCode.consumedAt = Date.now();
    this.inviteCodes.set(code, inviteCode);
  }

  private seedInviteCodes(): void {
    const envCodes = process.env.AUTH_BOOTSTRAP_CODES?.split(',')
      .map((value) => this.normalizeCode(value))
      .filter((value) => value.length > 0);

    const seedCodes = envCodes?.length ? envCodes : ['CHAT-DEMO-2026'];

    for (const code of seedCodes) {
      this.issueInviteCode({ code, ttlSeconds: 7 * 24 * 60 * 60 });
    }
  }

  private generateInviteCode(): string {
    return `INV-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private generateRefreshToken(sessionId: string): string {
    return `${sessionId}.${randomBytes(48).toString('hex')}`;
  }

  private extractSessionId(refreshToken: string): string {
    const [sessionId] = refreshToken.split('.');

    if (!sessionId) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    return sessionId;
  }

  private hashToken(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
