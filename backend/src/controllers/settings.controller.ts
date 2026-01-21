import { Request, Response } from 'express';
import { settingsService, CreateSettingInput, UpdateSettingInput } from '../services';

class SettingsController {
  /**
   * GET /api/admin/settings
   * Get all settings, optionally filtered by category
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const settings = await settingsService.getSettings(category as string | undefined);
      
      res.json({
        data: settings,
        total: settings.length,
      });
    } catch (error: any) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: error.message || 'Failed to get settings' });
    }
  }

  /**
   * GET /api/admin/settings/:key
   * Get a single setting by key
   */
  async getSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const setting = await settingsService.getSetting(key);
      
      if (!setting) {
        res.status(404).json({ error: `Setting "${key}" not found` });
        return;
      }
      
      res.json({ data: setting });
    } catch (error: any) {
      console.error('Error getting setting:', error);
      res.status(500).json({ error: error.message || 'Failed to get setting' });
    }
  }

  /**
   * POST /api/admin/settings
   * Create a new setting
   */
  async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, category, dataType, isSecret, description } = req.body;
      
      // Validation
      if (!key || typeof key !== 'string') {
        res.status(400).json({ error: 'Key is required and must be a string' });
        return;
      }
      
      if (value === undefined || value === null) {
        res.status(400).json({ error: 'Value is required' });
        return;
      }
      
      if (!category || !['environment', 'connection', 'system'].includes(category)) {
        res.status(400).json({ error: 'Category must be one of: environment, connection, system' });
        return;
      }
      
      if (dataType && !['string', 'number', 'boolean', 'json'].includes(dataType)) {
        res.status(400).json({ error: 'DataType must be one of: string, number, boolean, json' });
        return;
      }
      
      const data: CreateSettingInput = {
        key: key.trim(),
        value: String(value),
        category,
        dataType: dataType || 'string',
        isSecret: isSecret || false,
        description: description || undefined,
      };
      
      const setting = await settingsService.createSetting(data);
      
      res.status(201).json({
        message: 'Setting created successfully',
        data: setting,
      });
    } catch (error: any) {
      console.error('Error creating setting:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to create setting' });
      }
    }
  }

  /**
   * PUT /api/admin/settings/:key
   * Update an existing setting
   */
  async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value, category, dataType, isSecret, description } = req.body;
      
      // At least one field must be provided
      if (value === undefined && category === undefined && dataType === undefined && 
          isSecret === undefined && description === undefined) {
        res.status(400).json({ error: 'At least one field must be provided for update' });
        return;
      }
      
      if (category && !['environment', 'connection', 'system'].includes(category)) {
        res.status(400).json({ error: 'Category must be one of: environment, connection, system' });
        return;
      }
      
      if (dataType && !['string', 'number', 'boolean', 'json'].includes(dataType)) {
        res.status(400).json({ error: 'DataType must be one of: string, number, boolean, json' });
        return;
      }
      
      const data: UpdateSettingInput = {};
      if (value !== undefined) data.value = String(value);
      if (category !== undefined) data.category = category;
      if (dataType !== undefined) data.dataType = dataType;
      if (isSecret !== undefined) data.isSecret = isSecret;
      if (description !== undefined) data.description = description;
      
      const setting = await settingsService.updateSetting(key, data);
      
      res.json({
        message: 'Setting updated successfully',
        data: setting,
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to update setting' });
      }
    }
  }

  /**
   * DELETE /api/admin/settings/:key
   * Delete a setting
   */
  async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      await settingsService.deleteSetting(key);

      res.json({ message: 'Setting deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || 'Failed to delete setting' });
      }
    }
  }

  /**
   * POST /api/admin/settings/bulk
   * Bulk upsert settings
   */
  async bulkUpsertSettings(req: Request, res: Response): Promise<void> {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings) || settings.length === 0) {
        res.status(400).json({ error: 'Settings array is required and must not be empty' });
        return;
      }

      // Validate each setting
      for (const setting of settings) {
        if (!setting.key || !setting.value || !setting.category) {
          res.status(400).json({ error: 'Each setting must have key, value, and category' });
          return;
        }
        if (!['environment', 'connection', 'system'].includes(setting.category)) {
          res.status(400).json({ error: `Invalid category for key "${setting.key}"` });
          return;
        }
      }

      const result = await settingsService.bulkUpsertSettings(settings);

      res.json({
        message: `${result.length} settings saved successfully`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error bulk upserting settings:', error);
      res.status(500).json({ error: error.message || 'Failed to save settings' });
    }
  }
}

export const settingsController = new SettingsController();
