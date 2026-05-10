import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DbModule } from './shared/db/db.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [DbModule, AuthModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
