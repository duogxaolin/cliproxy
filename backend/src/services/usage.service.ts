import { ApiRequest, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export interface LogRequestData {
  userId: string;
  apiKeyId: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  statusCode: number;
  durationMs: number;
  ipAddress?: string;
  errorMessage?: string;
}

export interface UsageFilters {
  startDate?: Date;
  endDate?: Date;
  apiKeyId?: string;
  modelId?: string;
  limit?: number;
  offset?: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCost: number;
  requests: ApiRequest[];
}

export class UsageService {
  async logRequest(data: LogRequestData): Promise<ApiRequest> {
    return prisma.apiRequest.create({
      data: {
        userId: data.userId,
        apiKeyId: data.apiKeyId,
        modelId: data.modelId,
        tokensInput: data.tokensInput,
        tokensOutput: data.tokensOutput,
        cost: data.cost,
        statusCode: data.statusCode,
        durationMs: data.durationMs,
        ipAddress: data.ipAddress,
        errorMessage: data.errorMessage,
      },
    });
  }

  async getUsageStats(userId: string, filters: UsageFilters = {}): Promise<UsageStats> {
    const { startDate, endDate, apiKeyId, modelId, limit = 100, offset = 0 } = filters;

    const where: Prisma.ApiRequestWhereInput = {
      userId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
      ...(apiKeyId && { apiKeyId }),
      ...(modelId && { modelId }),
    };

    // Handle date range properly
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [requests, aggregation] = await Promise.all([
      prisma.apiRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          model: {
            select: { displayName: true },
          },
          apiKey: {
            select: { name: true, keyPrefix: true },
          },
        },
      }),
      prisma.apiRequest.aggregate({
        where,
        _count: { id: true },
        _sum: {
          tokensInput: true,
          tokensOutput: true,
          cost: true,
        },
      }),
    ]);

    return {
      totalRequests: aggregation._count.id,
      totalTokensInput: aggregation._sum.tokensInput || 0,
      totalTokensOutput: aggregation._sum.tokensOutput || 0,
      totalCost: Number(aggregation._sum.cost || 0),
      requests,
    };
  }

  async incrementQuotaUsed(apiKeyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { quotaUsed: { increment: 1 } },
    });
  }

  async checkQuota(apiKeyId: string): Promise<{ allowed: boolean; quotaUsed: number; quotaLimit: number | null }> {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      select: { quotaUsed: true, quotaLimit: true },
    });

    if (!apiKey) {
      return { allowed: false, quotaUsed: 0, quotaLimit: null };
    }

    if (apiKey.quotaLimit === null) {
      return { allowed: true, quotaUsed: apiKey.quotaUsed, quotaLimit: null };
    }

    return {
      allowed: apiKey.quotaUsed < apiKey.quotaLimit,
      quotaUsed: apiKey.quotaUsed,
      quotaLimit: apiKey.quotaLimit,
    };
  }
}

export const usageService = new UsageService();

