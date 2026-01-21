import { Request } from 'express';
import { UserRole, UserStatus } from '@prisma/client';

export * from './auth.types';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiKeyPayload {
  userId: string;
  keyId: string;
  allowedModels: string[] | null;
}

export interface ApiKeyAuthenticatedRequest extends Request {
  apiKey?: ApiKeyPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

