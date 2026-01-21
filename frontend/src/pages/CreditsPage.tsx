import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grant':
        return 'bg-green-100 text-green-800';
      case 'deduction':
        return 'bg-red-100 text-red-800';
      case 'refund':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Credits</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ${credits?.balance.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Purchased</p>
              <p className="text-2xl font-semibold text-green-600">
                ${credits?.total_purchased.toFixed(4) || '0.0000'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Consumed</p>
              <p className="text-2xl font-semibold text-red-600">
                ${credits?.total_consumed.toFixed(4) || '0.0000'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="">All Types</option>
              <option value="grant">Grants</option>
              <option value="deduction">Deductions</option>
              <option value="refund">Refunds</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions yet.</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Balance After
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tx.description || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

