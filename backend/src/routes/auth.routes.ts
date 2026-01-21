import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register - User registration
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login - User login
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/logout - User logout (requires authentication)
router.post('/logout', authenticateJWT, (req, res) => authController.logout(req, res));

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', (req, res) => authController.refresh(req, res));

export default router;

