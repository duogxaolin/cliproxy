import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiKeyService, ApiKey, ApiKeyCreateResponse } from '../services/apiKeyService';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formModels, setFormModels] = useState('');
  const [formQuotaLimit, setFormQuotaLimit] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
      setError(null);
    } catch (err) {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const data = {
        name: formName,
        allowed_models: formModels ? formModels.split(',').map(m => m.trim()) : null,
        quota_limit: formQuotaLimit ? parseInt(formQuotaLimit) : null,
        expires_at: formExpiresAt || null,
      };
      const result: ApiKeyCreateResponse = await apiKeyService.createApiKey(data);
      setNewlyCreatedKey(result.key);
      setApiKeys([result, ...apiKeys]);
      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      setError('Failed to create API key');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;
    setFormSubmitting(true);
    try {
      const data = {
        name: formName,
        allowed_models: formModels ? formModels.split(',').map(m => m.trim()) : null,
        quota_limit: formQuotaLimit ? parseInt(formQuotaLimit) : null,
        expires_at: formExpiresAt || null,
      };
      const updated = await apiKeyService.updateApiKey(selectedKey.id, data);
      setApiKeys(apiKeys.map(k => k.id === updated.id ? updated : k));
      resetForm();
      setShowEditModal(false);
      setSelectedKey(null);
    } catch (err) {
      setError('Failed to update API key');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRevoke = async (key: ApiKey) => {
    if (!confirm(`Are you sure you want to revoke "${key.name}"? This cannot be undone.`)) return;
    try {
      await apiKeyService.revokeApiKey(key.id);
      setApiKeys(apiKeys.filter(k => k.id !== key.id));
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const openEditModal = (key: ApiKey) => {
    setSelectedKey(key);
    setFormName(key.name);
    setFormModels(key.allowed_models?.join(', ') || '');
    setFormQuotaLimit(key.quota_limit?.toString() || '');
    setFormExpiresAt(key.expires_at ? key.expires_at.split('T')[0] : '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormModels('');
    setFormQuotaLimit('');
    setFormExpiresAt('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create API Key
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {newlyCreatedKey && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium mb-2">
              API Key created! Copy it now - it won't be shown again.
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                {newlyCreatedKey}
              </code>
              <button
                onClick={() => copyToClipboard(newlyCreatedKey)}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {copiedKey ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Models</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {key.key_prefix}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.allowed_models?.length ? key.allowed_models.join(', ') : 'All'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.quota_limit ? `${key.quota_used}/${key.quota_limit}` : 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(key)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRevoke(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Create API Key</h3>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="My API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allowed Models</label>
                    <input
                      type="text"
                      value={formModels}
                      onChange={(e) => setFormModels(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="model1, model2 (leave empty for all)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quota Limit</label>
                    <input
                      type="number"
                      value={formQuotaLimit}
                      onChange={(e) => setFormQuotaLimit(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Edit API Key</h3>
              <form onSubmit={handleEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allowed Models</label>
                    <input
                      type="text"
                      value={formModels}
                      onChange={(e) => setFormModels(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="model1, model2 (leave empty for all)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quota Limit</label>
                    <input
                      type="number"
                      value={formQuotaLimit}
                      onChange={(e) => setFormQuotaLimit(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expires At</label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setSelectedKey(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

