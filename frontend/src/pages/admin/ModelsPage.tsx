import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
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

  const formatPrice = (price: number) => `$${price.toFixed(6)}/token`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Model Management</h2>
          <button onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Add Model
          </button>
        </div>

        {/* Models Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing (In/Out)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                ) : models.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No models configured</td></tr>
                ) : (
                  models.map((model) => (
                    <tr key={model.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{model.display_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{model.provider_model}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{model.provider_base_url}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(model.pricing_input)} / {formatPrice(model.pricing_output)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleToggleActive(model)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            model.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {model.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button onClick={() => openEditModal(model)} className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => handleDelete(model)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input type="text" value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="claude-sonnet-4-5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Base URL</label>
                  <input type="text" value={formData.provider_base_url}
                    onChange={(e) => setFormData({ ...formData, provider_base_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="https://api.anthropic.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Token {editingModel && '(leave empty to keep existing)'}
                  </label>
                  <input type="password" value={formData.provider_token}
                    onChange={(e) => setFormData({ ...formData, provider_token: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="sk-..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Model</label>
                  <input type="text" value={formData.provider_model}
                    onChange={(e) => setFormData({ ...formData, provider_model: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="claude-sonnet-4-20250514" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Input Price ($/token)</label>
                    <input type="number" step="0.000001" value={formData.pricing_input}
                      onChange={(e) => setFormData({ ...formData, pricing_input: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output Price ($/token)</label>
                    <input type="number" step="0.000001" value={formData.pricing_output}
                      onChange={(e) => setFormData({ ...formData, pricing_output: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="is_active" checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit}
                  disabled={!formData.display_name || !formData.provider_base_url || !formData.provider_model || (!editingModel && !formData.provider_token)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                  {editingModel ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

