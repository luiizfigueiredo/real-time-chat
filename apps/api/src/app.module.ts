import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DbModule } from './shared/db/db.module';
import { ChatModule } from './modules/chat/chat.module';
import { UsersModule } from './modules/users/users.module';
import { ThrottlerConfigModule } from './shared/throttler/throttler.module';

@Module({
  imports: [
    DbModule,
    ThrottlerConfigModule,
    AuthModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
