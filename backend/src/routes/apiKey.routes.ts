import { Router } from 'express';
import { apiKeyController } from '../controllers/apiKey.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// All API key routes require JWT authentication
router.use(authenticateJWT);

// GET /api/api-keys - List user's API keys
router.get('/', (req, res) => apiKeyController.getApiKeys(req, res));

// POST /api/api-keys - Create new API key
router.post('/', (req, res) => apiKeyController.createApiKey(req, res));

// GET /api/api-keys/:id - Get single API key details
router.get('/:id', (req, res) => apiKeyController.getApiKey(req, res));

// PUT /api/api-keys/:id - Update API key
router.put('/:id', (req, res) => apiKeyController.updateApiKey(req, res));

// DELETE /api/api-keys/:id - Revoke API key
router.delete('/:id', (req, res) => apiKeyController.revokeApiKey(req, res));

export default router;

