import { CreditTransaction, UserCredits, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export interface DeductCreditsMetadata {
  apiKeyId: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  requestId?: string;
}

export interface TransactionFilters {
  limit?: number;
  offset?: number;
}

export class CreditService {
  async getBalance(userId: string): Promise<UserCredits | null> {
    return prisma.userCredits.findUnique({
      where: { userId },
    });
  }

  async deductCredits(
    userId: string,
    amount: number,
    metadata: DeductCreditsMetadata
  ): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new Error('Deduction amount must be positive');
    }

    return prisma.$transaction(async (tx) => {
      // Get current balance with lock
      const credits = await tx.userCredits.findUnique({
        where: { userId },
      });

      if (!credits) {
        throw new Error('User credits not found');
      }

      const currentBalance = Number(credits.balance);
      if (currentBalance < amount) {
        throw new Error('Insufficient credits');
      }

      const newBalance = currentBalance - amount;

      // Update balance
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalConsumed: { increment: amount },
        },
      });

      // Create transaction record
      return tx.creditTransaction.create({
        data: {
          userId,
          type: 'deduction',
          amount: -amount,
          balanceAfter: newBalance,
          description: `API usage: ${metadata.tokensInput} input + ${metadata.tokensOutput} output tokens`,
          metadata: metadata as unknown as Prisma.InputJsonValue,
        },
      });
    });
  }

  async addCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    return prisma.$transaction(async (tx) => {
      // Get current balance
      const credits = await tx.userCredits.findUnique({
        where: { userId },
      });

      if (!credits) {
        throw new Error('User credits not found');
      }

      const currentBalance = Number(credits.balance);
      const newBalance = currentBalance + amount;

      // Update balance
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalPurchased: { increment: amount },
        },
      });

      // Create transaction record
      return tx.creditTransaction.create({
        data: {
          userId,
          type: 'grant',
          amount,
          balanceAfter: newBalance,
          description,
        },
      });
    });
  }

  async deductCreditsAdmin(
    userId: string,
    amount: number,
    description: string
  ): Promise<CreditTransaction> {
    if (amount <= 0) {
      throw new Error('Deduction amount must be positive');
    }

    return prisma.$transaction(async (tx) => {
      // Get current balance
      const credits = await tx.userCredits.findUnique({
        where: { userId },
      });

      if (!credits) {
        throw new Error('User credits not found');
      }

      const currentBalance = Number(credits.balance);
      if (currentBalance < amount) {
        throw new Error('Insufficient credits');
      }

      const newBalance = currentBalance - amount;

      // Update balance
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance,
        },
      });

      // Create transaction record
      return tx.creditTransaction.create({
        data: {
          userId,
          type: 'deduction',
          amount: -amount,
          balanceAfter: newBalance,
          description,
        },
      });
    });
  }

  async getTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<{ transactions: CreditTransaction[]; total: number }> {
    const { limit = 20, offset = 0 } = filters;

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.creditTransaction.count({
        where: { userId },
      }),
    ]);

    return { transactions, total };
  }

  async checkSufficientCredits(userId: string, estimatedCost: number): Promise<boolean> {
    const credits = await this.getBalance(userId);
    if (!credits) return false;
    return Number(credits.balance) >= estimatedCost;
  }
}

export const creditService = new CreditService();

