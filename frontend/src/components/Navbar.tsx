import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">API Marketplace</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/api-keys" className={linkClass('/api-keys')}>
                API Keys
              </Link>
              <Link to="/credits" className={linkClass('/credits')}>
                Credits
              </Link>
              <Link to="/usage" className={linkClass('/usage')}>
                Usage
              </Link>
              {user?.role === 'admin' && (
                <>
                  <div className="border-l border-gray-200 mx-2" />
                  <Link to="/admin" className={linkClass('/admin')}>
                    Admin
                  </Link>
                  <Link to="/admin/users" className={linkClass('/admin/users')}>
                    Users
                  </Link>
                  <Link to="/admin/models" className={linkClass('/admin/models')}>
                    Models
                  </Link>
                  <Link to="/admin/cliproxy" className={linkClass('/admin/cliproxy')}>
                    CLI Proxy
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user?.username || 'User'}
                </span>
                {user?.role === 'admin' && (
                  <span className="text-xs text-primary-600 font-medium">Admin</span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
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
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link to="/dashboard" className={mobileLinkClass('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/api-keys" className={mobileLinkClass('/api-keys')} onClick={() => setMobileMenuOpen(false)}>
              API Keys
            </Link>
            <Link to="/credits" className={mobileLinkClass('/credits')} onClick={() => setMobileMenuOpen(false)}>
              Credits
            </Link>
            <Link to="/usage" className={mobileLinkClass('/usage')} onClick={() => setMobileMenuOpen(false)}>
              Usage
            </Link>
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
                <Link to="/admin" className={mobileLinkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/users" className={mobileLinkClass('/admin/users')} onClick={() => setMobileMenuOpen(false)}>
                  Users
                </Link>
                <Link to="/admin/models" className={mobileLinkClass('/admin/models')} onClick={() => setMobileMenuOpen(false)}>
                  Models
                </Link>
                <Link to="/admin/cliproxy" className={mobileLinkClass('/admin/cliproxy')} onClick={() => setMobileMenuOpen(false)}>
                  CLI Proxy
                </Link>
              </>
            )}
            <div className="border-t border-gray-100 my-2" />
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.username || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

