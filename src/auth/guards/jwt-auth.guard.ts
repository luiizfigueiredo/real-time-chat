import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AuthenticatedUser>(token);

      if (!payload.sub || !payload.sessionId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const isSessionActive = await this.authService.isSessionActive(
        payload.sub,
        payload.sessionId,
      );
      if (!isSessionActive) {
        throw new UnauthorizedException('Session is expired or revoked');
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  private extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
