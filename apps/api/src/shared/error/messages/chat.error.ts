export const chatError = {
  CHAT_001: {
    code: 'CHAT_001',
    message: 'Missing authenticated user.',
    status: 401,
  },
  CHAT_002: {
    code: 'CHAT_002',
    message: 'Cannot create a chat with yourself.',
    status: 400,
  },
  CHAT_003: {
    code: 'CHAT_003',
    message: 'Peer user not found.',
    status: 404,
  },
  CHAT_004: {
    code: 'CHAT_004',
    message: 'Message content cannot be empty.',
    status: 400,
  },
  CHAT_005: {
    code: 'CHAT_005',
    message: 'Room not found or you are not a member.',
    status: 403,
  },
};
