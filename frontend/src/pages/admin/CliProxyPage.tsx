import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';

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
  // Use env variable if set and not localhost, otherwise auto-detect
  const envUrl = import.meta.env.VITE_CLI_PROXY_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return getDefaultCliProxyUrl();
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

