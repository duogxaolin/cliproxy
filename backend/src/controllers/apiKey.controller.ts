import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { apiKeyService, CreateApiKeyData, UpdateApiKeyData } from '../services/apiKey.service';

export class ApiKeyController {
  async getApiKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const apiKeys = await apiKeyService.getApiKeys(userId);
      res.json({ data: apiKeys });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ error: 'Failed to get API keys' });
    }
  }

  async createApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, allowed_models, quota_limit, expires_at } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const data: CreateApiKeyData = {
        name: name.trim(),
        allowed_models: allowed_models || null,
        quota_limit: quota_limit ? parseInt(quota_limit, 10) : null,
        expires_at: expires_at ? new Date(expires_at) : null,
      };

      // Validate expires_at is in the future
      if (data.expires_at && data.expires_at <= new Date()) {
        res.status(400).json({ error: 'Expiration date must be in the future' });
        return;
      }

      // Validate quota_limit is positive
      if (data.quota_limit !== null && data.quota_limit !== undefined && data.quota_limit <= 0) {
        res.status(400).json({ error: 'Quota limit must be a positive number' });
        return;
      }

      const apiKey = await apiKeyService.createApiKey(userId, data);
      res.status(201).json(apiKey);
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  }

  async getApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const apiKey = await apiKeyService.getApiKey(userId, id);
      if (!apiKey) {
        res.status(404).json({ error: 'API key not found' });
        return;
      }

      res.json(apiKey);
    } catch (error) {
      console.error('Get API key error:', error);
      res.status(500).json({ error: 'Failed to get API key' });
    }
  }

  async updateApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { name, allowed_models, quota_limit, expires_at } = req.body;

      const data: UpdateApiKeyData = {};
      if (name !== undefined) data.name = name.trim();
      if (allowed_models !== undefined) data.allowed_models = allowed_models;
      if (quota_limit !== undefined) {
        data.quota_limit = quota_limit ? parseInt(quota_limit, 10) : null;
      }
      if (expires_at !== undefined) {
        data.expires_at = expires_at ? new Date(expires_at) : null;
      }

      // Validate expires_at is in the future if provided
      if (data.expires_at && data.expires_at <= new Date()) {
        res.status(400).json({ error: 'Expiration date must be in the future' });
        return;
      }

      // Validate quota_limit is positive if provided
      if (data.quota_limit !== undefined && data.quota_limit !== null && data.quota_limit <= 0) {
        res.status(400).json({ error: 'Quota limit must be a positive number' });
        return;
      }

      const apiKey = await apiKeyService.updateApiKey(userId, id, data);
      if (!apiKey) {
        res.status(404).json({ error: 'API key not found' });
        return;
      }

      res.json(apiKey);
    } catch (error) {
      console.error('Update API key error:', error);
      res.status(500).json({ error: 'Failed to update API key' });
    }
  }

  async revokeApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const apiKey = await apiKeyService.revokeApiKey(userId, id);
      if (!apiKey) {
        res.status(404).json({ error: 'API key not found or already revoked' });
        return;
      }

      res.json({ message: 'API key revoked successfully', data: apiKey });
    } catch (error) {
      console.error('Revoke API key error:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }
}

export const apiKeyController = new ApiKeyController();

