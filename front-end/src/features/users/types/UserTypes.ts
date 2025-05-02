export interface UserRequest {
  username: string;
  password?: string;
  email: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  accountNonLocked: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  createdAt: string;
  updatedAt: string;
}