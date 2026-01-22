import { ShadowModel } from '@prisma/client';
import prisma from '../utils/prisma';
import { encrypt, decrypt } from '../utils/encryption';

export interface CreateShadowModelData {
  displayName: string;
  providerBaseUrl: string;
  providerToken: string;
  providerModel: string;
  systemPrompt?: string;
  pricingInput: number;
  pricingOutput: number;
  isActive?: boolean;
}

export interface UpdateShadowModelData {
  displayName?: string;
  providerBaseUrl?: string;
  providerToken?: string;
  providerModel?: string;
  systemPrompt?: string;
  pricingInput?: number;
  pricingOutput?: number;
  isActive?: boolean;
}

export class ShadowModelService {
  async createModel(data: CreateShadowModelData): Promise<ShadowModel> {
    // Validate URL format
    try {
      new URL(data.providerBaseUrl);
    } catch {
      throw new Error('Invalid provider base URL format');
    }

    // Check if display name already exists
    const existing = await prisma.shadowModel.findUnique({
      where: { displayName: data.displayName },
    });

    if (existing) {
      throw new Error('Model with this display name already exists');
    }

    return prisma.shadowModel.create({
      data: {
        displayName: data.displayName,
        providerBaseUrl: data.providerBaseUrl,
        providerToken: encrypt(data.providerToken),
        providerModel: data.providerModel,
        systemPrompt: data.systemPrompt || null,
        pricingInput: data.pricingInput,
        pricingOutput: data.pricingOutput,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateModel(id: string, data: UpdateShadowModelData): Promise<ShadowModel> {
    // Check if model exists
    const existing = await prisma.shadowModel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Model not found');
    }

    // Validate URL format if provided
    if (data.providerBaseUrl) {
      try {
        new URL(data.providerBaseUrl);
      } catch {
        throw new Error('Invalid provider base URL format');
      }
    }

    // Check if new display name conflicts with another model
    if (data.displayName && data.displayName !== existing.displayName) {
      const conflict = await prisma.shadowModel.findUnique({
        where: { displayName: data.displayName },
      });
      if (conflict) {
        throw new Error('Model with this display name already exists');
      }
    }

    // Encrypt provider token if being updated
    const updateData = { ...data };
    if (updateData.providerToken) {
      updateData.providerToken = encrypt(updateData.providerToken);
    }

    return prisma.shadowModel.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteModel(id: string): Promise<ShadowModel> {
    const existing = await prisma.shadowModel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Model not found');
    }

    // Soft delete by marking as inactive
    return prisma.shadowModel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getModel(id: string): Promise<ShadowModel | null> {
    const model = await prisma.shadowModel.findUnique({
      where: { id },
    });
    return model ? this.decryptModelToken(model) : null;
  }

  async getModelByDisplayName(displayName: string): Promise<ShadowModel | null> {
    const model = await prisma.shadowModel.findUnique({
      where: { displayName },
    });
    return model ? this.decryptModelToken(model) : null;
  }

  async getAllModels(): Promise<ShadowModel[]> {
    const models = await prisma.shadowModel.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return models.map(model => this.decryptModelToken(model));
  }

  async getActiveModels(): Promise<ShadowModel[]> {
    const models = await prisma.shadowModel.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' },
    });
    return models.map(model => this.decryptModelToken(model));
  }

  private decryptModelToken(model: ShadowModel): ShadowModel {
    return {
      ...model,
      providerToken: decrypt(model.providerToken),
    };
  }
}

export const shadowModelService = new ShadowModelService();

