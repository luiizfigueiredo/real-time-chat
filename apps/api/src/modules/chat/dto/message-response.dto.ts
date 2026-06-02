export class MessageResponseDto {
  id!: string;
  roomId!: string;
  senderId!: string;
  content!: string;
  isRead!: boolean;
  sentAt!: string;
}
