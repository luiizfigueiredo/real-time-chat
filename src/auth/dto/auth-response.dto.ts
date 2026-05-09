export interface AuthResponseDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    username: string;
  };
}
