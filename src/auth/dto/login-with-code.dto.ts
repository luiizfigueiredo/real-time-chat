import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginWithCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'code must only contain letters, numbers or hyphens',
  })
  code!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  displayName?: string;
}
