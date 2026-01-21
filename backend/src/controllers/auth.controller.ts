import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/auth.types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      // Validate input
      if (!data.email || !data.username || !data.password) {
        res.status(400).json({ error: 'Email, username, and password are required' });
        return;
      }

      if (data.password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      if (message.includes('already')) {
        res.status(409).json({ error: message });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({ error: message });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;

      // Validate input
      if (!data.email || !data.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.login(data);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message === 'Invalid credentials') {
        res.status(401).json({ error: message });
      } else if (message === 'Account is suspended') {
        res.status(403).json({ error: message });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout();
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      if (message.includes('Invalid') || message.includes('not found')) {
        res.status(401).json({ error: message });
      } else {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
      }
    }
  }
}

export const authController = new AuthController();

