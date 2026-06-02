import { Inject, Injectable } from '@nestjs/common';
import { eq, and, lt, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import * as schema from '@api/shared/db/schema';
import { DRIZZLE } from '@api/shared/db/db.provider';
import { BaseError } from '../../shared/error/base-error';
import { chatError } from '../../shared/error/messages/chat.error';

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
      throw new BaseError(chatError.CHAT_002);
    }

    const [peer] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, peerId))
      .limit(1);

    if (!peer) {
      throw new BaseError(chatError.CHAT_003);
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
      throw new BaseError(chatError.CHAT_004);
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

  async listUserRooms(userId: string) {
    const userRoomsA = await this.db
      .select({
        id: schema.rooms.id,
        peerUserId: schema.rooms.userBId,
        peerUsername: schema.users.username,
        lastMessageAt: schema.rooms.lastMessageAt,
        createdAt: schema.rooms.createdAt,
      })
      .from(schema.rooms)
      .innerJoin(schema.users, eq(schema.users.id, schema.rooms.userBId))
      .where(eq(schema.rooms.userAId, userId));

    const userRoomsB = await this.db
      .select({
        id: schema.rooms.id,
        peerUserId: schema.rooms.userAId,
        peerUsername: schema.users.username,
        lastMessageAt: schema.rooms.lastMessageAt,
        createdAt: schema.rooms.createdAt,
      })
      .from(schema.rooms)
      .innerJoin(schema.users, eq(schema.users.id, schema.rooms.userAId))
      .where(eq(schema.rooms.userBId, userId));

    const allRooms = [...userRoomsA, ...userRoomsB].sort(
      (a, b) =>
        (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
    );

    return allRooms.map((room) => ({
      id: room.id,
      peerUser: { id: room.peerUserId, username: room.peerUsername },
      lastMessageAt: room.lastMessageAt?.toISOString() ?? null,
      createdAt: room.createdAt.toISOString(),
    }));
  }

  async getMessages(
    userId: string,
    roomId: string,
    limit: number = 50,
    cursor?: string,
  ) {
    const [room] = await this.db
      .select({
        id: schema.rooms.id,
        userAId: schema.rooms.userAId,
        userBId: schema.rooms.userBId,
      })
      .from(schema.rooms)
      .where(eq(schema.rooms.id, roomId))
      .limit(1);

    if (!room || (userId !== room.userAId && userId !== room.userBId)) {
      throw new BaseError(chatError.CHAT_005);
    }

    const cursorDate = cursor ? new Date(cursor) : undefined;

    const queryLimit = limit + 1;

    const messages = await this.db
      .select()
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.roomId, roomId),
          cursorDate ? lt(schema.messages.sentAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(schema.messages.sentAt))
      .limit(queryLimit);

    const hasMore = messages.length > queryLimit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor =
      hasMore && sliced.length > 0
        ? sliced[sliced.length - 1].sentAt.toISOString()
        : null;

    return {
      messages: sliced.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        content: m.content,
        isRead: m.isRead,
        sentAt: m.sentAt.toISOString(),
      })),
      nextCursor,
    };
  }
}
