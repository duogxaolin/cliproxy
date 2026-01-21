import { Request, Response } from 'express';
import { shadowModelService } from '../services/shadowModel.service';
import { AuthenticatedRequest } from '../types';

export class ShadowModelController {
  async getAllModels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const models = await shadowModelService.getAllModels();
      res.json({ data: models });
    } catch (error) {
      console.error('Get all models error:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  }

  async getModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const model = await shadowModelService.getModel(id);

      if (!model) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }

      res.json({ data: model });
    } catch (error) {
      console.error('Get model error:', error);
      res.status(500).json({ error: 'Failed to fetch model' });
    }
  }

  async createModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { displayName, providerBaseUrl, providerToken, providerModel, pricingInput, pricingOutput, isActive } = req.body;

      // Validate required fields
      if (!displayName || !providerBaseUrl || !providerToken || !providerModel) {
        res.status(400).json({ error: 'Missing required fields: displayName, providerBaseUrl, providerToken, providerModel' });
        return;
      }

      if (pricingInput === undefined || pricingOutput === undefined) {
        res.status(400).json({ error: 'Missing required fields: pricingInput, pricingOutput' });
        return;
      }

      if (typeof pricingInput !== 'number' || typeof pricingOutput !== 'number') {
        res.status(400).json({ error: 'pricingInput and pricingOutput must be numbers' });
        return;
      }

      if (pricingInput < 0 || pricingOutput < 0) {
        res.status(400).json({ error: 'Pricing values cannot be negative' });
        return;
      }

      const model = await shadowModelService.createModel({
        displayName,
        providerBaseUrl,
        providerToken,
        providerModel,
        pricingInput,
        pricingOutput,
        isActive,
      });

      res.status(201).json({ data: model });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create model';
      if (message.includes('already exists') || message.includes('Invalid')) {
        res.status(400).json({ error: message });
      } else {
        console.error('Create model error:', error);
        res.status(500).json({ error: message });
      }
    }
  }

  async updateModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { displayName, providerBaseUrl, providerToken, providerModel, pricingInput, pricingOutput, isActive } = req.body;

      // Validate pricing if provided
      if (pricingInput !== undefined && (typeof pricingInput !== 'number' || pricingInput < 0)) {
        res.status(400).json({ error: 'pricingInput must be a non-negative number' });
        return;
      }

      if (pricingOutput !== undefined && (typeof pricingOutput !== 'number' || pricingOutput < 0)) {
        res.status(400).json({ error: 'pricingOutput must be a non-negative number' });
        return;
      }

      const model = await shadowModelService.updateModel(id, {
        displayName,
        providerBaseUrl,
        providerToken,
        providerModel,
        pricingInput,
        pricingOutput,
        isActive,
      });

      res.json({ data: model });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update model';
      if (message === 'Model not found') {
        res.status(404).json({ error: message });
      } else if (message.includes('already exists') || message.includes('Invalid')) {
        res.status(400).json({ error: message });
      } else {
        console.error('Update model error:', error);
        res.status(500).json({ error: message });
      }
    }
  }

  async deleteModel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const model = await shadowModelService.deleteModel(id);
      res.json({ data: model, message: 'Model deactivated successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete model';
      if (message === 'Model not found') {
        res.status(404).json({ error: message });
      } else {
        console.error('Delete model error:', error);
        res.status(500).json({ error: message });
      }
    }
  }
}

export const shadowModelController = new ShadowModelController();

