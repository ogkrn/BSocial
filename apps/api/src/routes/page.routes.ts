import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// GET /api/pages - Get all pages
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, limit = '20', search } = req.query;

    const pages = await prisma.page.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      take: parseInt(limit as string),
      orderBy: { followersCount: 'desc' },
      include: {
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
    });

    res.json({ success: true, data: { pages } });
  } catch (error) {
    next(error);
  }
});

// POST /api/pages - Create a page
router.post(
  '/',
  authenticate,
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('category').isIn([
      'dramatics',
      'sports',
      'tech',
      'cultural',
      'academic',
      'music',
      'art',
      'photography',
      'social',
      'other',
    ]),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: errors.array()[0].msg },
        });
      }

      const { name, description, category } = req.body;
      const slug = generateSlug(name);

      // Check if slug exists
      const existingPage = await prisma.page.findUnique({ where: { slug } });
      if (existingPage) {
        return res.status(400).json({
          success: false,
          error: { message: 'A page with a similar name already exists' },
        });
      }

      const page = await prisma.$transaction(async (tx) => {
        const newPage = await tx.page.create({
          data: {
            name,
            slug,
            description,
            category,
            createdById: req.user!.id,
          },
        });

        // Add creator as admin
        await tx.pageMember.create({
          data: {
            pageId: newPage.id,
            userId: req.user!.id,
            role: 'admin',
          },
        });

        return newPage;
      });

      res.status(201).json({ success: true, data: page });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/pages/:slug - Get page by slug
router.get('/:slug', authenticate, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            followers: true,
            posts: true,
            members: true,
          },
        },
      },
    });

    if (!page) {
      throw NotFoundError('Page not found');
    }

    // Check if current user follows the page
    const isFollowing = await prisma.pageFollow.findUnique({
      where: {
        userId_pageId: {
          userId: req.user!.id,
          pageId: page.id,
        },
      },
    });

    // Check if current user is a member
    const membership = await prisma.pageMember.findUnique({
      where: {
        pageId_userId: {
          pageId: page.id,
          userId: req.user!.id,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...page,
        isFollowing: !!isFollowing,
        userRole: membership?.role || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/pages/:pageId/follow - Follow a page
router.post('/:pageId/follow', authenticate, async (req, res, next) => {
  try {
    const { pageId } = req.params;

    await prisma.$transaction([
      prisma.pageFollow.create({
        data: {
          userId: req.user!.id,
          pageId,
        },
      }),
      prisma.page.update({
        where: { id: pageId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    res.json({ success: true, data: { message: 'Page followed' } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/pages/:pageId/follow - Unfollow a page
router.delete('/:pageId/follow', authenticate, async (req, res, next) => {
  try {
    const { pageId } = req.params;

    await prisma.$transaction([
      prisma.pageFollow.delete({
        where: {
          userId_pageId: {
            userId: req.user!.id,
            pageId,
          },
        },
      }),
      prisma.page.update({
        where: { id: pageId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    res.json({ success: true, data: { message: 'Page unfollowed' } });
  } catch (error) {
    next(error);
  }
});

// GET /api/pages/:pageId/posts - Get page posts
router.get('/:pageId/posts', authenticate, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { limit = '20', cursor } = req.query;

    const posts = await prisma.post.findMany({
      where: { pageId },
      take: parseInt(limit as string) + 1,
      ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const hasMore = posts.length > parseInt(limit as string);
    if (hasMore) posts.pop();

    res.json({
      success: true,
      data: {
        posts,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pages/categories - Get all categories
router.get('/meta/categories', authenticate, async (req, res, next) => {
  try {
    const categories = [
      { id: 'dramatics', name: 'Dramatics', icon: '🎭' },
      { id: 'sports', name: 'Sports', icon: '⚽' },
      { id: 'tech', name: 'Technology', icon: '💻' },
      { id: 'cultural', name: 'Cultural', icon: '🎨' },
      { id: 'academic', name: 'Academic', icon: '📚' },
      { id: 'music', name: 'Music', icon: '🎵' },
      { id: 'art', name: 'Art', icon: '🎨' },
      { id: 'photography', name: 'Photography', icon: '📷' },
      { id: 'social', name: 'Social', icon: '🤝' },
      { id: 'other', name: 'Other', icon: '📌' },
    ];

    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
});

export default router;
