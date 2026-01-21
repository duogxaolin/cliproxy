import { BlogPost } from '@prisma/client';
import prisma from '../utils/prisma';

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  authorId: string;
  isPublished?: boolean;
}

export interface UpdateBlogPostData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  isPublished?: boolean;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class BlogService {
  async createPost(data: CreateBlogPostData): Promise<BlogPost> {
    // Check if slug already exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error('Post with this slug already exists');
    }

    return prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        authorId: data.authorId,
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });
  }

  async updatePost(id: string, data: UpdateBlogPostData): Promise<BlogPost> {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Post not found');
    }

    // Check if new slug conflicts
    if (data.slug && data.slug !== existing.slug) {
      const conflict = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });
      if (conflict) {
        throw new Error('Post with this slug already exists');
      }
    }

    // Set publishedAt when publishing for the first time
    let publishedAt = existing.publishedAt;
    if (data.isPublished && !existing.isPublished) {
      publishedAt = new Date();
    }

    return prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
      },
    });
  }

  async deletePost(id: string): Promise<BlogPost> {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Post not found');
    }

    return prisma.blogPost.delete({
      where: { id },
    });
  }

  async getPost(id: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });
  }

  async getAllPosts(): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });
  }
}

export const blogService = new BlogService();

