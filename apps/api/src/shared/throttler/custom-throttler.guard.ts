import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';

function toUser(value: unknown): AuthenticatedUser | undefined {
  if (typeof value === 'object' && value !== null && 'sub' in value) {
    return value as AuthenticatedUser;
  }
  return undefined;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    const tracker = await super.getTracker(req);
    if (tracker && tracker !== '0.0.0.0' && !tracker.includes('.')) {
      return tracker;
    }
    if ('socket' in req) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const user = toUser(req.data?.user as unknown);
      return user?.sub ? `ws:user:${user.sub}` : `ws:ip:${tracker}`;
    }
    const user = toUser(req.user as unknown);
    return user?.sub ? `http:user:${user.sub}` : `http:ip:${tracker}`;
  }
}
