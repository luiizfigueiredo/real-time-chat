export interface AuthenticatedUser {
  sub: string;
  sessionId: string;
  displayName: string;
  iat: number;
  exp: number;
}
