import { Router, Request, Response } from 'express';
import { shadowModelService } from '../services/shadowModel.service';
import prisma from '../utils/prisma';

const router = Router();

// GET /api/public/models - Get all active models with pricing (public, no auth required)
router.get('/models', async (req: Request, res: Response) => {
  try {
    const models = await shadowModelService.getActiveModels();
    // Return only public info (no provider token)
    const publicModels = models.map(model => ({
      id: model.id,
      displayName: model.displayName,
      providerModel: model.providerModel,
      pricingInput: model.pricingInput,
      pricingOutput: model.pricingOutput,
      isActive: model.isActive,
    }));
    res.json({ data: publicModels });
  } catch (error) {
    console.error('Get public models error:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// GET /api/public/posts - Get all published blog posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });
    res.json({ data: posts });
  } catch (error) {
    console.error('Get public posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/public/posts/:slug - Get single blog post by slug
router.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findFirst({
      where: { 
        slug,
        isPublished: true 
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ data: post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;

