export interface AuthenticationRequest {
  login: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
}