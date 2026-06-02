import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ChatService } from './chat.service';
import { GetMessagesDto } from './dto/get-messages.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  listRooms(@CurrentUser() authenticatedUser: AuthenticatedUser) {
    return this.chatService.listUserRooms(authenticatedUser.sub);
  }

  @Get('rooms/:roomId/messages')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  getMessages(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param('roomId') roomId: string,
    @Query() dto: GetMessagesDto,
  ) {
    return this.chatService.getMessages(
      authenticatedUser.sub,
      roomId,
      dto.limit,
      dto.cursor,
    );
  }
}
