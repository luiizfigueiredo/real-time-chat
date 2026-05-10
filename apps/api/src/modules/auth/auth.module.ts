import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DEFAULT_JWT_EXPIRES_IN_SECONDS } from './auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { envValues } from '../../shared/env-values';

@Module({
  imports: [
    JwtModule.register({
      secret: envValues.JWT_SECRET,
      signOptions: {
        expiresIn:
          parseInt(envValues.JWT_EXPIRES_IN_SECONDS, 10) ||
          DEFAULT_JWT_EXPIRES_IN_SECONDS,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
