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

export type GroupBy = 'hour' | 'day' | 'week' | 'month';

export interface UsageByTimeEntry {
  date: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface UsageByModelEntry {
  model_id: string;
  model_name: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface UsageByApiKeyEntry {
  api_key_id: string;
  api_key_name: string;
  key_prefix: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface RequestLogEntry {
  id: string;
  model_name: string;
  api_key_name: string;
  key_prefix: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  status_code: number;
  duration_ms: number;
  created_at: Date;
}

export interface TotalStats {
  total_requests: number;
  total_tokens_input: number;
  total_tokens_output: number;
  total_cost: number;
  requests_today: number;
  cost_today: number;
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

  async getTotalStats(userId: string): Promise<TotalStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allTime, todayStats] = await Promise.all([
      prisma.apiRequest.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          tokensInput: true,
          tokensOutput: true,
          cost: true,
        },
      }),
      prisma.apiRequest.aggregate({
        where: {
          userId,
          createdAt: { gte: today },
        },
        _count: { id: true },
        _sum: { cost: true },
      }),
    ]);

    return {
      total_requests: allTime._count.id,
      total_tokens_input: allTime._sum.tokensInput || 0,
      total_tokens_output: allTime._sum.tokensOutput || 0,
      total_cost: Number(allTime._sum.cost || 0),
      requests_today: todayStats._count.id,
      cost_today: Number(todayStats._sum.cost || 0),
    };
  }

  async getUsageByTime(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: GroupBy = 'day'
  ): Promise<UsageByTimeEntry[]> {
    const dateFormat = this.getDateFormat(groupBy);

    const results = await prisma.$queryRaw<Array<{
      date: string;
      requests: bigint;
      tokens_input: bigint;
      tokens_output: bigint;
      cost: Prisma.Decimal;
    }>>`
      SELECT
        TO_CHAR(created_at, ${dateFormat}) as date,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(tokens_input), 0)::bigint as tokens_input,
        COALESCE(SUM(tokens_output), 0)::bigint as tokens_output,
        COALESCE(SUM(cost), 0) as cost
      FROM api_requests
      WHERE user_id = ${userId}::uuid
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY date ASC
    `;

    return results.map(r => ({
      date: r.date,
      requests: Number(r.requests),
      tokens_input: Number(r.tokens_input),
      tokens_output: Number(r.tokens_output),
      cost: Number(r.cost),
    }));
  }

  async getUsageByModel(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageByModelEntry[]> {
    const results = await prisma.$queryRaw<Array<{
      model_id: string;
      model_name: string;
      requests: bigint;
      tokens_input: bigint;
      tokens_output: bigint;
      cost: Prisma.Decimal;
    }>>`
      SELECT
        ar.model_id::text as model_id,
        sm.display_name as model_name,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(ar.tokens_input), 0)::bigint as tokens_input,
        COALESCE(SUM(ar.tokens_output), 0)::bigint as tokens_output,
        COALESCE(SUM(ar.cost), 0) as cost
      FROM api_requests ar
      JOIN shadow_models sm ON ar.model_id = sm.id
      WHERE ar.user_id = ${userId}::uuid
        AND ar.created_at >= ${startDate}
        AND ar.created_at <= ${endDate}
      GROUP BY ar.model_id, sm.display_name
      ORDER BY requests DESC
    `;

    return results.map(r => ({
      model_id: r.model_id,
      model_name: r.model_name,
      requests: Number(r.requests),
      tokens_input: Number(r.tokens_input),
      tokens_output: Number(r.tokens_output),
      cost: Number(r.cost),
    }));
  }

  async getUsageByApiKey(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageByApiKeyEntry[]> {
    const results = await prisma.$queryRaw<Array<{
      api_key_id: string;
      api_key_name: string;
      key_prefix: string;
      requests: bigint;
      tokens_input: bigint;
      tokens_output: bigint;
      cost: Prisma.Decimal;
    }>>`
      SELECT
        ar.api_key_id::text as api_key_id,
        ak.name as api_key_name,
        ak.key_prefix as key_prefix,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(ar.tokens_input), 0)::bigint as tokens_input,
        COALESCE(SUM(ar.tokens_output), 0)::bigint as tokens_output,
        COALESCE(SUM(ar.cost), 0) as cost
      FROM api_requests ar
      JOIN api_keys ak ON ar.api_key_id = ak.id
      WHERE ar.user_id = ${userId}::uuid
        AND ar.created_at >= ${startDate}
        AND ar.created_at <= ${endDate}
      GROUP BY ar.api_key_id, ak.name, ak.key_prefix
      ORDER BY requests DESC
    `;

    return results.map(r => ({
      api_key_id: r.api_key_id,
      api_key_name: r.api_key_name,
      key_prefix: r.key_prefix,
      requests: Number(r.requests),
      tokens_input: Number(r.tokens_input),
      tokens_output: Number(r.tokens_output),
      cost: Number(r.cost),
    }));
  }

  async getRequestLogs(
    userId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      apiKeyId?: string;
      modelId?: string;
      statusCode?: number;
    },
    pagination: { page: number; limit: number }
  ): Promise<{ data: RequestLogEntry[]; total: number }> {
    const { startDate, endDate, apiKeyId, modelId, statusCode } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const where: Prisma.ApiRequestWhereInput = {
      userId,
      ...(apiKeyId && { apiKeyId }),
      ...(modelId && { modelId }),
      ...(statusCode && { statusCode }),
    };

    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    } else if (startDate) {
      where.createdAt = { gte: startDate };
    } else if (endDate) {
      where.createdAt = { lte: endDate };
    }

    const [requests, total] = await Promise.all([
      prisma.apiRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          model: { select: { displayName: true } },
          apiKey: { select: { name: true, keyPrefix: true } },
        },
      }),
      prisma.apiRequest.count({ where }),
    ]);

    return {
      data: requests.map(r => ({
        id: r.id,
        model_name: r.model.displayName,
        api_key_name: r.apiKey.name,
        key_prefix: r.apiKey.keyPrefix,
        tokens_input: r.tokensInput,
        tokens_output: r.tokensOutput,
        cost: Number(r.cost),
        status_code: r.statusCode,
        duration_ms: r.durationMs,
        created_at: r.createdAt,
      })),
      total,
    };
  }

  // Admin analytics methods
  async getPlatformAnalytics(startDate: Date, endDate: Date): Promise<{
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    unique_users: number;
  }> {
    const result = await prisma.$queryRaw<Array<{
      total_requests: bigint;
      total_tokens: bigint;
      total_cost: Prisma.Decimal;
      unique_users: bigint;
    }>>`
      SELECT
        COUNT(*)::bigint as total_requests,
        COALESCE(SUM(tokens_input + tokens_output), 0)::bigint as total_tokens,
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(DISTINCT user_id)::bigint as unique_users
      FROM api_requests
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
    `;

    const r = result[0];
    return {
      total_requests: Number(r.total_requests),
      total_tokens: Number(r.total_tokens),
      total_cost: Number(r.total_cost),
      unique_users: Number(r.unique_users),
    };
  }

  async getAnalyticsByUser(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<Array<{
    user_id: string;
    username: string;
    email: string;
    requests: number;
    tokens: number;
    cost: number;
  }>> {
    const results = await prisma.$queryRaw<Array<{
      user_id: string;
      username: string;
      email: string;
      requests: bigint;
      tokens: bigint;
      cost: Prisma.Decimal;
    }>>`
      SELECT
        ar.user_id::text as user_id,
        u.username,
        u.email,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(ar.tokens_input + ar.tokens_output), 0)::bigint as tokens,
        COALESCE(SUM(ar.cost), 0) as cost
      FROM api_requests ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.created_at >= ${startDate}
        AND ar.created_at <= ${endDate}
      GROUP BY ar.user_id, u.username, u.email
      ORDER BY cost DESC
      LIMIT ${limit}
    `;

    return results.map(r => ({
      user_id: r.user_id,
      username: r.username,
      email: r.email,
      requests: Number(r.requests),
      tokens: Number(r.tokens),
      cost: Number(r.cost),
    }));
  }

  async getAnalyticsByModel(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    model_id: string;
    model_name: string;
    requests: number;
    tokens: number;
    cost: number;
    unique_users: number;
  }>> {
    const results = await prisma.$queryRaw<Array<{
      model_id: string;
      model_name: string;
      requests: bigint;
      tokens: bigint;
      cost: Prisma.Decimal;
      unique_users: bigint;
    }>>`
      SELECT
        ar.model_id::text as model_id,
        sm.display_name as model_name,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(ar.tokens_input + ar.tokens_output), 0)::bigint as tokens,
        COALESCE(SUM(ar.cost), 0) as cost,
        COUNT(DISTINCT ar.user_id)::bigint as unique_users
      FROM api_requests ar
      JOIN shadow_models sm ON ar.model_id = sm.id
      WHERE ar.created_at >= ${startDate}
        AND ar.created_at <= ${endDate}
      GROUP BY ar.model_id, sm.display_name
      ORDER BY requests DESC
    `;

    return results.map(r => ({
      model_id: r.model_id,
      model_name: r.model_name,
      requests: Number(r.requests),
      tokens: Number(r.tokens),
      cost: Number(r.cost),
      unique_users: Number(r.unique_users),
    }));
  }

  async getUsageTrends(
    startDate: Date,
    endDate: Date,
    groupBy: GroupBy = 'day'
  ): Promise<UsageByTimeEntry[]> {
    const dateFormat = this.getDateFormat(groupBy);

    const results = await prisma.$queryRaw<Array<{
      date: string;
      requests: bigint;
      tokens_input: bigint;
      tokens_output: bigint;
      cost: Prisma.Decimal;
    }>>`
      SELECT
        TO_CHAR(created_at, ${dateFormat}) as date,
        COUNT(*)::bigint as requests,
        COALESCE(SUM(tokens_input), 0)::bigint as tokens_input,
        COALESCE(SUM(tokens_output), 0)::bigint as tokens_output,
        COALESCE(SUM(cost), 0) as cost
      FROM api_requests
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY date ASC
    `;

    return results.map(r => ({
      date: r.date,
      requests: Number(r.requests),
      tokens_input: Number(r.tokens_input),
      tokens_output: Number(r.tokens_output),
      cost: Number(r.cost),
    }));
  }

  private getDateFormat(groupBy: GroupBy): string {
    switch (groupBy) {
      case 'hour':
        return 'YYYY-MM-DD HH24:00';
      case 'day':
        return 'YYYY-MM-DD';
      case 'week':
        return 'IYYY-IW';
      case 'month':
        return 'YYYY-MM';
      default:
        return 'YYYY-MM-DD';
    }
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

