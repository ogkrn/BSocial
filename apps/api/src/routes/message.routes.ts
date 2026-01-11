import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/messages/conversations - Get all conversations
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
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
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
    });

    const formattedConversations = conversations.map((cp) => {
      const otherParticipants = cp.conversation.participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.user);

      return {
        id: cp.conversation.id,
        type: cp.conversation.type,
        name: cp.conversation.name,
        participants: otherParticipants,
        lastMessage: cp.conversation.messages[0] || null,
        lastReadAt: cp.lastReadAt,
      };
    });

    res.json({ success: true, data: { conversations: formattedConversations } });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/conversations - Create or get conversation
router.post('/conversations', authenticate, async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const userId = req.user!.id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Participant ID is required' },
      });
    }

    // Check if direct conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
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
        },
      },
    });

    if (existingConversation) {
      return res.json({ success: true, data: existingConversation });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'direct',
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: {
        participants: {
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
        },
      },
    });

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/conversations/:conversationId - Get messages
router.get('/conversations/:conversationId', authenticate, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { cursor, limit = '50' } = req.query;
    const userId = req.user!.id;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw NotFoundError('Conversation not found');
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      take: parseInt(limit as string) + 1,
      ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = messages.length > parseInt(limit as string);
    if (hasMore) messages.pop();

    // Update last read
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/conversations/:conversationId - Send message
router.post(
  '/conversations/:conversationId',
  authenticate,
  [body('content').trim().isLength({ min: 1, max: 2000 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: errors.array()[0].msg },
        });
      }

      const { conversationId } = req.params;
      const { content, mediaUrl, messageType = 'text' } = req.body;
      const userId = req.user!.id;

      // Verify user is participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

      if (!participant) {
        throw NotFoundError('Conversation not found');
      }

      const message = await prisma.$transaction(async (tx) => {
        const newMessage = await tx.message.create({
          data: {
            conversationId,
            senderId: userId,
            content,
            mediaUrl,
            messageType,
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Update conversation timestamp
        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        return newMessage;
      });

      // Emit socket event for real-time
      const io = req.app.get('io');
      io.to(`conversation:${conversationId}`).emit('new-message', message);

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/messages/unread - Get unread count
router.get('/unread', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: { userId },
          },
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    next(error);
  }
});

export default router;
