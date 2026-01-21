import { useState, useEffect } from 'react';
import { UserLayout } from '../components/layout';
import { Card, Button, Input, Badge, Spinner, Modal, ModalFooter, Alert } from '../components/ui';
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
    <UserLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your API keys for accessing the platform.</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Create API Key
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {newlyCreatedKey && (
        <Alert variant="success" title="API Key Created!" className="mb-6" onClose={() => setNewlyCreatedKey(null)}>
          <p className="mb-3">Copy your API key now - it won't be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-white border border-emerald-200 rounded-lg text-sm font-mono break-all">
              {newlyCreatedKey}
            </code>
            <Button
              size="sm"
              onClick={() => copyToClipboard(newlyCreatedKey)}
            >
              {copiedKey ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <p className="text-gray-500 mb-4">No API keys yet. Create one to get started.</p>
          <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
            Create Your First API Key
          </Button>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Models</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quota</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{key.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {key.key_prefix}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {key.allowed_models?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {key.allowed_models.slice(0, 2).map((model) => (
                            <Badge key={model} variant="info" size="sm">{model}</Badge>
                          ))}
                          {key.allowed_models.length > 2 && (
                            <Badge variant="default" size="sm">+{key.allowed_models.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="success" size="sm">All Models</Badge>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(key)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevoke(key)}>
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create API Key"
        description="Create a new API key to access the platform."
      >
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <Input
              label="Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="My API Key"
            />
            <Input
              label="Allowed Models"
              value={formModels}
              onChange={(e) => setFormModels(e.target.value)}
              placeholder="model1, model2 (leave empty for all)"
              hint="Comma-separated list of model names"
            />
            <Input
              label="Quota Limit"
              type="number"
              value={formQuotaLimit}
              onChange={(e) => setFormQuotaLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
              min={1}
            />
            <Input
              label="Expires At"
              type="date"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
            />
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={formSubmitting}>
              Create
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedKey(null); }}
        title="Edit API Key"
        description="Update the settings for this API key."
      >
        <form onSubmit={handleEdit}>
          <div className="space-y-4">
            <Input
              label="Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Input
              label="Allowed Models"
              value={formModels}
              onChange={(e) => setFormModels(e.target.value)}
              placeholder="model1, model2 (leave empty for all)"
              hint="Comma-separated list of model names"
            />
            <Input
              label="Quota Limit"
              type="number"
              value={formQuotaLimit}
              onChange={(e) => setFormQuotaLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
              min={1}
            />
            <Input
              label="Expires At"
              type="date"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
            />
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedKey(null); }} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={formSubmitting}>
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </UserLayout>
  );
}

