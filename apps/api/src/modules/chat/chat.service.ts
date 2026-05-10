import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import * as schema from '@api/shared/db/schema';
import { DRIZZLE } from '@api/shared/db/db.provider';

@Injectable()
export class ChatService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private normalizePair(a: string, b: string): [string, string] {
    return a.localeCompare(b) < 0 ? [a, b] : [b, a];
  }

  async getOrCreateRoom(requesterId: string, peerId: string) {
    if (requesterId === peerId) {
      throw new BadRequestException(
        'Não é possível criar uma conversa consigo mesmo',
      );
    }

    const [peer] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, peerId))
      .limit(1);

    if (!peer) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const [userAId, userBId] = this.normalizePair(requesterId, peerId);

    const [existing] = await this.db
      .select()
      .from(schema.rooms)
      .where(
        and(
          eq(schema.rooms.userAId, userAId),
          eq(schema.rooms.userBId, userBId),
        ),
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    try {
      const [room] = await this.db
        .insert(schema.rooms)
        .values({ id: randomUUID(), userAId, userBId })
        .returning();
      return room;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        const [room] = await this.db
          .select()
          .from(schema.rooms)
          .where(
            and(
              eq(schema.rooms.userAId, userAId),
              eq(schema.rooms.userBId, userBId),
            ),
          )
          .limit(1);
        if (room) return room;
      }
      throw error;
    }
  }

  async createMessage(senderId: string, recipientId: string, content: string) {
    const room = await this.getOrCreateRoom(senderId, recipientId);
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new BadRequestException('Mensagem não pode estar vazia');
    }

    const [message] = await this.db
      .insert(schema.messages)
      .values({
        id: randomUUID(),
        roomId: room.id,
        senderId,
        content: trimmedContent,
      })
      .returning();

    await this.db
      .update(schema.rooms)
      .set({ lastMessageAt: message.sentAt })
      .where(eq(schema.rooms.id, room.id));

    return { message, room };
  }

  async listUserRoomIds(userId: string) {
    const rooms = await this.db
      .select({ id: schema.rooms.id })
      .from(schema.rooms)
      .where(eq(schema.rooms.userAId, userId));
    const roomsB = await this.db
      .select({ id: schema.rooms.id })
      .from(schema.rooms)
      .where(eq(schema.rooms.userBId, userId));
    return [...rooms, ...roomsB].map((r) => r.id);
  }
}
