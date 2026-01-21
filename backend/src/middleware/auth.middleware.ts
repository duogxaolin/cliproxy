import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { hashApiKey } from '../utils/apiKey';
import prisma from '../utils/prisma';
import { AuthenticatedRequest, ApiKeyAuthenticatedRequest } from '../types';

export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}

export async function authenticateApiKey(
  req: ApiKeyAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  let apiKey: string | undefined;

  if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  } else if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  try {
    const keyHash = hashApiKey(apiKey);
    const key = await prisma.apiKey.findFirst({
      where: {
        keyHash,
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!key) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Check if key is expired
    if (key.expiresAt && key.expiresAt < new Date()) {
      res.status(401).json({ error: 'API key has expired' });
      return;
    }

    // Check if user is active
    if (key.user.status !== 'active') {
      res.status(403).json({ error: 'User account is suspended' });
      return;
    }

    req.apiKey = {
      userId: key.userId,
      keyId: key.id,
      allowedModels: key.allowedModels as string[] | null,
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    next();
  };
}

