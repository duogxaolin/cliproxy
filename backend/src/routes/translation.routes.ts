import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/translations - Get all translations (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: [{ language: 'asc' }, { key: 'asc' }],
    });

    // Group by language
    const grouped: Record<string, Record<string, string>> = {};
    translations.forEach((t) => {
      if (!grouped[t.language]) {
        grouped[t.language] = {};
      }
      grouped[t.language][t.key] = t.value;
    });

    res.json({ data: grouped });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// GET /api/translations/:language - Get translations for a specific language
router.get('/:language', async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    const translations = await prisma.translation.findMany({
      where: { language },
      orderBy: { key: 'asc' },
    });

    const result: Record<string, string> = {};
    translations.forEach((t) => {
      result[t.key] = t.value;
    });

    res.json({ data: result });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// Admin routes - require authentication
router.use(authenticateJWT);
router.use(requireRole('admin'));

// POST /api/translations - Create or update translation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { language, key, value } = req.body;

    if (!language || !key || value === undefined) {
      res.status(400).json({ error: 'Language, key, and value are required' });
      return;
    }

    const translation = await prisma.translation.upsert({
      where: {
        language_key: { language, key },
      },
      update: { value },
      create: { language, key, value },
    });

    res.json({ data: translation });
  } catch (error) {
    console.error('Create/update translation error:', error);
    res.status(500).json({ error: 'Failed to save translation' });
  }
});

// POST /api/translations/bulk - Bulk upsert translations
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { translations } = req.body;

    if (!Array.isArray(translations)) {
      res.status(400).json({ error: 'Translations must be an array' });
      return;
    }

    const results = [];
    for (const t of translations) {
      if (!t.language || !t.key || t.value === undefined) continue;
      
      const result = await prisma.translation.upsert({
        where: {
          language_key: { language: t.language, key: t.key },
        },
        update: { value: t.value },
        create: { language: t.language, key: t.key, value: t.value },
      });
      results.push(result);
    }

    res.json({ data: results, count: results.length });
  } catch (error) {
    console.error('Bulk upsert translations error:', error);
    res.status(500).json({ error: 'Failed to save translations' });
  }
});

// DELETE /api/translations/:language/:key - Delete a translation
router.delete('/:language/:key', async (req: Request, res: Response) => {
  try {
    const { language, key } = req.params;

    await prisma.translation.delete({
      where: {
        language_key: { language, key },
      },
    });

    res.json({ message: 'Translation deleted' });
  } catch (error) {
    console.error('Delete translation error:', error);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

export default router;

