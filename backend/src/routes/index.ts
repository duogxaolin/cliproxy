import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes will be added in subsequent phases
// - /api/auth (Phase 2)
// - /api/users (Phase 4)
// - /api/api-keys (Phase 4)
// - /api/admin (Phase 3)
// - /api/v1 (Phase 5 - Proxy)

export default router;

