import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout';
import { Card, Button, Badge, Spinner } from '../../components/ui';

// Auto-detect CLI Proxy URL based on current window location
const getDefaultCliProxyUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4569`;
  }
  return 'http://localhost:4569';
};

// CLI Proxy URL - from localStorage (admin setting), environment variable, or auto-detect
const getCliProxyUrl = (): string => {
  const savedUrl = localStorage.getItem('cli_proxy_url');
  if (savedUrl) {
    return savedUrl;
  }
  const envUrl = import.meta.env.VITE_CLI_PROXY_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return getDefaultCliProxyUrl();
};

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  database: string;
  service: string;
}

interface ProxyInfo {
  service: string;
  version: string;
  endpoints: {
    anthropic: string;
    openai: string;
    health: string;
  };
}

export default function CliProxyPage() {
  const cliProxyUrl = getCliProxyUrl();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, infoRes] = await Promise.all([
        fetch(`${cliProxyUrl}/health`),
        fetch(`${cliProxyUrl}/`)
      ]);

      if (healthRes.ok) {
        setHealth(await healthRes.json());
      }
      if (infoRes.ok) {
        setProxyInfo(await infoRes.json());
      }
    } catch (err) {
      setError('Cannot connect to CLI Proxy. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [cliProxyUrl]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const testEndpoint = async (endpoint: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${cliProxyUrl}${endpoint}`, {
        method: endpoint === '/health' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : 'Request failed'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CLI Proxy Control Panel</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor and manage CLI proxy connections.</p>
          </div>
          <Button onClick={fetchStatus} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Status Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge color={health.status === 'ok' ? 'green' : 'red'}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <Badge color={health.database === 'connected' ? 'green' : 'red'}>
                  {health.database}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-mono text-sm">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-mono text-sm">{health.service}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </Card>

        {/* Connection Info Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Info</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">CLI Proxy URL</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-lg font-mono text-sm break-all">
                {cliProxyUrl}
              </div>
            </div>
            {proxyInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Version</span>
                  <Badge color="blue">{proxyInfo.version}</Badge>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => testEndpoint('/health')}
              disabled={testing}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Health Endpoint
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => window.open(`${cliProxyUrl}/health`, '_blank')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Health in New Tab
            </Button>
          </div>
        </Card>
      </div>

      {/* API Endpoints */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Endpoint</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Full URL</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 px-4 font-mono text-sm">/v1/messages</td>
                <td className="py-3 px-4"><Badge color="green">POST</Badge></td>
                <td className="py-3 px-4 text-sm text-gray-600">Anthropic Claude API</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{cliProxyUrl}/v1/messages</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-sm">/v1/chat/completions</td>
                <td className="py-3 px-4"><Badge color="green">POST</Badge></td>
                <td className="py-3 px-4 text-sm text-gray-600">OpenAI Compatible API</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{cliProxyUrl}/v1/chat/completions</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-sm">/health</td>
                <td className="py-3 px-4"><Badge color="blue">GET</Badge></td>
                <td className="py-3 px-4 text-sm text-gray-600">Health Check</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{cliProxyUrl}/health</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Result</h3>
            <Button variant="secondary" size="sm" onClick={() => setTestResult(null)}>
              Clear
            </Button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
            {testResult}
          </pre>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Instructions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Anthropic Claude API</h4>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
{`curl -X POST ${cliProxyUrl}/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-3-opus",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">OpenAI Compatible API</h4>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
{`curl -X POST ${cliProxyUrl}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}

