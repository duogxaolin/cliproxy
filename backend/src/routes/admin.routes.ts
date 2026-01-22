import { Router } from 'express';
import { shadowModelController } from '../controllers/shadowModel.controller';
import { adminController } from '../controllers/admin.controller';
import { settingsController } from '../controllers';
import { blogController } from '../controllers/blog.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require JWT authentication and admin role
router.use(authenticateJWT);
router.use(requireRole('admin'));

// Platform Statistics
// GET /api/admin/stats - Get platform statistics
router.get('/stats', (req, res) => adminController.getStats(req, res));

// Analytics Endpoints
// GET /api/admin/analytics - Platform-wide analytics
router.get('/analytics', (req, res) => adminController.getAnalytics(req, res));

// GET /api/admin/analytics/by-user - Usage by user
router.get('/analytics/by-user', (req, res) => adminController.getAnalyticsByUser(req, res));

// GET /api/admin/analytics/by-model - Usage by model
router.get('/analytics/by-model', (req, res) => adminController.getAnalyticsByModel(req, res));

// User Management
// GET /api/admin/users - List all users with credits
router.get('/users', (req, res) => adminController.getUsers(req, res));

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', (req, res) => adminController.getUser(req, res));

// POST /api/admin/users/:id/credits - Grant credits to user
router.post('/users/:id/credits', (req, res) => adminController.grantCredits(req, res));

// POST /api/admin/users/:id/credits/deduct - Deduct credits from user
router.post('/users/:id/credits/deduct', (req, res) => adminController.deductCredits(req, res));

// PATCH /api/admin/users/:id/status - Update user status (suspend/activate)
router.patch('/users/:id/status', (req, res) => adminController.updateUserStatus(req, res));

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

// ===========================================
// Settings Management Routes
// ===========================================
router.get('/settings', settingsController.getSettings.bind(settingsController));
router.get('/settings/:key', settingsController.getSetting.bind(settingsController));
router.post('/settings', settingsController.createSetting.bind(settingsController));
router.post('/settings/bulk', settingsController.bulkUpsertSettings.bind(settingsController));
router.put('/settings/:key', settingsController.updateSetting.bind(settingsController));
router.delete('/settings/:key', settingsController.deleteSetting.bind(settingsController));

// ===========================================
// Blog/Guide Management Routes
// ===========================================
router.get('/posts', (req, res) => blogController.getAllPosts(req, res));
router.get('/posts/:id', (req, res) => blogController.getPost(req, res));
router.post('/posts', (req, res) => blogController.createPost(req, res));
router.put('/posts/:id', (req, res) => blogController.updatePost(req, res));
router.delete('/posts/:id', (req, res) => blogController.deletePost(req, res));

export default router;

