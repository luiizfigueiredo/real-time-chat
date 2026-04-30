import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  DEFAULT_JWT_EXPIRES_IN_SECONDS,
  DEFAULT_JWT_SECRET,
  readPositiveIntEnv,
} from './auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
      signOptions: {
        expiresIn: readPositiveIntEnv(
          'JWT_EXPIRES_IN_SECONDS',
          DEFAULT_JWT_EXPIRES_IN_SECONDS,
        ),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
