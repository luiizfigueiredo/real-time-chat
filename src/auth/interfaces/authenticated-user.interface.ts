export interface AuthenticatedUser {
  sub: string;
  sessionId: string;
  username: string;
  iat: number;
  exp: number;
}
