export const userError = {
  USER_001: {
    code: 'USER_001',
    message: 'User not found.',
    status: 404,
  },
  USER_002: {
    code: 'USER_002',
    message: 'Username already taken.',
    status: 409,
  },
  USER_003: {
    code: 'USER_003',
    message: 'Current password is incorrect.',
    status: 401,
  },
  USER_004: {
    code: 'USER_004',
    message: 'Failed to update user.',
    status: 500,
  },
};
