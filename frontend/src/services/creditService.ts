import api from './api';

export interface CreditTransaction {
  id: string;
  type: 'grant' | 'deduction' | 'refund';
  amount: number;
  balance_after: number;
  description: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreditsResponse {
  balance: number;
  total_purchased: number;
  total_consumed: number;
  recent_transactions: CreditTransaction[];
}

export interface TransactionsResponse {
  data: CreditTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const creditService = {
  async getCredits(): Promise<CreditsResponse> {
    const response = await api.get<CreditsResponse>('/api/users/me/credits');
    return response.data;
  },

  async getTransactions(
    page: number = 1,
    limit: number = 20,
    type?: string
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) params.append('type', type);

    const response = await api.get<TransactionsResponse>(
      `/api/users/me/credits/transactions?${params.toString()}`
    );
    return response.data;
  },
};

