import { PrismaClient, SystemSetting } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';

const prisma = new PrismaClient();

export interface CreateSettingInput {
  key: string;
  value: string;
  category: 'environment' | 'connection' | 'system';
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  isSecret?: boolean;
  description?: string;
}

export interface UpdateSettingInput {
  value?: string;
  category?: 'environment' | 'connection' | 'system';
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  isSecret?: boolean;
  description?: string;
}

class SettingsService {
  /**
   * Get all settings, optionally filtered by category
   */
  async getSettings(category?: string): Promise<SystemSetting[]> {
    const where = category ? { category } : {};
    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Decrypt secret values for internal use, but mask them for display
    return settings.map(setting => ({
      ...setting,
      value: setting.isSecret ? this.maskValue(setting.value) : setting.value,
    }));
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string): Promise<SystemSetting | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    return {
      ...setting,
      value: setting.isSecret ? this.maskValue(setting.value) : setting.value,
    };
  }

  /**
   * Get setting value (decrypted if secret) - for internal use
   */
  async getSettingValue(key: string): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    if (setting.isSecret) {
      try {
        return decrypt(setting.value);
      } catch {
        return setting.value;
      }
    }

    return setting.value;
  }

  /**
   * Create a new setting
   */
  async createSetting(data: CreateSettingInput): Promise<SystemSetting> {
    // Check if key already exists
    const existing = await prisma.systemSetting.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      throw new Error(`Setting with key "${data.key}" already exists`);
    }

    // Encrypt value if it's a secret
    const value = data.isSecret ? encrypt(data.value) : data.value;

    const setting = await prisma.systemSetting.create({
      data: {
        key: data.key,
        value,
        category: data.category,
        dataType: data.dataType || 'string',
        isSecret: data.isSecret || false,
        description: data.description,
      },
    });

    return {
      ...setting,
      value: setting.isSecret ? this.maskValue(data.value) : setting.value,
    };
  }

  /**
   * Update an existing setting
   */
  async updateSetting(key: string, data: UpdateSettingInput): Promise<SystemSetting> {
    const existing = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new Error(`Setting with key "${key}" not found`);
    }

    // Prepare update data
    const updateData: any = {};

    if (data.value !== undefined) {
      // If changing to secret or already secret, encrypt the value
      const isSecret = data.isSecret !== undefined ? data.isSecret : existing.isSecret;
      updateData.value = isSecret ? encrypt(data.value) : data.value;
    }

    if (data.category !== undefined) updateData.category = data.category;
    if (data.dataType !== undefined) updateData.dataType = data.dataType;
    if (data.isSecret !== undefined) updateData.isSecret = data.isSecret;
    if (data.description !== undefined) updateData.description = data.description;

    const setting = await prisma.systemSetting.update({
      where: { key },
      data: updateData,
    });

    return {
      ...setting,
      value: setting.isSecret ? this.maskValue(data.value || '') : setting.value,
    };
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<void> {
    const existing = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new Error(`Setting with key "${key}" not found`);
    }

    await prisma.systemSetting.delete({
      where: { key },
    });
  }

  /**
   * Bulk upsert settings
   */
  async bulkUpsertSettings(settings: CreateSettingInput[]): Promise<SystemSetting[]> {
    const results: SystemSetting[] = [];

    for (const setting of settings) {
      const existing = await prisma.systemSetting.findUnique({
        where: { key: setting.key },
      });

      if (existing) {
        const updated = await this.updateSetting(setting.key, {
          value: setting.value,
          category: setting.category,
          dataType: setting.dataType,
          isSecret: setting.isSecret,
          description: setting.description,
        });
        results.push(updated);
      } else {
        const created = await this.createSetting(setting);
        results.push(created);
      }
    }

    return results;
  }

  /**
   * Get settings by category as key-value object
   */
  async getSettingsAsObject(category: string): Promise<Record<string, string>> {
    const settings = await prisma.systemSetting.findMany({
      where: { category },
    });

    const result: Record<string, string> = {};
    for (const setting of settings) {
      if (setting.isSecret) {
        try {
          result[setting.key] = decrypt(setting.value);
        } catch {
          result[setting.key] = setting.value;
        }
      } else {
        result[setting.key] = setting.value;
      }
    }

    return result;
  }

  /**
   * Mask a secret value for display
   */
  private maskValue(value: string): string {
    if (!value || value.length <= 8) {
      return '••••••••';
    }
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  }
}

export const settingsService = new SettingsService();
