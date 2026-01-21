import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';

// CLI Proxy URL - from localStorage (admin setting) or environment variable
const getCliProxyUrl = (): string => {
  const savedUrl = localStorage.getItem('cli_proxy_url');
  if (savedUrl) {
    return savedUrl;
  }
  return import.meta.env.VITE_CLI_PROXY_URL || 'http://localhost:4569';
};

export default function CliProxyPage() {
  const cliProxyUrl = getCliProxyUrl();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CLI Proxy Control Panel</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and monitor CLI proxy connections.</p>
      </div>

      <Card padding="none" className="overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <iframe
          src={cliProxyUrl}
          className="w-full h-full border-0"
          title="CLI Proxy Control Panel"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </Card>
    </Layout>
  );
}

