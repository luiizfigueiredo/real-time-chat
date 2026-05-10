import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class signinDto {
  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  username!: string;
}
