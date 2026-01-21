import { Response } from 'express';
import { blogService, generateSlug } from '../services/blog.service';
import { AuthenticatedRequest } from '../types';

export class BlogController {
  async getAllPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const posts = await blogService.getAllPosts();
      res.json({ data: posts });
    } catch (error) {
      console.error('Get all posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  async getPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const post = await blogService.getPost(id);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ data: post });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }

  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, slug, excerpt, content, coverImage, isPublished } = req.body;
      const authorId = req.user!.userId;

      if (!title || !content) {
        res.status(400).json({ error: 'Missing required fields: title, content' });
        return;
      }

      // Generate slug if not provided
      const postSlug = slug || generateSlug(title);

      const post = await blogService.createPost({
        title,
        slug: postSlug,
        excerpt,
        content,
        coverImage,
        authorId,
        isPublished,
      });

      res.status(201).json({ data: post });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      if (message.includes('already exists')) {
        res.status(400).json({ error: message });
      } else {
        console.error('Create post error:', error);
        res.status(500).json({ error: message });
      }
    }
  }

  async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, slug, excerpt, content, coverImage, isPublished } = req.body;

      const post = await blogService.updatePost(id, {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPublished,
      });

      res.json({ data: post });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update post';
      if (message === 'Post not found') {
        res.status(404).json({ error: message });
      } else if (message.includes('already exists')) {
        res.status(400).json({ error: message });
      } else {
        console.error('Update post error:', error);
        res.status(500).json({ error: message });
      }
    }
  }

  async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await blogService.deletePost(id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete post';
      if (message === 'Post not found') {
        res.status(404).json({ error: message });
      } else {
        console.error('Delete post error:', error);
        res.status(500).json({ error: message });
      }
    }
  }
}

export const blogController = new BlogController();

