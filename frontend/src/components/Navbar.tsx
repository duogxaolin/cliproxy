import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path)
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">API Marketplace</h1>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/api-keys" className={linkClass('/api-keys')}>
                API Keys
              </Link>
              <Link to="/credits" className={linkClass('/credits')}>
                Credits
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
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.username || 'User'}
              {user?.role === 'admin' && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

