export class PeerUserDto {
  id!: string;
  username!: string;
}

export class RoomResponseDto {
  id!: string;
  peerUser!: PeerUserDto;
  lastMessageAt!: string | null;
  createdAt!: string;
}
