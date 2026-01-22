import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface PublicModel {
  id: string;
  displayName: string;
  providerModel: string;
  pricingInput: number;
  pricingOutput: number;
  isActive: boolean;
}

export default function ModelsPage() {
  const [models, setModels] = useState<PublicModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL ||
          (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `${window.location.protocol}//${window.location.hostname}:4567`);
        const response = await fetch(`${baseUrl}/api/public/models`);
        const data = await response.json();
        setModels(data.data || []);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
    return `$${(numPrice || 0).toFixed(6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo to="/" />
            <div className="flex items-center space-x-4">
              <Link to="/guides" className="text-gray-600 hover:text-gray-900 text-sm font-medium">{t.nav.guides}</Link>
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {t.nav.dashboard}
                </Link>
              ) : (
                <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {t.nav.getStarted}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">{t.models.title}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {t.models.description}
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t.models.noModels}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div key={model.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.displayName}</h3>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    {t.models.active}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{t.models.inputPrice}</span>
                    <span className="text-sm font-medium text-emerald-600">{formatPrice(model.pricingInput)}{t.models.perToken}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{t.models.outputPrice}</span>
                    <span className="text-sm font-medium text-blue-600">{formatPrice(model.pricingOutput)}{t.models.perToken}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.models.howToUse}</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. {t.models.getApiKey}</h3>
                <p className="text-gray-600">
                  {isAuthenticated ? (
                    <Link to="/api-keys" className="text-primary-600 hover:underline">{t.models.goToApiKeys}</Link>
                  ) : (
                    <><Link to="/register" className="text-primary-600 hover:underline">{t.models.createAccountFirst}</Link> {t.models.andGenerateKey}</>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. {t.models.makeApiRequests}</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
{`curl -X POST ${window.location.protocol}//${window.location.hostname}:4569/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

