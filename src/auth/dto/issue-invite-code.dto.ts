import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class IssueInviteCodeDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'code must only contain letters, numbers or hyphens',
  })
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(86400)
  ttlSeconds?: number;
}
