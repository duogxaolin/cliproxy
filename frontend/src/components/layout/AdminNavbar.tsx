import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import Logo from '../Logo';
import LanguageSwitcher from '../LanguageSwitcher';

export default function AdminNavbar() {
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
    <nav className="bg-gray-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo to="/admin" className="[&_span]:text-white" />
            <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">Admin</span>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.dashboard}
              </Link>
              <Link to="/admin/users" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.users}
              </Link>
              <Link to="/admin/models" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin/models') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.models}
              </Link>
              <Link to="/admin/cliproxy" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin/cliproxy') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.cliProxy}
              </Link>
              <Link to="/admin/blog" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin/blog') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.blog}
              </Link>
              <Link to="/admin/settings" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/admin/settings') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                {t.nav.settings}
              </Link>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-white">{user?.username || 'Admin'}</span>
                  <span className="text-xs text-primary-400 font-medium">Admin</span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserDropdownOpen(false)}>
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t.nav.userDashboard}
                    </Link>
                  </div>

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
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
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
        <div className="md:hidden border-t border-gray-800 bg-gray-900 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link to="/admin" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.dashboard}</Link>
            <Link to="/admin/users" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.users}</Link>
            <Link to="/admin/models" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin/models') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.models}</Link>
            <Link to="/admin/cliproxy" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin/cliproxy') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.cliProxy}</Link>
            <Link to="/admin/blog" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin/blog') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.blog}</Link>
            <Link to="/admin/settings" className={`block px-4 py-3 rounded-lg text-base font-medium ${isActive('/admin/settings') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.settings}</Link>

            <div className="border-t border-gray-700 my-2" />
            <Link to="/dashboard" className="block px-4 py-3 rounded-lg text-base font-medium text-primary-400 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
              ← {t.nav.userDashboard}
            </Link>

            <div className="border-t border-gray-700 my-2" />
            <div className="px-4 py-2"><LanguageSwitcher /></div>

            <div className="border-t border-gray-700 my-2" />
            <div className="px-4 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div>
                <p className="font-medium text-white">{user?.username || 'Admin'}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg font-medium transition-colors">
              {t.nav.signOut}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

