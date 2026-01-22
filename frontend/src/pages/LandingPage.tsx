import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo to="/" />

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/models" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                {t.nav.modelsAndPricing}
              </Link>
              <Link to="/guides" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                {t.nav.guides}
              </Link>
            </div>

            {/* Auth Section - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {t.nav.dashboard}
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
                      {t.nav.signOut}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    {t.nav.getStarted}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/models"
                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.modelsAndPricing}
              </Link>
              <Link
                to="/guides"
                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.guides}
              </Link>

              <div className="border-t border-gray-100 my-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-primary-600 hover:bg-primary-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.dashboard}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    {t.nav.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.getStarted}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent" />

        {/* Decorative elements - hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="hidden sm:block absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 rounded-full text-primary-700 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary-500 rounded-full mr-2 animate-pulse" />
              {t.landing.tagline}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
              {t.landing.heroTitle}
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                {t.landing.heroTitleHighlight}
              </span>
            </h1>

            <p className="mt-4 sm:mt-8 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              {t.landing.heroDescription}
            </p>

            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                {t.landing.startUsing}
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/guides"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-xl text-sm sm:text-base font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                {t.landing.viewDocs}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto px-2">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{t.landing.uptime}</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-gray-900">&lt;50ms</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{t.landing.latency}</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-gray-900">10+</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{t.landing.aiModels}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {t.landing.everythingYouNeed}
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              {t.landing.platformDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Feature 1 */}
            <div className="group p-5 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{t.landing.apiProxy}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.landing.apiProxyDesc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-5 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{t.landing.creditSystem}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.landing.creditSystemDesc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-5 sm:p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{t.landing.usageAnalytics}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t.landing.usageAnalyticsDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-12 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t.landing.enterpriseSecurity}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {t.landing.securityDesc}
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">{t.landing.encryptedKeys}</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">{t.landing.encryptedKeysDesc}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">{t.landing.rateLimiting}</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">{t.landing.rateLimitingDesc}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900">{t.landing.granularPermissions}</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">{t.landing.granularPermissionsDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-5 sm:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">{t.landing.apiKeySettings}</span>
                  <span className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{t.models.active}</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">{t.landing.keyName}</div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">{t.landing.productionApiKey}</div>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">{t.landing.allowedModels}</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      <span className="px-2 py-0.5 sm:py-1 bg-primary-100 text-primary-700 text-xs rounded-md">claude-3-opus</span>
                      <span className="px-2 py-0.5 sm:py-1 bg-primary-100 text-primary-700 text-xs rounded-md">gpt-4</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">{t.landing.quotaUsed}</div>
                      <div className="text-sm sm:text-base font-medium text-gray-900">2,450 / 10,000</div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">{t.landing.expires}</div>
                      <div className="text-sm sm:text-base font-medium text-gray-900">Dec 31, 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02aC00djJoNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                {t.landing.welcomeBack}, {user?.username}!
              </h2>
              <p className="text-base sm:text-xl text-primary-100 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
                {t.landing.continueUsing}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition-all shadow-lg"
                >
                  {t.landing.goToDashboard}
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/api-keys"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-500/20 text-white rounded-xl text-sm sm:text-base font-semibold border border-white/20 hover:bg-primary-500/30 transition-all"
                >
                  {t.landing.manageApiKeys}
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                {t.landing.readyToStart}
              </h2>
              <p className="text-base sm:text-xl text-primary-100 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
                {t.landing.createAccount}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-50 transition-all shadow-lg"
                >
                  {t.landing.createFreeAccount}
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-500/20 text-white rounded-xl text-sm sm:text-base font-semibold border border-white/20 hover:bg-primary-500/30 transition-all"
                >
                  {t.nav.signIn}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo to="/" className="[&_span]:text-white" />
            <p className="text-gray-400 text-xs sm:text-sm text-center">
              © 2026 {t.brandName}. {t.landing.allRightsReserved}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

