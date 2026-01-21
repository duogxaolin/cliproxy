import { Response } from 'express';
import { proxyService } from '../services/proxy.service';
import { ApiKeyAuthenticatedRequest } from '../types';

export class ProxyController {
  // POST /api/v1/messages - Anthropic-compatible endpoint
  async handleAnthropicMessages(req: ApiKeyAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.apiKey) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { model, stream } = req.body;

      if (!model) {
        res.status(400).json({ error: 'Model is required' });
        return;
      }

      // Check if model is in allowed list
      if (req.apiKey.allowedModels && req.apiKey.allowedModels.length > 0) {
        if (!req.apiKey.allowedModels.includes(model)) {
          res.status(403).json({ error: 'Model not in allowed list' });
          return;
        }
      }

      const ipAddress = req.ip || req.socket.remoteAddress;

      if (stream) {
        await this.handleStreamRequest(req, res, model, ipAddress);
      } else {
        await this.handleNonStreamRequest(req, res, model, ipAddress);
      }
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  // POST /api/v1/chat/completions - OpenAI-compatible endpoint
  async handleOpenAIChatCompletions(req: ApiKeyAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.apiKey) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { model, stream } = req.body;

      if (!model) {
        res.status(400).json({ error: 'Model is required' });
        return;
      }

      // Check if model is in allowed list
      if (req.apiKey.allowedModels && req.apiKey.allowedModels.length > 0) {
        if (!req.apiKey.allowedModels.includes(model)) {
          res.status(403).json({ error: 'Model not in allowed list' });
          return;
        }
      }

      const ipAddress = req.ip || req.socket.remoteAddress;

      if (stream) {
        await this.handleStreamRequest(req, res, model, ipAddress);
      } else {
        await this.handleNonStreamRequest(req, res, model, ipAddress);
      }
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  private async handleNonStreamRequest(
    req: ApiKeyAuthenticatedRequest,
    res: Response,
    model: string,
    ipAddress?: string
  ): Promise<void> {
    const result = await proxyService.proxyRequest({
      userId: req.apiKey!.userId,
      apiKeyId: req.apiKey!.keyId,
      modelName: model,
      requestBody: req.body,
      headers: req.headers as Record<string, string>,
      ipAddress,
    });

    res.json(result.data);
  }

  private async handleStreamRequest(
    req: ApiKeyAuthenticatedRequest,
    res: Response,
    model: string,
    ipAddress?: string
  ): Promise<void> {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await proxyService.proxyStreamRequest(
      {
        userId: req.apiKey!.userId,
        apiKeyId: req.apiKey!.keyId,
        modelName: model,
        requestBody: req.body,
        headers: req.headers as Record<string, string>,
        ipAddress,
      },
      {
        onData: (chunk: string) => {
          res.write(chunk);
        },
        onEnd: () => {
          res.write('data: [DONE]\n\n');
          res.end();
        },
        onError: (error: Error) => {
          const errorResponse = JSON.stringify({ error: error.message });
          res.write(`data: ${errorResponse}\n\n`);
          res.end();
        },
      }
    );
  }

  private handleProxyError(error: unknown, res: Response): void {
    const message = error instanceof Error ? error.message : 'Proxy request failed';

    if (message.includes('not found')) {
      res.status(404).json({ error: message });
    } else if (message.includes('Insufficient credits')) {
      res.status(402).json({ error: message });
    } else if (message.includes('Quota exceeded')) {
      res.status(429).json({ error: message });
    } else if (message.includes('not active')) {
      res.status(404).json({ error: message });
    } else if (message.includes('Provider')) {
      res.status(502).json({ error: message });
    } else {
      console.error('Proxy error:', error);
      res.status(500).json({ error: message });
    }
  }
}

export const proxyController = new ProxyController();

