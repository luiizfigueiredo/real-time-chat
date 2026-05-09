import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class signupDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'username must only contain letters, numbers, dots, underscores or hyphens',
  })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  password!: string;
}
