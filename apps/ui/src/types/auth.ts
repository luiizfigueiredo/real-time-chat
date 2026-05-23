export interface AuthResponseDto {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: { id: string; username: string }
}

export interface CreateUserResponseDto {
  id: string
  email: string
  username: string
  inviteCode: string
  createdAt: string
}

export interface SigninPayload {
  username: string
  password: string
}

export interface SignupPayload {
  email: string
  username: string
  password: string
}
