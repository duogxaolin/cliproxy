import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ApiKeysPage from './pages/ApiKeysPage';
import CreditsPage from './pages/CreditsPage';
import UsagePage from './pages/UsagePage';
import ModelsPage from './pages/ModelsPage';
import GuidesPage from './pages/GuidesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AdminModelsPage from './pages/admin/ModelsPage';
import CliProxyPage from './pages/admin/CliProxyPage';
import SettingsPage from './pages/admin/SettingsPage';
import BlogPage from './pages/admin/BlogPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/guides/:slug" element={<GuidesPage />} />

        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/credits"
          element={
            <ProtectedRoute>
              <CreditsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usage"
          element={
            <ProtectedRoute>
              <UsagePage />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/models"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminModelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cliproxy"
          element={
            <ProtectedRoute requiredRole="admin">
              <CliProxyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute requiredRole="admin">
              <BlogPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;