export type Role = 'USER' | 'ADMIN';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    hasCompletedOnboarding: boolean;
  };
  accessToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  hasCompletedOnboarding: boolean;
}
