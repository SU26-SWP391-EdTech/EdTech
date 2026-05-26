export interface AuthUser {
  userId: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  avatarUrl: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}
