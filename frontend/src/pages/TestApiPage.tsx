import { useState, useEffect } from 'react';
import { UserLayout } from '../components/layout';
import { Card, Button, Input, Spinner, Alert } from '../components/ui';
import { apiKeyService, ApiKey } from '../services/apiKeyService';

type ApiFormat = 'openai' | 'anthropic';

interface PublicModel {
  id: string;
  displayName: string;
  pricingInput: number;
  pricingOutput: number;
}

export default function TestApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [models, setModels] = useState<PublicModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiFormat, setApiFormat] = useState<ApiFormat>('openai');
  const [message, setMessage] = useState('Hello! Can you tell me a short joke?');
  const [maxTokens, setMaxTokens] = useState('256');
  
  // Response state
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `${window.location.protocol}//${window.location.hostname}:4567`);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, modelsRes] = await Promise.all([
        apiKeyService.getApiKeys(),
        fetch(`${baseUrl}/api/public/models`).then(r => r.json())
      ]);
      setApiKeys(keysData);
      setModels(modelsRes.data || []);
      if (modelsRes.data?.length > 0) {
        setSelectedModel(modelsRes.data[0].displayName);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    const apiKey = customApiKey || '';
    if (!apiKey && !selectedKeyId) {
      setError('Please enter an API key or select one from your keys');
      return;
    }
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSubmitting(true);
    setError(null);
    setResponse(null);
    const startTime = Date.now();

    try {
      const endpoint = apiFormat === 'openai' 
        ? `${baseUrl}/api/v1/chat/completions`
        : `${baseUrl}/api/v1/messages`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiFormat === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      }

      const body = apiFormat === 'openai' 
        ? {
            model: selectedModel,
            messages: [{ role: 'user', content: message }],
            max_tokens: parseInt(maxTokens) || 256,
          }
        : {
            model: selectedModel,
            messages: [{ role: 'user', content: message }],
            max_tokens: parseInt(maxTokens) || 256,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResponseTime(Date.now() - startTime);

      if (!res.ok) {
        setError(data.error?.message || data.error || `Error ${res.status}: ${res.statusText}`);
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
      setResponseTime(Date.now() - startTime);
    } finally {
      setSubmitting(false);
    }
  };

  const extractContent = (data: any): string => {
    try {
      const parsed = JSON.parse(data);
      if (apiFormat === 'openai') {
        return parsed.choices?.[0]?.message?.content || '';
      } else {
        return parsed.content?.[0]?.text || '';
      }
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Test API</h1>
        <p className="mt-1 text-sm text-gray-500">Test your API keys with OpenAI or Anthropic compatible endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request</h2>

          <div className="space-y-4">
            {/* API Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Format</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setApiFormat('openai')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    apiFormat === 'openai'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => setApiFormat('anthropic')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    apiFormat === 'anthropic'
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anthropic
                </button>
              </div>
            </div>

            {/* API Key Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              {apiKeys.length > 0 && (
                <select
                  value={selectedKeyId}
                  onChange={(e) => { setSelectedKeyId(e.target.value); setCustomApiKey(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
                >
                  <option value="">-- Select from your keys --</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.key_prefix}...)
                    </option>
                  ))}
                </select>
              )}
              <Input
                placeholder="Or paste your API key here (sk-...)"
                value={customApiKey}
                onChange={(e) => { setCustomApiKey(e.target.value); setSelectedKeyId(''); }}
                type="password"
              />
              <p className="mt-1 text-xs text-gray-500">
                {apiFormat === 'openai' ? 'Uses Authorization: Bearer header' : 'Uses x-api-key header'}
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.displayName}>
                    {model.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Tokens */}
            <Input
              label="Max Tokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              min={1}
              max={4096}
            />

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Enter your message..."
              />
            </div>

            <Button onClick={handleTest} isLoading={submitting} className="w-full">
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </Card>

        {/* Response Panel */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Response</h2>
            {responseTime !== null && (
              <span className="text-sm text-gray-500">{responseTime}ms</span>
            )}
          </div>

          {error && (
            <Alert variant="error" className="mb-4" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {response ? (
            <div className="space-y-4">
              {/* Extracted Content */}
              {extractContent(response) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Assistant Response:</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{extractContent(response)}</p>
                </div>
              )}

              {/* Raw JSON */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Response:</h3>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto max-h-96">
                  {response}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Send a request to see the response</p>
            </div>
          )}
        </Card>
      </div>

      {/* API Info */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-medium text-emerald-800 mb-2">OpenAI Compatible</h3>
            <code className="text-sm text-emerald-700 break-all">POST {baseUrl}/api/v1/chat/completions</code>
            <p className="text-xs text-emerald-600 mt-2">Header: Authorization: Bearer YOUR_API_KEY</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-800 mb-2">Anthropic Compatible</h3>
            <code className="text-sm text-orange-700 break-all">POST {baseUrl}/api/v1/messages</code>
            <p className="text-xs text-orange-600 mt-2">Header: x-api-key: YOUR_API_KEY</p>
          </div>
        </div>
      </Card>
    </UserLayout>
  );
}