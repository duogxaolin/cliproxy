import { useEffect, useState } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Input, Badge, Spinner, Modal, ModalFooter } from '../../components/ui';
import { adminService, ShadowModel, CreateModelData } from '../../services/adminService';

export default function ModelsPage() {
  const [models, setModels] = useState<ShadowModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<ShadowModel | null>(null);
  const [formData, setFormData] = useState<CreateModelData>({
    display_name: '',
    provider_base_url: '',
    provider_token: '',
    provider_model: '',
    pricing_input: 0,
    pricing_output: 0,
    is_active: true,
  });

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await adminService.getModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const resetForm = () => {
    setFormData({
      display_name: '',
      provider_base_url: '',
      provider_token: '',
      provider_model: '',
      pricing_input: 0,
      pricing_output: 0,
      is_active: true,
    });
    setEditingModel(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (model: ShadowModel) => {
    setEditingModel(model);
    setFormData({
      display_name: model.display_name,
      provider_base_url: model.provider_base_url,
      provider_token: '', // Don't show existing token
      provider_model: model.provider_model,
      pricing_input: model.pricing_input,
      pricing_output: model.pricing_output,
      is_active: model.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingModel) {
        const updateData = { ...formData };
        if (!updateData.provider_token) {
          delete (updateData as Record<string, unknown>).provider_token;
        }
        await adminService.updateModel(editingModel.id, updateData);
      } else {
        await adminService.createModel(formData);
      }
      setShowModal(false);
      resetForm();
      loadModels();
    } catch (err) {
      console.error('Failed to save model:', err);
    }
  };

  const handleDelete = async (model: ShadowModel) => {
    if (!confirm(`Are you sure you want to delete "${model.display_name}"?`)) return;
    try {
      await adminService.deleteModel(model.id);
      loadModels();
    } catch (err) {
      console.error('Failed to delete model:', err);
    }
  };

  const handleToggleActive = async (model: ShadowModel) => {
    try {
      await adminService.updateModel(model.id, { is_active: !model.is_active });
      loadModels();
    } catch (err) {
      console.error('Failed to toggle model status:', err);
    }
  };

  const formatPrice = (price: number | string | undefined | null) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
    return `$${(numPrice || 0).toFixed(6)}/token`;
  };

  return (
    <UserLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Management</h1>
          <p className="mt-1 text-sm text-gray-500">Configure shadow models and pricing.</p>
        </div>
        <Button
          onClick={openCreateModal}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Model
        </Button>
      </div>

      {/* Models Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : models.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-gray-500 mb-4">No models configured yet.</p>
          <Button onClick={openCreateModal}>Add Your First Model</Button>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider Model</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing (In/Out)</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{model.display_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{model.provider_model}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{model.provider_base_url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-emerald-600">{formatPrice(model.pricing_input)}</span>
                      {' / '}
                      <span className="text-blue-600">{formatPrice(model.pricing_output)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggleActive(model)}>
                        <Badge variant={model.is_active ? 'success' : 'default'} size="sm">
                          {model.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(model)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(model)}>
                          Delete
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingModel ? 'Edit Model' : 'Add New Model'}
        description={editingModel ? 'Update the model configuration.' : 'Configure a new shadow model.'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="claude-sonnet-4-5"
            required
          />
          <Input
            label="Provider Base URL"
            value={formData.provider_base_url}
            onChange={(e) => setFormData({ ...formData, provider_base_url: e.target.value })}
            placeholder="https://api.anthropic.com"
            required
          />
          <Input
            label={editingModel ? 'Provider Token (leave empty to keep existing)' : 'Provider Token'}
            type="password"
            value={formData.provider_token}
            onChange={(e) => setFormData({ ...formData, provider_token: e.target.value })}
            placeholder="sk-..."
            required={!editingModel}
          />
          <Input
            label="Provider Model"
            value={formData.provider_model}
            onChange={(e) => setFormData({ ...formData, provider_model: e.target.value })}
            placeholder="claude-sonnet-4-20250514"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Input Price ($/token)"
              type="number"
              step={0.000001}
              value={formData.pricing_input}
              onChange={(e) => setFormData({ ...formData, pricing_input: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Output Price ($/token)"
              type="number"
              step={0.000001}
              value={formData.pricing_output}
              onChange={(e) => setFormData({ ...formData, pricing_output: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">Active</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.display_name || !formData.provider_base_url || !formData.provider_model || (!editingModel && !formData.provider_token)}
          >
            {editingModel ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </UserLayout>
  );
}

