import { User, UserRole } from '@prisma/client';
import prisma from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse, TokenPair } from '../types/auth.types';

const FIRST_USER_IS_ADMIN = process.env.FIRST_USER_IS_ADMIN === 'true';

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Determine role - first user can be admin if env flag is set
    let role: UserRole = 'user';
    if (FIRST_USER_IS_ADMIN) {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        role = 'admin';
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user and user_credits in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash,
          role,
        },
      });

      // Create user_credits record with balance 0
      await tx.userCredits.create({
        data: {
          userId: newUser.id,
          balance: 0,
          totalPurchased: 0,
          totalConsumed: 0,
        },
      });

      return newUser;
    });

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is suspended');
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshTokenStr: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshTokenStr);
    
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const token = generateToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    return { token, refreshToken: newRefreshToken };
  }

  async validateUser(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId, status: 'active' },
    });
  }

  async logout(): Promise<void> {
    // With JWT, logout is handled client-side by removing the token
    // For enhanced security, you could implement a token blacklist with Redis
    return;
  }
}

export const authService = new AuthService();

