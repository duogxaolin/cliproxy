import { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Input, Modal, Badge, Spinner } from '../../components/ui';
import { adminService, SystemSetting, CreateSettingInput } from '../../services/adminService';
import { setApiBaseUrl, getApiBaseUrl, getDefaultUrls } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, Cog6ToothIcon, ServerIcon, GlobeAltIcon, LinkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

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

  // Upload storage settings
  const [uploadStorageType, setUploadStorageType] = useState<'local' | 'r2'>('local');
  const [r2AccountId, setR2AccountId] = useState('');
  const [r2AccessKeyId, setR2AccessKeyId] = useState('');
  const [r2SecretAccessKey, setR2SecretAccessKey] = useState('');
  const [r2BucketName, setR2BucketName] = useState('');
  const [r2PublicUrl, setR2PublicUrl] = useState('');
  const [savingUploadSettings, setSavingUploadSettings] = useState(false);
  const [loadingUploadSettings, setLoadingUploadSettings] = useState(true);

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

  // Load upload storage settings on mount
  useEffect(() => {
    loadUploadSettings();
  }, []);

  const loadUploadSettings = async () => {
    setLoadingUploadSettings(true);
    try {
      const response = await adminService.getSettings('system');
      const settingsMap: Record<string, string> = {};
      response.data.forEach((s: SystemSetting) => {
        settingsMap[s.key] = s.value;
      });

      setUploadStorageType((settingsMap['UPLOAD_STORAGE_TYPE'] as 'local' | 'r2') || 'local');
      setR2AccountId(settingsMap['R2_ACCOUNT_ID'] || '');
      setR2AccessKeyId(settingsMap['R2_ACCESS_KEY_ID'] || '');
      setR2BucketName(settingsMap['R2_BUCKET_NAME'] || '');
      setR2PublicUrl(settingsMap['R2_PUBLIC_URL'] || '');
      // Don't load secret - it's masked
    } catch (err) {
      console.error('Failed to load upload settings:', err);
    } finally {
      setLoadingUploadSettings(false);
    }
  };

  const handleSaveUploadSettings = async () => {
    setSavingUploadSettings(true);
    setError(null);
    try {
      const settingsToSave: CreateSettingInput[] = [
        { key: 'UPLOAD_STORAGE_TYPE', value: uploadStorageType, category: 'system', dataType: 'string', isSecret: false, description: 'Upload storage type: local or r2' },
      ];

      if (uploadStorageType === 'r2') {
        settingsToSave.push(
          { key: 'R2_ACCOUNT_ID', value: r2AccountId, category: 'system', dataType: 'string', isSecret: false, description: 'Cloudflare R2 Account ID' },
          { key: 'R2_ACCESS_KEY_ID', value: r2AccessKeyId, category: 'system', dataType: 'string', isSecret: false, description: 'Cloudflare R2 Access Key ID' },
          { key: 'R2_BUCKET_NAME', value: r2BucketName, category: 'system', dataType: 'string', isSecret: false, description: 'Cloudflare R2 Bucket Name' },
          { key: 'R2_PUBLIC_URL', value: r2PublicUrl, category: 'system', dataType: 'string', isSecret: false, description: 'Cloudflare R2 Public URL' },
        );
        if (r2SecretAccessKey) {
          settingsToSave.push(
            { key: 'R2_SECRET_ACCESS_KEY', value: r2SecretAccessKey, category: 'system', dataType: 'string', isSecret: true, description: 'Cloudflare R2 Secret Access Key' },
          );
        }
      }

      await adminService.bulkUpsertSettings(settingsToSave);
      setSuccessMessage('Upload settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadSettings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save upload settings');
    } finally {
      setSavingUploadSettings(false);
    }
  };

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

      {/* Upload Storage Settings Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CloudArrowUpIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Upload Storage</h2>
          <Badge color="purple" size="sm">Server Storage</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Configure where uploaded images are stored. Choose between local server storage or Cloudflare R2.
        </p>

        {loadingUploadSettings ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="storageType"
                    value="local"
                    checked={uploadStorageType === 'local'}
                    onChange={() => setUploadStorageType('local')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Local Server</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="storageType"
                    value="r2"
                    checked={uploadStorageType === 'r2'}
                    onChange={() => setUploadStorageType('r2')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cloudflare R2</span>
                </label>
              </div>
            </div>

            {uploadStorageType === 'r2' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                  <input
                    type="text"
                    value={r2AccountId}
                    onChange={(e) => setR2AccountId(e.target.value)}
                    placeholder="Your Cloudflare Account ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                  <input
                    type="text"
                    value={r2BucketName}
                    onChange={(e) => setR2BucketName(e.target.value)}
                    placeholder="your-bucket-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label>
                  <input
                    type="text"
                    value={r2AccessKeyId}
                    onChange={(e) => setR2AccessKeyId(e.target.value)}
                    placeholder="R2 Access Key ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label>
                  <input
                    type="password"
                    value={r2SecretAccessKey}
                    onChange={(e) => setR2SecretAccessKey(e.target.value)}
                    placeholder="Leave empty to keep current"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public URL</label>
                  <input
                    type="url"
                    value={r2PublicUrl}
                    onChange={(e) => setR2PublicUrl(e.target.value)}
                    placeholder="https://pub-xxx.r2.dev or your custom domain"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400">The public URL where uploaded files can be accessed</p>
                </div>
              </div>
            )}

            <Button onClick={handleSaveUploadSettings} disabled={savingUploadSettings}>
              {savingUploadSettings ? <Spinner size="sm" /> : 'Save Upload Settings'}
            </Button>
          </>
        )}
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

