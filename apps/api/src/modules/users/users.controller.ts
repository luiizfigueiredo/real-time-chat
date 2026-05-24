import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { SearchUsersDto } from './dto/search-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { UserProfileDto } from './dto/user-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query() dto: SearchUsersDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<UserProfileDto[]> {
    return this.usersService.findAll(dto, authenticatedUser.sub);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserProfileDto> {
    return this.usersService.findById(id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateMe(authenticatedUser.sub, dto);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: true }> {
    return this.usersService.changePassword(authenticatedUser.sub, dto);
  }
}
