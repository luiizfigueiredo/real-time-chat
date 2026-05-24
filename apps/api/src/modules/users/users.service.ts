import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, ilike, not, and, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { compare, hash } from 'bcrypt';
import { DRIZZLE } from '../../shared/db/db.provider';
import * as schema from '../../shared/db/schema';
import { BaseError } from '../../shared/error/base-error';
import { userError } from '../../shared/error/messages/user.error';
import type { SearchUsersDto } from './dto/search-users.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(
    dto: SearchUsersDto,
    excludeUserId?: string,
  ): Promise<UserProfileDto[]> {
    const conditions: (SQL<unknown> | undefined)[] = [];
    if (dto.q) {
      conditions.push(
        or(
          ilike(schema.users.username, `%${dto.q}%`),
          ilike(schema.users.email, `%${dto.q}%`),
        ),
      );
    }

    if (excludeUserId) {
      conditions.push(not(eq(schema.users.id, excludeUserId)));
    }

    const whereClause = conditions.length
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

    const users = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(whereClause)
      .limit(50);

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<UserProfileDto> {
    const [user] = await this.db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    if (!user) {
      throw new BaseError(userError.USER_001);
    }

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserProfileDto> {
    if (dto.username) {
      const [existing] = await this.db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.username, dto.username),
            not(eq(schema.users.id, userId)),
          ),
        )
        .limit(1);

      if (existing) {
        throw new BaseError(userError.USER_002);
      }
    }

    const [updated] = await this.db
      .update(schema.users)
      .set({ username: dto.username })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        createdAt: schema.users.createdAt,
      });

    if (!updated) {
      throw new BaseError(userError.USER_001);
    }

    return {
      id: updated.id,
      username: updated.username,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    const [user] = await this.db
      .select({ passwordHash: schema.users.passwordHash })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new BaseError(userError.USER_001);
    }

    const validPassword = await compare(dto.currentPassword, user.passwordHash);
    if (!validPassword) {
      throw new BaseError(userError.USER_003);
    }

    const hashedNewPassword = await hash(dto.newPassword, 12);

    await this.db
      .update(schema.users)
      .set({ passwordHash: hashedNewPassword })
      .where(eq(schema.users.id, userId));

    return { success: true };
  }
}
