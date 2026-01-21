import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { usageService, GroupBy } from '../services/usage.service';

export class UsageController {
  async getUsageSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const stats = await usageService.getTotalStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Get usage summary error:', error);
      res.status(500).json({ error: 'Failed to get usage summary' });
    }
  }

  async getUsageByTime(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { start_date, end_date, group_by } = req.query;

      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();
      const groupBy = (group_by as GroupBy) || 'day';

      if (!['hour', 'day', 'week', 'month'].includes(groupBy)) {
        res.status(400).json({ error: 'Invalid group_by value. Must be hour, day, week, or month' });
        return;
      }

      const data = await usageService.getUsageByTime(userId, startDate, endDate, groupBy);
      res.json({ data });
    } catch (error) {
      console.error('Get usage by time error:', error);
      res.status(500).json({ error: 'Failed to get usage by time' });
    }
  }

  async getUsageByModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();

      const data = await usageService.getUsageByModel(userId, startDate, endDate);
      res.json({ data });
    } catch (error) {
      console.error('Get usage by model error:', error);
      res.status(500).json({ error: 'Failed to get usage by model' });
    }
  }

  async getUsageByKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();

      const data = await usageService.getUsageByApiKey(userId, startDate, endDate);
      res.json({ data });
    } catch (error) {
      console.error('Get usage by key error:', error);
      res.status(500).json({ error: 'Failed to get usage by API key' });
    }
  }

  async getRequestLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { start_date, end_date, api_key_id, model_id, status_code, page, limit } = req.query;

      const filters = {
        startDate: start_date ? new Date(start_date as string) : undefined,
        endDate: end_date ? new Date(end_date as string) : undefined,
        apiKeyId: api_key_id as string | undefined,
        modelId: model_id as string | undefined,
        statusCode: status_code ? parseInt(status_code as string) : undefined,
      };

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100),
      };

      const result = await usageService.getRequestLogs(userId, filters, pagination);

      res.json({
        data: result.data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          total_pages: Math.ceil(result.total / pagination.limit),
        },
      });
    } catch (error) {
      console.error('Get request logs error:', error);
      res.status(500).json({ error: 'Failed to get request logs' });
    }
  }
}

export const usageController = new UsageController();

