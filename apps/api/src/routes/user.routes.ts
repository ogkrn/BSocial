import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/users/search - Search users (must be before /:username)
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q) {
      return res.json({ success: true, data: { users: [] } });
    }

    const searchTerm = (q as string).toLowerCase();
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: searchTerm } },
          { username: { contains: searchTerm } },
        ],
        isActive: true,
      },
      take: parseInt(limit as string),
      select: {
        id: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        branch: true,
      },
    });

    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:username - Get user profile
router.get('/:username', authenticate, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        branch: true,
        year: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw NotFoundError('User not found');
    }

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.id,
          followingId: user.id,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...user,
        isFollowing: !!isFollowing,
        isOwnProfile: req.user!.id === user.id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Update current user's profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { fullName, bio, branch, year, avatarUrl } = req.body;
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(branch && { branch }),
        ...(year && { year }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        branch: true,
        year: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:userId/follow - Follow a user
router.post('/:userId/follow', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot follow yourself' },
      });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    res.json({ success: true, data: { message: 'Followed successfully' } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:userId/follow - Unfollow a user
router.delete('/:userId/follow', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    res.json({ success: true, data: { message: 'Unfollowed successfully' } });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:userId/followers - Get user's followers
router.get('/:userId/followers', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = '20' } = req.query;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      take: parseInt(limit as string) + 1,
      ...(cursor && { cursor: { followerId_followingId: JSON.parse(cursor as string) } }),
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = followers.length > parseInt(limit as string);
    if (hasMore) followers.pop();

    res.json({
      success: true,
      data: {
        followers: followers.map((f) => f.follower),
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:userId/following - Get users this user follows
router.get('/:userId/following', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = '20' } = req.query;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      take: parseInt(limit as string),
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        following: following.map((f) => f.following),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
