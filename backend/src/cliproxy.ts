import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import proxyRoutes from './routes/proxy.routes';

dotenv.config();

const app = express();
const PORT = process.env.CLI_PROXY_PORT || 4569;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for CLI usage
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
    service: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    service: 'cli-proxy',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CLI Proxy',
    version: '1.0.0',
    endpoints: {
      anthropic: 'POST /v1/messages',
      openai: 'POST /v1/chat/completions',
      health: 'GET /health',
    },
  });
});

// Proxy routes - mount at /v1 for CLI compatibility
// This allows: POST /v1/messages, POST /v1/chat/completions
app.use('/v1', proxyRoutes);

// Also support /api/v1 for consistency
app.use('/api/v1', proxyRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('CLI Proxy error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function main() {
  try {
    await prisma.$connect();
    console.log('CLI Proxy: Database connected');
    
    app.listen(PORT, () => {
      console.log(`CLI Proxy running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start CLI Proxy:', error);
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

export { app };

