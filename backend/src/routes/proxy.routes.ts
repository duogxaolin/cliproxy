import { Router } from 'express';
import { proxyController } from '../controllers/proxy.controller';
import { authenticateApiKey } from '../middleware/auth.middleware';

const router = Router();

// All proxy routes require API key authentication
router.use(authenticateApiKey);

// POST /api/v1/messages - Anthropic-compatible endpoint
router.post('/messages', (req, res) => proxyController.handleAnthropicMessages(req, res));

// POST /api/v1/chat/completions - OpenAI-compatible endpoint
router.post('/chat/completions', (req, res) => proxyController.handleOpenAIChatCompletions(req, res));

export default router;

