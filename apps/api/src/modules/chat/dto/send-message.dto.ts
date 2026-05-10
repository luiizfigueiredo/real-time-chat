import { IsString, IsUUID, Length } from 'class-validator';

export class SendMessageDto {
  @IsUUID('4', { message: 'peerUserId deve ser um UUID válido' })
  peerUserId!: string;

  @IsString({ message: 'content deve ser uma string' })
  @Length(1, 2000, { message: 'content deve ter entre 1 e 2000 caracteres' })
  content!: string;
}
