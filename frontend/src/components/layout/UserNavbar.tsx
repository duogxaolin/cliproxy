import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import Logo from '../Logo';
import LanguageSwitcher from '../LanguageSwitcher';

export default function UserNavbar() {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const mobileLinkClass = (path: string) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-all ${
      isActive(path)
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50'
    }`;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo to="/dashboard" />
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link to="/dashboard" className={linkClass('/dashboard')}>{t.nav.dashboard}</Link>
              <Link to="/api-keys" className={linkClass('/api-keys')}>{t.nav.apiKeys}</Link>
              <Link to="/credits" className={linkClass('/credits')}>{t.nav.credits}</Link>
              <Link to="/usage" className={linkClass('/usage')}>{t.nav.usage}</Link>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-gray-900">{user?.username || 'User'}</span>
                  {user?.role === 'admin' ? (
                    <span className="text-xs text-primary-600 font-medium">Admin</span>
                  ) : (
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">Admin</span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link to="/models" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {t.nav.modelsAndPricing}
                    </Link>
                    <Link to="/guides" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {t.nav.guides}
                    </Link>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="border-t border-gray-100 py-1">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.nav.adminPanel}</div>
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {t.nav.dashboard}
                      </Link>
                      <Link to="/admin/users" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {t.nav.users}
                      </Link>
                      <Link to="/admin/models" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {t.nav.models}
                      </Link>
                      <Link to="/admin/cliproxy" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t.nav.cliProxy}
                      </Link>
                      <Link to="/admin/blog" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        {t.nav.blog}
                      </Link>
                      <Link to="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.nav.settings}
                      </Link>
                      <Link to="/admin/language" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Language
                      </Link>
                    </div>
                  )}

                  <div className="border-t border-gray-100 py-1">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t.nav.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link to="/dashboard" className={mobileLinkClass('/dashboard')} onClick={() => setMobileMenuOpen(false)}>{t.nav.dashboard}</Link>
            <Link to="/api-keys" className={mobileLinkClass('/api-keys')} onClick={() => setMobileMenuOpen(false)}>{t.nav.apiKeys}</Link>
            <Link to="/credits" className={mobileLinkClass('/credits')} onClick={() => setMobileMenuOpen(false)}>{t.nav.credits}</Link>
            <Link to="/usage" className={mobileLinkClass('/usage')} onClick={() => setMobileMenuOpen(false)}>{t.nav.usage}</Link>

            <div className="border-t border-gray-100 my-2" />
            <Link to="/models" className={mobileLinkClass('/models')} onClick={() => setMobileMenuOpen(false)}>{t.nav.modelsAndPricing}</Link>
            <Link to="/guides" className={mobileLinkClass('/guides')} onClick={() => setMobileMenuOpen(false)}>{t.nav.guides}</Link>

            {user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.nav.adminPanel}</div>
                <Link to="/admin" className={mobileLinkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>{t.nav.dashboard}</Link>
                <Link to="/admin/users" className={mobileLinkClass('/admin/users')} onClick={() => setMobileMenuOpen(false)}>{t.nav.users}</Link>
                <Link to="/admin/models" className={mobileLinkClass('/admin/models')} onClick={() => setMobileMenuOpen(false)}>{t.nav.models}</Link>
                <Link to="/admin/cliproxy" className={mobileLinkClass('/admin/cliproxy')} onClick={() => setMobileMenuOpen(false)}>{t.nav.cliProxy}</Link>
                <Link to="/admin/blog" className={mobileLinkClass('/admin/blog')} onClick={() => setMobileMenuOpen(false)}>{t.nav.blog}</Link>
                <Link to="/admin/settings" className={mobileLinkClass('/admin/settings')} onClick={() => setMobileMenuOpen(false)}>{t.nav.settings}</Link>
                <Link to="/admin/language" className={mobileLinkClass('/admin/language')} onClick={() => setMobileMenuOpen(false)}>Language</Link>
              </>
            )}

            <div className="border-t border-gray-100 my-2" />
            <div className="px-4 py-2"><LanguageSwitcher /></div>

            <div className="border-t border-gray-100 my-2" />
            <div className="px-4 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.username || 'User'}</p>
                {user?.role === 'admin' ? (
                  <p className="text-sm text-primary-600 font-medium">Admin</p>
                ) : (
                  <p className="text-sm text-gray-500">{user?.email}</p>
                )}
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
              {t.nav.signOut}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

