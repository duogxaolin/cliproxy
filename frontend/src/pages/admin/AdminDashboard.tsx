import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminService, PlatformStats, UsageTrend, UserAnalytics, ModelAnalytics } from '../../services/adminService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [trends, setTrends] = useState<UsageTrend[]>([]);
  const [topUsers, setTopUsers] = useState<UserAnalytics[]>([]);
  const [topModels, setTopModels] = useState<ModelAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const [statsData, analyticsData, usersData, modelsData] = await Promise.all([
          adminService.getStats(),
          adminService.getAnalytics(startDate, endDate, 'day'),
          adminService.getAnalyticsByUser(startDate, endDate, 5),
          adminService.getAnalyticsByModel(startDate, endDate),
        ]);
        
        setStats(statsData);
        setTrends(analyticsData.trends);
        setTopUsers(usersData);
        setTopModels(modelsData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCost = (cost: number) => `$${cost.toFixed(2)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <div className="flex space-x-4">
            <Link to="/admin/users" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              Manage Users
            </Link>
            <Link to="/admin/models" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
              Manage Models
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatNumber(stats?.total_users || 0)}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Active: {formatNumber(stats?.active_users || 0)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatNumber(stats?.total_requests || 0)}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Last 30 days: {formatNumber(stats?.requests_last_30_days || 0)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : formatCost(stats?.total_credits_consumed || 0)}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Credits granted: {formatCost(stats?.total_credits_granted || 0)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Profit Margin</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {loading ? '...' : `${stats?.total_credits_granted ? ((stats.total_credits_consumed / stats.total_credits_granted) * 100).toFixed(1) : 0}%`}
            </dd>
            <p className="text-xs text-gray-400 mt-1">Consumed / Granted</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Trends (Last 30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#3B82F6" name="Requests" />
                  <Line type="monotone" dataKey="cost" stroke="#10B981" name="Cost ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Models */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Models by Usage</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topModels.slice(0, 5)}>
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

        {/* Top Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Top Users by Consumption</h3>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">View all →</Link>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No data</td></tr>
              ) : (
                topUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.requests)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.tokens)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCost(user.cost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-500">View and manage users, grant credits, suspend accounts</p>
          </Link>
          <Link to="/admin/models" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Model Management</h3>
            <p className="text-sm text-gray-500">Configure shadow models, pricing, and provider settings</p>
          </Link>
          <Link to="/admin/cliproxy" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">CLI Proxy</h3>
            <p className="text-sm text-gray-500">Access the CLI Proxy control panel</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

