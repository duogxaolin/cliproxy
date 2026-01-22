import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';
import { uploadService } from '../services/upload.service';

const router = Router();

// All upload routes require JWT authentication and admin role
router.use(authenticateJWT);
router.use(requireRole('admin'));

// POST /api/upload/image - Upload image (base64)
router.post('/image', async (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    const result = await uploadService.uploadImage(image, filename);
    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    res.status(500).json({ error: message });
  }
});

// GET /api/upload/config - Get current upload configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const storageType = await uploadService.getStorageType();
    const r2Config = await uploadService.getR2Config();

    res.json({
      storageType,
      r2Configured: !!r2Config,
    });
  } catch (error) {
    console.error('Get upload config error:', error);
    res.status(500).json({ error: 'Failed to get upload configuration' });
  }
});

export default router;

