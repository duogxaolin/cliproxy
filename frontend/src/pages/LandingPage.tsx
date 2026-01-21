import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">API Marketplace</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/models" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Models & Pricing
              </Link>
              <Link to="/guides" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Guides
              </Link>
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.username}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse" />
              Unified API Access Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              API Access
              <span className="block mt-2 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Access powerful AI models through a unified API endpoint.
              Pay only for what you use with our transparent credit-based billing system.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl text-base font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Start Using APIs
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-xl text-base font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                View Documentation
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-500 mt-1">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">&lt;50ms</div>
                <div className="text-sm text-gray-500 mt-1">Latency</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10+</div>
                <div className="text-sm text-gray-500 mt-1">AI Models</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to scale
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A complete platform for managing API access, tracking usage, and controlling costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">API Proxy</h3>
              <p className="text-gray-600 leading-relaxed">
                Unified endpoint for multiple AI providers. Low latency proxy with automatic failover and load balancing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Credit System</h3>
              <p className="text-gray-600 leading-relaxed">
                Pay-as-you-go pricing with transparent billing. Track spending in real-time with detailed transaction history.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive dashboards with usage metrics. Monitor requests, tokens, and costs across all your API keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Enterprise-grade security
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your data and API keys are protected with industry-leading security measures.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Encrypted API Keys</h4>
                    <p className="text-gray-600 mt-1">All API keys are hashed with SHA-256 and never stored in plain text.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Rate Limiting</h4>
                    <p className="text-gray-600 mt-1">Built-in protection against abuse with configurable rate limits per key.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Granular Permissions</h4>
                    <p className="text-gray-600 mt-1">Control which models each API key can access with fine-grained permissions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-500">API Key Settings</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Key Name</div>
                    <div className="font-medium text-gray-900">Production API Key</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Allowed Models</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md">claude-3-opus</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md">gpt-4</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Quota Used</div>
                      <div className="font-medium text-gray-900">2,450 / 10,000</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Expires</div>
                      <div className="font-medium text-gray-900">Dec 31, 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02aC00djJoNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                Continue using our powerful AI models through your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all shadow-lg"
                >
                  Go to Dashboard
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/api-keys"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 text-white rounded-xl text-base font-semibold border border-white/20 hover:bg-primary-500/30 transition-all"
                >
                  Manage API Keys
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                Create your account today and start accessing powerful AI models through our unified API.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 text-white rounded-xl text-base font-semibold border border-white/20 hover:bg-primary-500/30 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">API Marketplace</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 API Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

