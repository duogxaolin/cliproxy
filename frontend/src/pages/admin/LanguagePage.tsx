import { useState, useEffect } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Modal, Spinner, Badge } from '../../components/ui';
import { PlusIcon, PencilIcon, TrashIcon, LanguageIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { translations as defaultTranslations, Language } from '../../i18n/translations';

interface Translation {
  id?: string;
  language: string;
  key: string;
  value: string;
}

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Flatten nested object to dot notation keys
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = String(obj[key]);
    }
  }
  return result;
};

export default function LanguagePage() {
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({ key: '', value: '' });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/translations');
      const dbTranslations = response.data.data || {};
      
      // Merge with default translations
      const merged: Record<string, Record<string, string>> = {};
      LANGUAGES.forEach(lang => {
        const defaultFlat = flattenObject(defaultTranslations[lang.code] || {});
        merged[lang.code] = { ...defaultFlat, ...(dbTranslations[lang.code] || {}) };
      });
      
      setTranslations(merged);
    } catch (err) {
      console.error('Failed to load translations:', err);
      // Use default translations if API fails
      const merged: Record<string, Record<string, string>> = {};
      LANGUAGES.forEach(lang => {
        merged[lang.code] = flattenObject(defaultTranslations[lang.code] || {});
      });
      setTranslations(merged);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.key.trim()) {
      setError('Key is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post('/api/translations', {
        language: activeLanguage,
        key: formData.key.trim(),
        value: formData.value,
      });
      setSuccessMessage('Translation saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsModalOpen(false);
      setEditingKey(null);
      setFormData({ key: '', value: '' });
      loadTranslations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save translation');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setFormData({ key, value: translations[activeLanguage]?.[key] || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete translation "${key}" for ${activeLanguage}?`)) return;
    try {
      await api.delete(`/api/translations/${activeLanguage}/${encodeURIComponent(key)}`);
      setSuccessMessage('Translation deleted!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadTranslations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete translation');
    }
  };

  const handleSyncDefaults = async () => {
    if (!confirm('This will add all missing default translations to the database. Continue?')) return;
    setSaving(true);
    try {
      const toSync: Translation[] = [];
      LANGUAGES.forEach(lang => {
        const defaultFlat = flattenObject(defaultTranslations[lang.code] || {});
        Object.entries(defaultFlat).forEach(([key, value]) => {
          toSync.push({ language: lang.code, key, value });
        });
      });
      await api.post('/api/translations/bulk', { translations: toSync });
      setSuccessMessage('Default translations synced!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadTranslations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sync translations');
    } finally {
      setSaving(false);
    }
  };

  const filteredKeys = Object.keys(translations[activeLanguage] || {})
    .filter(key => 
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (translations[activeLanguage]?.[key] || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort();

  const groupedKeys = filteredKeys.reduce((acc, key) => {
    const group = key.split('.')[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(key);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Language Management</h1>
            <p className="text-gray-500 mt-1">Manage translations for all supported languages</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleSyncDefaults} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Sync Defaults'}
            </Button>
            <Button onClick={() => { setEditingKey(null); setFormData({ key: '', value: '' }); setIsModalOpen(true); }}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Translation
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Language Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeLanguage === lang.code
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name}</span>
                <span className="sm:hidden">{lang.code.toUpperCase()}</span>
                <Badge color="gray" size="sm">{Object.keys(translations[lang.code] || {}).length}</Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Translations List */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedKeys).map(([group, keys]) => (
              <Card key={group}>
                <div className="flex items-center gap-2 mb-4">
                  <LanguageIcon className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">{group}</h3>
                  <Badge color="blue" size="sm">{keys.length}</Badge>
                </div>
                <div className="space-y-2">
                  {keys.map((key) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <code className="text-xs text-gray-500 break-all">{key}</code>
                        <p className="text-sm text-gray-900 mt-1 break-words">{translations[activeLanguage]?.[key] || ''}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(key)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(key)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {filteredKeys.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No translations found. Click "Sync Defaults" to load default translations.
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingKey ? 'Edit Translation' : 'Add Translation'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={!!editingKey}
                placeholder="e.g., nav.dashboard"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value ({LANGUAGES.find(l => l.code === activeLanguage)?.name})
              </label>
              <textarea
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                rows={4}
                placeholder="Translation text..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </UserLayout>
  );
}