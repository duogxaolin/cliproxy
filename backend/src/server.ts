import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import proxyRoutes from './routes/proxy.routes';
import apiKeyRoutes from './routes/apiKey.routes';
import userRoutes from './routes/user.routes';
import publicRoutes from './routes/public.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
    redis?: string;
    version?: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
  }

  // Add version info if available
  health.version = process.env.npm_package_version || '1.0.0';

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({ message: 'API Marketplace Platform API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Public routes (no auth required)
app.use('/api/public', publicRoutes);

// User routes
app.use('/api/users', userRoutes);

// API Key routes
app.use('/api/api-keys', apiKeyRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Proxy routes (API v1)
app.use('/api/v1', proxyRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();

export { app, prisma };

