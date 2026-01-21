import { useState, useEffect } from 'react';
import { UserLayout } from '../components/layout';
import { Card, Badge, Spinner, Alert } from '../components/ui';
import { creditService, CreditsResponse, CreditTransaction } from '../services/creditService';

export default function CreditsPage() {
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadCredits();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, filterType]);

  const loadCredits = async () => {
    try {
      const data = await creditService.getCredits();
      setCredits(data);
    } catch (err) {
      setError('Failed to load credits');
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await creditService.getTransactions(page, 20, filterType || undefined);
      setTransactions(data.data);
      setTotalPages(data.pagination.total_pages);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}$${amount.toFixed(4)}`;
  };

  const getTypeBadgeVariant = (type: string): 'success' | 'danger' | 'info' | 'default' => {
    switch (type) {
      case 'grant':
        return 'success';
      case 'deduction':
        return 'danger';
      case 'refund':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your credit balance and view transaction history.</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Balance Card */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-gray-500 mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-gray-900">
              ${credits?.balance.toFixed(4) || '0.0000'}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Purchased</p>
            <p className="text-2xl font-semibold text-emerald-600">
              +${credits?.total_purchased.toFixed(4) || '0.0000'}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Consumed</p>
            <p className="text-2xl font-semibold text-red-600">
              -${credits?.total_consumed.toFixed(4) || '0.0000'}
            </p>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option value="grant">Grants</option>
            <option value="deduction">Deductions</option>
            <option value="refund">Refunds</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No transactions yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance After</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getTypeBadgeVariant(tx.type)}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tx.description || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                        tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        ${tx.balance_after.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </UserLayout>
  );
}

