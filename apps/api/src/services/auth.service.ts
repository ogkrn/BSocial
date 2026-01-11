import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';
import { sendOtpEmail, sendWelcomeEmail } from './email.service.js';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler.js';

// Generate 6-digit OTP
const generateOtp = (): string => {
  return randomInt(100000, 999999).toString();
};

// Generate tokens
const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

// Validate university email domain
const validateEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  return domain === config.allowedEmailDomain;
};

export const authService = {
  // Register new user - Step 1: Send OTP
  async initiateRegistration(email: string) {
    // Validate email domain
    if (!validateEmailDomain(email)) {
      throw BadRequestError(`Only @${config.allowedEmailDomain} emails are allowed`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ConflictError('User with this email already exists');
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

    // Delete any existing OTPs for this email
    await prisma.otpCode.deleteMany({
      where: { email, type: 'verification' },
    });

    // Save OTP
    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        type: 'verification',
        expiresAt,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return { message: 'OTP sent to your email' };
  },

  // Register new user - Step 2: Verify OTP and create user
  async completeRegistration(
    email: string,
    otp: string,
    password: string,
    fullName: string,
    username: string,
    branch?: string,
    year?: string
  ) {
    // Validate email domain
    if (!validateEmailDomain(email)) {
      throw BadRequestError(`Only @${config.allowedEmailDomain} emails are allowed`);
    }

    // Verify OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        type: 'verification',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw BadRequestError('Invalid or expired OTP');
    }

    // Check if username is taken
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw ConflictError('Username is already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        username,
        branch,
        year,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        branch: true,
        year: true,
      },
    });

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send welcome email
    await sendWelcomeEmail(email, fullName);

    return { user, accessToken, refreshToken };
  },

  // Login with email and password
  async login(email: string, password: string) {
    // Validate email domain
    if (!validateEmailDomain(email)) {
      throw BadRequestError(`Only @${config.allowedEmailDomain} emails are allowed`);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        branch: user.branch,
        year: user.year,
      },
      accessToken,
      refreshToken,
    };
  },

  // Refresh access token
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
        email: string;
      };
    } catch {
      throw UnauthorizedError('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw UnauthorizedError('Refresh token not found or expired');
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId, decoded.email);

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  },

  // Logout
  async logout(refreshToken: string) {
    // Delete refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: 'Logged out successfully' };
  },

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        branch: true,
        year: true,
        isVerified: true,
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

    return user;
  },
};
