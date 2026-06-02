import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import {
  DEFAULT_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_TTL,
} from './throttler.constants';
import { envValues } from '../env-values';

const ttl = parseInt(envValues.THROTTLE_TTL, 10) || DEFAULT_THROTTLE_TTL;
const limit = parseInt(envValues.THROTTLE_LIMIT, 10) || DEFAULT_THROTTLE_LIMIT;

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl, limit }],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class ThrottlerConfigModule {}
