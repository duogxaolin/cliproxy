import Navbar from '../../components/Navbar';

export default function CliProxyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">CLI Proxy Control Panel</h2>
        
        <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="http://103.77.173.186:3000/cliproxy/control-panel"
            className="w-full h-full border-0"
            title="CLI Proxy Control Panel"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </main>
    </div>
  );
}

