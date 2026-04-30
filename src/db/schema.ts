import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    inviteCode: varchar('invite_code', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_username_unique').on(table.username),
    uniqueIndex('users_invite_code_unique').on(table.inviteCode),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('refresh_tokens_user_id_idx').on(table.userId),
    index('refresh_tokens_expires_at_idx').on(table.expiresAt),
  ],
);

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey(),
    userAId: uuid('user_a_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userBId: uuid('user_b_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    lastMessageAt: timestamp('last_message_at', { mode: 'date' }),
  },
  (table) => [
    index('rooms_user_a_id_idx').on(table.userAId),
    index('rooms_user_b_id_idx').on(table.userBId),
    uniqueIndex('rooms_user_pair_unique').on(table.userAId, table.userBId),
    check(
      'rooms_distinct_users_check',
      sql`${table.userAId} <> ${table.userBId}`,
    ),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    sentAt: timestamp('sent_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('messages_room_sent_at_idx').on(table.roomId, table.sentAt),
    index('messages_sender_id_idx').on(table.senderId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  roomsAsUserA: many(rooms, { relationName: 'room_user_a' }),
  roomsAsUserB: many(rooms, { relationName: 'room_user_b' }),
  sentMessages: many(messages),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const roomsRelations = relations(rooms, ({ many, one }) => ({
  userA: one(users, {
    fields: [rooms.userAId],
    references: [users.id],
    relationName: 'room_user_a',
  }),
  userB: one(users, {
    fields: [rooms.userBId],
    references: [users.id],
    relationName: 'room_user_b',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
