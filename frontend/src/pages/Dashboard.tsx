import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserLayout } from '../components/layout';
import { Card, Button, Spinner } from '../components/ui';
import { creditService } from '../services/creditService';
import { apiKeyService } from '../services/apiKeyService';
import { usageService } from '../services/usageService';

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [apiKeyCount, setApiKeyCount] = useState<number>(0);
  const [totalRequests, setTotalRequests] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [credits, apiKeys, usage] = await Promise.all([
          creditService.getCredits(),
          apiKeyService.getApiKeys(),
          usageService.getUsageSummary(),
        ]);
        setBalance(credits.balance);
        setApiKeyCount(apiKeys.length);
        setTotalRequests(usage.total_requests);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const StatCard = ({
    icon,
    label,
    value,
    link,
    linkText,
    iconBg = 'bg-primary-100',
    iconColor = 'text-primary-600'
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    link: string;
    linkText: string;
    iconBg?: string;
    iconColor?: string;
  }) => (
    <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? <Spinner size="sm" /> : value}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <Link to={link} className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center group">
          {linkText}
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </Card>
  );

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's an overview of your account.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Credit Balance"
          value={`$${balance.toFixed(4)}`}
          link="/credits"
          linkText="View details"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
          label="Active API Keys"
          value={apiKeyCount}
          link="/api-keys"
          linkText="Manage keys"
          iconBg="bg-primary-100"
          iconColor="text-primary-600"
        />

        <StatCard
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="Total Requests"
          value={totalRequests.toLocaleString()}
          link="/usage"
          linkText="View analytics"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/api-keys">
            <Button
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create API Key
            </Button>
          </Link>
          <Link to="/usage">
            <Button variant="outline">View Usage</Button>
          </Link>
          <Link to="/credits">
            <Button variant="outline">View Credits</Button>
          </Link>
        </div>
      </div>
    </UserLayout>
  );
}

