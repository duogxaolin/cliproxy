import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { creditService } from '../services/credit.service';
import prisma from '../utils/prisma';

export class AdminController {
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;
      const status = req.query.status as string | undefined;
      const role = req.query.role as string | undefined;

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            createdAt: true,
            credits: {
              select: {
                balance: true,
                totalPurchased: true,
                totalConsumed: true,
              },
            },
            _count: {
              select: {
                apiKeys: { where: { revokedAt: null } },
                apiRequests: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        data: users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username,
          role: u.role,
          status: u.status,
          created_at: u.createdAt,
          credits: u.credits ? {
            balance: Number(u.credits.balance),
            total_purchased: Number(u.credits.totalPurchased),
            total_consumed: Number(u.credits.totalConsumed),
          } : { balance: 0, total_purchased: 0, total_consumed: 0 },
          api_keys_count: u._count.apiKeys,
          requests_count: u._count.apiRequests,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  async getUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          createdAt: true,
          credits: true,
          apiKeys: {
            where: { revokedAt: null },
            select: {
              id: true,
              name: true,
              keyPrefix: true,
              quotaLimit: true,
              quotaUsed: true,
              expiresAt: true,
              createdAt: true,
            },
          },
          _count: {
            select: { apiRequests: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.createdAt,
        credits: user.credits ? {
          balance: Number(user.credits.balance),
          total_purchased: Number(user.credits.totalPurchased),
          total_consumed: Number(user.credits.totalConsumed),
        } : { balance: 0, total_purchased: 0, total_consumed: 0 },
        api_keys: user.apiKeys.map(k => ({
          id: k.id,
          name: k.name,
          key_prefix: k.keyPrefix,
          quota_limit: k.quotaLimit,
          quota_used: k.quotaUsed,
          expires_at: k.expiresAt,
          created_at: k.createdAt,
        })),
        requests_count: user._count.apiRequests,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async grantCredits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, description } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ error: 'Amount must be a positive number' });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const transaction = await creditService.addCredits(
        id,
        amount,
        description || `Admin credit grant`
      );

      res.json({
        message: 'Credits granted successfully',
        transaction: {
          id: transaction.id,
          amount: Number(transaction.amount),
          balance_after: Number(transaction.balanceAfter),
          description: transaction.description,
          created_at: transaction.createdAt,
        },
      });
    } catch (error) {
      console.error('Grant credits error:', error);
      res.status(500).json({ error: 'Failed to grant credits' });
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsers,
        totalRequests,
        recentRequests,
        totalCreditsGranted,
        totalCreditsConsumed,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.apiRequest.count(),
        prisma.apiRequest.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.userCredits.aggregate({
          _sum: { totalPurchased: true },
        }),
        prisma.userCredits.aggregate({
          _sum: { totalConsumed: true },
        }),
      ]);

      res.json({
        total_users: totalUsers,
        active_users: activeUsers,
        total_requests: totalRequests,
        requests_last_30_days: recentRequests,
        total_credits_granted: Number(totalCreditsGranted._sum.totalPurchased || 0),
        total_credits_consumed: Number(totalCreditsConsumed._sum.totalConsumed || 0),
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }
}

export const adminController = new AdminController();

