import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { creditService } from '../services/credit.service';

export class CreditController {
  async getCredits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      
      const [balance, { transactions }] = await Promise.all([
        creditService.getBalance(userId),
        creditService.getTransactions(userId, { limit: 5 }),
      ]);

      res.json({
        balance: balance ? Number(balance.balance) : 0,
        total_purchased: balance ? Number(balance.totalPurchased) : 0,
        total_consumed: balance ? Number(balance.totalConsumed) : 0,
        recent_transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          balance_after: Number(t.balanceAfter),
          description: t.description,
          created_at: t.createdAt,
        })),
      });
    } catch (error) {
      console.error('Get credits error:', error);
      res.status(500).json({ error: 'Failed to get credits' });
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;
      const type = req.query.type as string | undefined;

      const { transactions, total } = await creditService.getTransactions(userId, { limit, offset });

      // Filter by type if provided
      const filteredTransactions = type
        ? transactions.filter(t => t.type === type)
        : transactions;

      res.json({
        data: filteredTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          balance_after: Number(t.balanceAfter),
          description: t.description,
          metadata: t.metadata,
          created_at: t.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
}

export const creditController = new CreditController();

