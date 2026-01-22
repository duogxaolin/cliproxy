import { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Input, Modal, Badge, Spinner } from '../../components/ui';
import { adminService, SystemSetting, CreateSettingInput } from '../../services/adminService';
import { setApiBaseUrl, getApiBaseUrl, getDefaultUrls } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, Cog6ToothIcon, ServerIcon, GlobeAltIcon, LinkIcon } from '@heroicons/react/24/outline';

type Category = 'environment' | 'connection' | 'system';
type DataType = 'string' | 'number' | 'boolean' | 'json';

// Auto-detect CLI Proxy URL based on current window location
const getDefaultCliProxyUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4569`;
  }
  return 'http://localhost:4569';
};

// Get current CLI Proxy URL (from localStorage or auto-detect)
const getCurrentCliProxyUrl = (): string => {
  const saved = localStorage.getItem('cli_proxy_url');
  if (saved) return saved;
  return import.meta.env.VITE_CLI_PROXY_URL || getDefaultCliProxyUrl();
};

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'environment', label: 'Environment Variables', icon: <GlobeAltIcon className="w-5 h-5" />, description: 'Global environment variables and feature flags' },
  { value: 'connection', label: 'Connection Settings', icon: <ServerIcon className="w-5 h-5" />, description: 'External service URLs and connection configs' },
  { value: 'system', label: 'System Configuration', icon: <Cog6ToothIcon className="w-5 h-5" />, description: 'Rate limits, logging, and system behavior' },
];

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'json', label: 'JSON' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('environment');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<SystemSetting | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Special URL settings state (stored in localStorage)
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl());
  const [cliProxyUrl, setCliProxyUrlState] = useState(getCurrentCliProxyUrl());
  const [savingUrls, setSavingUrls] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateSettingInput>({
    key: '',
    value: '',
    category: 'environment',
    dataType: 'string',
    isSecret: false,
    description: '',
  });

  useEffect(() => {
    loadSettings();
  }, [activeCategory]);

  // Save URL settings to localStorage
  const handleSaveUrlSettings = () => {
    setSavingUrls(true);
    try {
      // Save API Base URL
      if (apiBaseUrl) {
        setApiBaseUrl(apiBaseUrl);
      }
      // Save CLI Proxy URL
      if (cliProxyUrl) {
        localStorage.setItem('cli_proxy_url', cliProxyUrl);
      }
      setSuccessMessage('URL settings saved successfully! API URL changes take effect immediately.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save URL settings');
    } finally {
      setSavingUrls(false);
    }
  };

  // Reset URL settings to defaults (auto-detect from current hostname)
  const handleResetUrlSettings = () => {
    const defaults = getDefaultUrls();

    setApiBaseUrlState(defaults.apiUrl);
    setCliProxyUrlState(defaults.cliProxyUrl);

    localStorage.removeItem('api_base_url');
    localStorage.removeItem('cli_proxy_url');

    // Reset axios baseURL
    setApiBaseUrl(defaults.apiUrl);

    setSuccessMessage('URL settings reset to auto-detected defaults based on current hostname');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getSettings(activeCategory);
      setSettings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (setting?: SystemSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        key: setting.key,
        value: setting.isSecret ? '' : setting.value,
        category: setting.category,
        dataType: setting.dataType as DataType,
        isSecret: setting.isSecret,
        description: setting.description || '',
      });
    } else {
      setEditingSetting(null);
      setFormData({
        key: '',
        value: '',
        category: activeCategory,
        dataType: 'string',
        isSecret: false,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSetting(null);
    setFormData({ key: '', value: '', category: 'environment', dataType: 'string', isSecret: false, description: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingSetting) {
        await adminService.updateSetting(editingSetting.key, {
          value: formData.value || undefined,
          category: formData.category,
          dataType: formData.dataType,
          isSecret: formData.isSecret,
          description: formData.description,
        });
      } else {
        await adminService.createSetting(formData);
      }

      handleCloseModal();
      loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSetting) return;
    try {
      setSaving(true);
      await adminService.deleteSetting(deletingSetting.key);
      setIsDeleteModalOpen(false);
      setDeletingSetting(null);
      loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete setting');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'environment': return 'blue';
      case 'connection': return 'green';
      case 'system': return 'purple';
      default: return 'gray';
    }
  };

  const filteredSettings = settings.filter(s => s.category === activeCategory);

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage global environment variables, connection settings, and system configuration.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-2 text-green-500 hover:text-green-700">×</button>
        </div>
      )}

      {/* URL Settings Card - Always visible at top */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">URL Configuration</h2>
          <Badge color="blue" size="sm">Browser Storage</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          These settings are stored in your browser and take effect immediately. Use this to connect to different backend servers or CLI proxy instances.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Base URL
              <span className="ml-2 text-xs text-gray-400">(Backend server)</span>
            </label>
            <input
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrlState(e.target.value)}
              placeholder="http://localhost:4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">Example: http://api.yourdomain.com or http://103.77.173.186:4567</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CLI Proxy URL
              <span className="ml-2 text-xs text-gray-400">(Control panel iframe)</span>
            </label>
            <input
              type="url"
              value={cliProxyUrl}
              onChange={(e) => setCliProxyUrlState(e.target.value)}
              placeholder="http://localhost:4569"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">Example: http://cliproxy.yourdomain.com or http://103.77.173.186:4569</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSaveUrlSettings} disabled={savingUrls}>
            {savingUrls ? <Spinner size="sm" /> : 'Save URL Settings'}
          </Button>
          <Button variant="secondary" onClick={handleResetUrlSettings}>
            Reset to Defaults
          </Button>
          <span className="text-xs text-gray-400 ml-2">
            Current API: <code className="bg-gray-100 px-1 rounded">{getApiBaseUrl()}</code>
          </span>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === cat.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Category Description & Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {CATEGORIES.find(c => c.value === activeCategory)?.description}
        </p>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Setting
        </Button>
      </div>

      {/* Settings Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="text-center py-12">
            <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No settings</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new setting.</p>
            <div className="mt-6">
              <Button onClick={() => handleOpenModal()}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Setting
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-900">{setting.key}</span>
                        {setting.isSecret && <Badge color="yellow" size="sm">Secret</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-600 max-w-xs truncate">
                          {setting.isSecret && !showSecrets[setting.key] ? '••••••••' : setting.value}
                        </span>
                        {setting.isSecret && (
                          <button onClick={() => toggleShowSecret(setting.key)} className="text-gray-400 hover:text-gray-600">
                            {showSecrets[setting.key] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color={getCategoryBadgeColor(setting.dataType)} size="sm">{setting.dataType}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 max-w-xs truncate block">{setting.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleOpenModal(setting)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setDeletingSetting(setting); setIsDeleteModalOpen(true); }} className="text-red-600 hover:text-red-800">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSetting ? 'Edit Setting' : 'Add Setting'}>
        <div className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="e.g., API_BASE_URL"
            disabled={!!editingSetting}
          />
          <Input
            label={editingSetting?.isSecret ? 'New Value (leave empty to keep current)' : 'Value'}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter value"
            type={formData.isSecret ? 'password' : 'text'}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
              <select
                value={formData.dataType}
                onChange={(e) => setFormData({ ...formData, dataType: e.target.value as DataType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DATA_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Description (optional)"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this setting"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSecret"
              checked={formData.isSecret}
              onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isSecret" className="text-sm text-gray-700">This is a secret value (will be encrypted)</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.key || (!editingSetting && !formData.value)}>
              {saving ? <Spinner size="sm" /> : (editingSetting ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Setting">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the setting <strong className="font-mono">{deletingSetting?.key}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </div>
      </Modal>
    </UserLayout>
  );
}

