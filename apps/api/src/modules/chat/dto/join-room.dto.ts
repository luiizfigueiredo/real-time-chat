import { IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID('4', { message: 'peerUserId deve ser um UUID válido' })
  peerUserId!: string;
}
