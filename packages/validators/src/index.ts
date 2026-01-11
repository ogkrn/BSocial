import { z } from 'zod';

// Email validation for @uktech.net.in domain
export const universityEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .refine(
    (email) => email.toLowerCase().endsWith('@uktech.net.in'),
    'Only UTU university emails (@uktech.net.in) are allowed'
  );

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

// Full name validation
export const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters');

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

// Login schema
export const loginSchema = z.object({
  email: universityEmailSchema,
});

// Register schema
export const registerSchema = z.object({
  email: universityEmailSchema,
  fullName: fullNameSchema,
  username: usernameSchema,
  branch: z.string().max(100).optional(),
  year: z.string().max(20).optional(),
});

// Verify OTP schema
export const verifyOtpSchema = z.object({
  email: universityEmailSchema,
  otp: otpSchema,
});

// Post schema
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(2000, 'Post cannot exceed 2000 characters'),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
  pageId: z.string().uuid().optional(),
});

// Comment schema
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment cannot exceed 500 characters'),
  postId: z.string().uuid(),
});

// Page schema
export const createPageSchema = z.object({
  name: z
    .string()
    .min(3, 'Page name must be at least 3 characters')
    .max(50, 'Page name cannot exceed 50 characters'),
  description: z.string().max(500).optional(),
  category: z.enum([
    'dramatics',
    'sports',
    'tech',
    'cultural',
    'academic',
    'music',
    'art',
    'other',
  ]),
});

// Message schema
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters'),
  conversationId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
});

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
  branch: z.string().max(100).optional(),
  year: z.string().max(20).optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
