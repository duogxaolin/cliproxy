import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

    // Extract base64 data
    const matches = image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: 'Invalid image format. Expected base64 data URL' });
      return;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Return URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/uploads/${uniqueFilename}`;

    res.json({ 
      success: true,
      url: imageUrl,
      filename: uniqueFilename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;

