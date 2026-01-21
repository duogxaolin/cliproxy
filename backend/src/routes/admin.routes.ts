import { Router } from 'express';
import { shadowModelController } from '../controllers/shadowModel.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require JWT authentication and admin role
router.use(authenticateJWT);
router.use(requireRole('admin'));

// Shadow Model Management
// GET /api/admin/models - List all models
router.get('/models', (req, res) => shadowModelController.getAllModels(req, res));

// POST /api/admin/models - Create model
router.post('/models', (req, res) => shadowModelController.createModel(req, res));

// GET /api/admin/models/:id - Get model
router.get('/models/:id', (req, res) => shadowModelController.getModel(req, res));

// PUT /api/admin/models/:id - Update model
router.put('/models/:id', (req, res) => shadowModelController.updateModel(req, res));

// DELETE /api/admin/models/:id - Delete model (soft delete)
router.delete('/models/:id', (req, res) => shadowModelController.deleteModel(req, res));

export default router;

