import { ApiKey, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { generateApiKey, hashApiKey } from '../utils/apiKey';

export interface CreateApiKeyData {
  name: string;
  allowed_models?: string[] | null;
  quota_limit?: number | null;
  expires_at?: Date | null;
}

export interface UpdateApiKeyData {
  name?: string;
  allowed_models?: string[] | null;
  quota_limit?: number | null;
  expires_at?: Date | null;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  key_prefix: string;
  allowed_models: string[] | null;
  quota_limit: number | null;
  quota_used: number;
  expires_at: Date | null;
  created_at: Date;
  revoked_at: Date | null;
}

export interface ApiKeyCreateResponse extends ApiKeyResponse {
  key: string; // Only returned on creation
}

function mapApiKeyToResponse(apiKey: ApiKey): ApiKeyResponse {
  return {
    id: apiKey.id,
    name: apiKey.name,
    key_prefix: apiKey.keyPrefix,
    allowed_models: apiKey.allowedModels as string[] | null,
    quota_limit: apiKey.quotaLimit,
    quota_used: apiKey.quotaUsed,
    expires_at: apiKey.expiresAt,
    created_at: apiKey.createdAt,
    revoked_at: apiKey.revokedAt,
  };
}

export class ApiKeyService {
  async createApiKey(userId: string, data: CreateApiKeyData): Promise<ApiKeyCreateResponse> {
    const { key, prefix } = generateApiKey();
    const keyHash = hashApiKey(key);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        keyHash,
        keyPrefix: prefix,
        name: data.name,
        allowedModels: data.allowed_models as Prisma.InputJsonValue ?? Prisma.JsonNull,
        quotaLimit: data.quota_limit ?? null,
        expiresAt: data.expires_at ?? null,
      },
    });

    return {
      ...mapApiKeyToResponse(apiKey),
      key, // Return plain key only on creation
    };
  }

  async getApiKeys(userId: string): Promise<ApiKeyResponse[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map(mapApiKeyToResponse);
  }

  async getApiKey(userId: string, keyId: string): Promise<ApiKeyResponse | null> {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!apiKey) return null;
    return mapApiKeyToResponse(apiKey);
  }

  async updateApiKey(userId: string, keyId: string, data: UpdateApiKeyData): Promise<ApiKeyResponse | null> {
    // First check if the key belongs to the user
    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!existing) return null;

    const updateData: Prisma.ApiKeyUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.allowed_models !== undefined) {
      updateData.allowedModels = data.allowed_models as Prisma.InputJsonValue ?? Prisma.JsonNull;
    }
    if (data.quota_limit !== undefined) updateData.quotaLimit = data.quota_limit;
    if (data.expires_at !== undefined) updateData.expiresAt = data.expires_at;

    const apiKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: updateData,
    });

    return mapApiKeyToResponse(apiKey);
  }

  async revokeApiKey(userId: string, keyId: string): Promise<ApiKeyResponse | null> {
    // First check if the key belongs to the user
    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, userId, revokedAt: null },
    });

    if (!existing) return null;

    const apiKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return mapApiKeyToResponse(apiKey);
  }

  async incrementQuotaUsed(keyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { quotaUsed: { increment: 1 } },
    });
  }
}

export const apiKeyService = new ApiKeyService();

