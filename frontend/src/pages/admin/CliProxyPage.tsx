import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';

// CLI Proxy URL - configurable via environment variable
const CLI_PROXY_URL = import.meta.env.VITE_CLI_PROXY_URL || 'http://103.77.173.186:3000/cliproxy/control-panel';

export default function CliProxyPage() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CLI Proxy Control Panel</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and monitor CLI proxy connections.</p>
      </div>

      <Card padding="none" className="overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <iframe
          src={CLI_PROXY_URL}
          className="w-full h-full border-0"
          title="CLI Proxy Control Panel"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </Card>
    </Layout>
  );
}

