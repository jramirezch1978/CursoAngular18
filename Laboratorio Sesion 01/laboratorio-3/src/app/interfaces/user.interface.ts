export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: Date;
} 