import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/posts/feed - Get feed
router.get('/feed', authenticate, async (req, res, next) => {
  try {
    const { cursor, limit = '20' } = req.query;
    const userId = req.user!.id;

    // Get IDs of users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own posts

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followingIds },
        visibility: 'public',
      },
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

    // Check if current user liked each post
    const postIds = posts.map((p) => p.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }));

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        hasMore,
        nextCursor: hasMore ? posts[posts.length - 1]?.id : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create a post
router.post(
  '/',
  authenticate,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Content must be 1-5000 characters'),
    body('mediaUrls').optional().isArray(),
    body('postType').optional().isIn(['text', 'image', 'poll', 'event']),
    body('visibility').optional().isIn(['public', 'followers', 'page_members']),
    body('pageId').optional().isUUID(),
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

      const { content, mediaUrls = [], postType = 'text', visibility = 'public', pageId } = req.body;

      const post = await prisma.post.create({
        data: {
          userId: req.user!.id,
          content,
          mediaUrls,
          postType,
          visibility,
          pageId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/posts/:postId - Get a single post
router.get('/:postId', authenticate, async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      throw NotFoundError('Post not found');
    }

    // Check if user liked this post
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...post,
        isLiked: !!like,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:postId/like - Like a post
router.post('/:postId/like', authenticate, async (req, res, next) => {
  try {
    const { postId } = req.params;

    await prisma.$transaction([
      prisma.like.create({
        data: {
          userId: req.user!.id,
          postId,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    res.json({ success: true, data: { message: 'Post liked' } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:postId/like - Unlike a post
router.delete('/:postId/like', authenticate, async (req, res, next) => {
  try {
    const { postId } = req.params;

    await prisma.$transaction([
      prisma.like.delete({
        where: {
          userId_postId: {
            userId: req.user!.id,
            postId,
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    res.json({ success: true, data: { message: 'Post unliked' } });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:postId/comments - Get comments
router.get('/:postId/comments', authenticate, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { limit = '20' } = req.query;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      take: parseInt(limit as string),
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
          select: { replies: true },
        },
      },
    });

    res.json({ success: true, data: { comments } });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:postId/comments - Add comment
router.post(
  '/:postId/comments',
  authenticate,
  [body('content').trim().isLength({ min: 1, max: 1000 })],
  async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { content, parentId } = req.body;

      const comment = await prisma.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
          data: {
            postId,
            userId: req.user!.id,
            content,
            parentId,
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: { commentsCount: { increment: 1 } },
        });

        return newComment;
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/posts/:postId - Delete a post
router.delete('/:postId', authenticate, async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw NotFoundError('Post not found');
    }

    if (post.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this post' },
      });
    }

    await prisma.post.delete({ where: { id: postId } });

    res.json({ success: true, data: { message: 'Post deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
