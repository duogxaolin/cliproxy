import { Router, Response } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { creditController } from '../controllers/credit.controller';
import { usageController } from '../controllers/usage.controller';
import { AuthenticatedRequest } from '../types';
import prisma from '../utils/prisma';

const router = Router();

// All user routes require JWT authentication
router.use(authenticateJWT);

// GET /api/users/me - Get current user profile
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// GET /api/users/me/credits - Get credit balance and recent transactions
router.get('/me/credits', (req, res) => creditController.getCredits(req, res));

// GET /api/users/me/credits/transactions - Get transaction history with pagination
router.get('/me/credits/transactions', (req, res) => creditController.getTransactions(req, res));

// Usage Analytics Endpoints
// GET /api/users/me/usage - Get usage summary
router.get('/me/usage', (req, res) => usageController.getUsageSummary(req, res));

// GET /api/users/me/usage/by-time - Usage by time period
router.get('/me/usage/by-time', (req, res) => usageController.getUsageByTime(req, res));

// GET /api/users/me/usage/by-model - Usage by model
router.get('/me/usage/by-model', (req, res) => usageController.getUsageByModel(req, res));

// GET /api/users/me/usage/by-key - Usage by API key
router.get('/me/usage/by-key', (req, res) => usageController.getUsageByKey(req, res));

// GET /api/users/me/usage/logs - Request logs with pagination
router.get('/me/usage/logs', (req, res) => usageController.getRequestLogs(req, res));

export default router;

