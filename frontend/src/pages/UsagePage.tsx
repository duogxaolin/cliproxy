import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { usageService, UsageSummary, UsageByTimeEntry, UsageByModelEntry, UsageByKeyEntry, RequestLog } from '../services/usageService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

type DateRange = '7d' | '30d' | 'custom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function UsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [usageByTime, setUsageByTime] = useState<UsageByTimeEntry[]>([]);
  const [usageByModel, setUsageByModel] = useState<UsageByModelEntry[]>([]);
  const [usageByKey, setUsageByKey] = useState<UsageByKeyEntry[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getDateRange = () => {
    const end = new Date();
    let start: Date;
    
    if (dateRange === '7d') {
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30d') {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      start = customStart ? new Date(customStart) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (customEnd) {
        return { start: start.toISOString(), end: new Date(customEnd).toISOString() };
      }
    }
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [summaryData, timeData, modelData, keyData, logsData] = await Promise.all([
        usageService.getUsageSummary(),
        usageService.getUsageByTime(start, end, 'day'),
        usageService.getUsageByModel(start, end),
        usageService.getUsageByKey(start, end),
        usageService.getRequestLogs({ start_date: start, end_date: end }, logsPage, 10),
      ]);
      setSummary(summaryData);
      setUsageByTime(timeData);
      setUsageByModel(modelData);
      setUsageByKey(keyData);
      setLogs(logsData.data);
      setLogsTotalPages(logsData.pagination.total_pages);
    } catch (err) {
      console.error('Failed to load usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, customStart, customEnd, logsPage]);

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom range</option>
            </select>
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatNumber(summary?.total_requests || 0)}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Today: {formatNumber(summary?.requests_today || 0)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatNumber((summary?.total_tokens_input || 0) + (summary?.total_tokens_output || 0))}
            </dd>
            <p className="text-xs text-gray-400 mt-1">
              In: {formatNumber(summary?.total_tokens_input || 0)} / Out: {formatNumber(summary?.total_tokens_output || 0)}
            </p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatCost(summary?.total_cost || 0)}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Today: {formatCost(summary?.cost_today || 0)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Avg Cost/Request</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatCost(summary?.total_requests ? (summary.total_cost / summary.total_requests) : 0)}
            </dd>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Over Time */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#3B82F6" name="Requests" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Usage by Model */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage by Model</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageByModel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model_name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost by API Key (Pie Chart) */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost by API Key</h3>
          <div className="h-64">
            {usageByKey.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageByKey.map(item => ({ name: item.api_key_name, value: item.cost }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${formatCost(value)}`}
                  >
                    {usageByKey.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCost(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Request Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Request Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No requests found</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.model_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.api_key_name} ({log.key_prefix}...)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(log.tokens_input)} / {formatNumber(log.tokens_output)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCost(log.cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.status_code === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.duration_ms}ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {logsTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                disabled={logsPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {logsPage} of {logsTotalPages}</span>
              <button
                onClick={() => setLogsPage(p => Math.min(logsTotalPages, p + 1))}
                disabled={logsPage === logsTotalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

