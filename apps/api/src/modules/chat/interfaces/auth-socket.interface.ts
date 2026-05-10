import { AuthenticatedUser } from '@api/modules/auth/interfaces/authenticated-user.interface';
import type { Socket } from 'socket.io';

export interface AuthSocket extends Socket {
  data: {
    user?: AuthenticatedUser;
  };
}
