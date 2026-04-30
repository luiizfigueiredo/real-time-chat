import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID, scryptSync } from 'crypto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteCodeResponseDto } from './dto/invite-code-response.dto';
import { IssueInviteCodeDto } from './dto/issue-invite-code.dto';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import {
  DEFAULT_INVITE_TTL_SECONDS,
  DEFAULT_JWT_EXPIRES_IN_SECONDS,
  readPositiveIntEnv,
} from './auth.constants';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

interface InviteCodeRecord {
  expiresAt: number;
  consumedAt?: number;
}

interface SessionRecord {
  userId: string;
  expiresAt: number;
}

interface UserRecord {
  id: string;
  displayName: string;
  email?: string;
  passwordHash?: string;
  username?: string;
  inviteCode?: string;
  createdAt: number;
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
  private readonly inviteCodes = new Map<string, InviteCodeRecord>();
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly users = new Map<string, UserRecord>();
  private readonly userIdByEmail = new Map<string, string>();
  private readonly userIdByUsername = new Map<string, string>();
  private readonly userIdByInviteCode = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {
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

  createUser(dto: CreateUserDto): CreateUserResponseDto {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    if (this.userIdByEmail.has(email)) {
      throw new ConflictException('Email is already in use');
    }

    if (this.userIdByUsername.has(username)) {
      throw new ConflictException('Username is already in use');
    }

    const userId = randomUUID();
    const inviteCode = this.generateUserInviteCode();
    const createdAt = Date.now();
    const user: UserRecord = {
      id: userId,
      displayName: username,
      email,
      passwordHash: this.hashPassword(dto.password),
      username,
      inviteCode,
      createdAt,
    };

    this.users.set(user.id, user);
    this.userIdByEmail.set(email, user.id);
    this.userIdByUsername.set(username, user.id);
    this.userIdByInviteCode.set(inviteCode, user.id);

    return {
      id: user.id,
      email,
      username,
      inviteCode,
      createdAt: new Date(createdAt).toISOString(),
    };
  }

  loginWithCode(dto: LoginWithCodeDto): AuthResponseDto {
    const code = this.normalizeCode(dto.code);
    this.validateInviteCode(code);

    const userId = randomUUID();
    const displayName = dto.displayName?.trim() || `user-${userId.slice(0, 8)}`;
    const user: UserRecord = {
      id: userId,
      displayName,
      createdAt: Date.now(),
    };
    this.users.set(user.id, user);

    const sessionId = randomUUID();
    const expiresAt = Date.now() + this.jwtTtlSeconds * 1000;
    this.sessions.set(sessionId, { userId: user.id, expiresAt });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      sessionId,
      displayName: user.displayName,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtTtlSeconds,
      user: {
        id: user.id,
        displayName: user.displayName,
      },
    };
  }

  getProfile(authenticatedUser: AuthenticatedUser): {
    id: string;
    displayName: string;
  } {
    const isSessionActive = this.isSessionActive(
      authenticatedUser.sub,
      authenticatedUser.sessionId,
    );
    if (!isSessionActive) {
      throw new UnauthorizedException('Session is expired or revoked');
    }

    const user = this.users.get(authenticatedUser.sub);
    if (!user) {
      throw new UnauthorizedException('User not found for token');
    }

    return {
      id: user.id,
      displayName: user.displayName,
    };
  }

  logout(authenticatedUser: AuthenticatedUser): void {
    this.sessions.delete(authenticatedUser.sessionId);
  }

  isSessionActive(userId: string, sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(sessionId);
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

  private generateUserInviteCode(): string {
    let code = `USER-${randomBytes(4).toString('hex').toUpperCase()}`;

    while (this.userIdByInviteCode.has(code)) {
      code = `USER-${randomBytes(4).toString('hex').toUpperCase()}`;
    }

    return code;
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
