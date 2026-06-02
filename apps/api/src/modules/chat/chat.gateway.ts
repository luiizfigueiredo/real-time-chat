import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import type { AuthSocket } from './interfaces/auth-socket.interface';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { envValues } from '../../shared/env-values';
import { chatError } from '../../shared/error/messages/chat.error';

function roomChannel(roomId: string): string {
  return `room:${roomId}`;
}

function userChannel(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({
  cors: {
    origin: envValues.CORS_ORIGIN
      ? envValues.CORS_ORIGIN.split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : false,
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => new WsException({ errors }),
  }),
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AuthenticatedUser>(token);
      if (!payload.sub || !payload.sessionId) {
        client.disconnect(true);
        return;
      }

      const isSessionActive = await this.authService.isSessionActive(
        payload.sub,
        payload.sessionId,
      );
      if (!isSessionActive) {
        client.disconnect(true);
        return;
      }

      client.data.user = payload;

      await client.join(userChannel(payload.sub));

      const roomIds = await this.chatService.listUserRoomIds(payload.sub);
      for (const roomId of roomIds) {
        await client.join(roomChannel(roomId));
      }
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // limpeza automática pelo Socket.IO
  }

  @SubscribeMessage('chat:join')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async handleJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const user = client.data.user;
    if (!user) {
      throw new WsException(chatError.CHAT_001);
    }

    const room = await this.chatService.getOrCreateRoom(
      user.sub,
      dto.peerUserId,
    );
    await client.join(roomChannel(room.id));

    client.emit('chat:joined', {
      roomId: room.id,
      peerUserId: dto.peerUserId,
    });
  }

  @SubscribeMessage('chat:send')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async handleSend(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = client.data.user;
    if (!user) {
      throw new WsException(chatError.CHAT_001);
    }

    const { message, room } = await this.chatService.createMessage(
      user.sub,
      dto.peerUserId,
      dto.content,
    );

    this.server.to(roomChannel(room.id)).emit('chat:message', {
      id: message.id,
      roomId: room.id,
      senderId: message.senderId,
      content: message.content,
      sentAt: message.sentAt.toISOString(),
    });
  }

  private extractToken(client: AuthSocket): string | null {
    const authToken = (client.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (authToken) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return null;
  }
}
