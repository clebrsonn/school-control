import { UserResponse } from '../../users/types/UserTypes.ts';

export interface AuthenticationRequest {
  login: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  user: UserResponse
}