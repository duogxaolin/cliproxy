import { ShadowModel } from '@prisma/client';
import { shadowModelService } from './shadowModel.service';
import { creditService } from './credit.service';
import { usageService } from './usage.service';

export interface ProxyRequestParams {
  userId: string;
  apiKeyId: string;
  modelName: string;
  requestBody: any;
  headers: Record<string, string>;
  ipAddress?: string;
}

export interface ProxyResponse {
  data: any;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  model: ShadowModel;
}

export interface StreamCallbacks {
  onData: (chunk: string) => void;
  onEnd: (tokensInput: number, tokensOutput: number) => void;
  onError: (error: Error) => void;
}

export class ProxyService {
  async proxyRequest(params: ProxyRequestParams): Promise<ProxyResponse> {
    const { userId, apiKeyId, modelName, requestBody, ipAddress } = params;
    const startTime = Date.now();

    // Find shadow model by display name
    const model = await shadowModelService.getModelByDisplayName(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    if (!model.isActive) {
      throw new Error(`Model is not active: ${modelName}`);
    }

    // Check user has sufficient credits (estimate based on input)
    const hasCredits = await creditService.checkSufficientCredits(userId, 0.001);
    if (!hasCredits) {
      throw new Error('Insufficient credits');
    }

    // Check quota
    const quotaCheck = await usageService.checkQuota(apiKeyId);
    if (!quotaCheck.allowed) {
      throw new Error('Quota exceeded');
    }

    // Transform request - replace model name with provider model
    const transformedBody = {
      ...requestBody,
      model: model.providerModel,
    };

    // Make request to provider
    let response: Response;
    let responseData: any;
    let statusCode: number;

    // Build full endpoint URL - auto-detect and append path if needed
    const { fullUrl, isAnthropicFormat } = this.buildProviderUrl(model.providerBaseUrl);

    // Build headers based on provider format
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAnthropicFormat) {
      headers['x-api-key'] = model.providerToken;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      // OpenAI and other providers use Bearer token
      headers['Authorization'] = `Bearer ${model.providerToken}`;
    }

    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(transformedBody),
      });

      statusCode = response.status;
      responseData = await response.json();
    } catch (error) {
      const durationMs = Date.now() - startTime;
      await usageService.logRequest({
        userId,
        apiKeyId,
        modelId: model.id,
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        statusCode: 502,
        durationMs,
        ipAddress,
        errorMessage: error instanceof Error ? error.message : 'Provider request failed',
      });
      throw new Error('Provider request failed');
    }

    const durationMs = Date.now() - startTime;

    // Extract token usage from response
    const tokensInput = this.extractInputTokens(responseData);
    const tokensOutput = this.extractOutputTokens(responseData);

    // Calculate cost
    const cost = this.calculateCost(tokensInput, tokensOutput, model);

    // Log the request
    await usageService.logRequest({
      userId,
      apiKeyId,
      modelId: model.id,
      tokensInput,
      tokensOutput,
      cost,
      statusCode,
      durationMs,
      ipAddress,
    });

    // Deduct credits if request was successful
    if (statusCode >= 200 && statusCode < 300 && cost > 0) {
      await creditService.deductCredits(userId, cost, {
        apiKeyId,
        modelId: model.id,
        tokensInput,
        tokensOutput,
      });

      // Increment quota used
      await usageService.incrementQuotaUsed(apiKeyId);
    }

    // Transform response - restore original model name
    const transformedResponse = this.transformResponse(responseData, modelName);

    return {
      data: transformedResponse,
      tokensInput,
      tokensOutput,
      cost,
      model,
    };
  }

  async proxyStreamRequest(
    params: ProxyRequestParams,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const { userId, apiKeyId, modelName, requestBody, ipAddress } = params;
    const startTime = Date.now();

    // Find shadow model
    const model = await shadowModelService.getModelByDisplayName(modelName);
    if (!model) {
      callbacks.onError(new Error(`Model not found: ${modelName}`));
      return;
    }

    if (!model.isActive) {
      callbacks.onError(new Error(`Model is not active: ${modelName}`));
      return;
    }

    // Check credits and quota
    const hasCredits = await creditService.checkSufficientCredits(userId, 0.001);
    if (!hasCredits) {
      callbacks.onError(new Error('Insufficient credits'));
      return;
    }

    const quotaCheck = await usageService.checkQuota(apiKeyId);
    if (!quotaCheck.allowed) {
      callbacks.onError(new Error('Quota exceeded'));
      return;
    }

    // Transform request
    const transformedBody = {
      ...requestBody,
      model: model.providerModel,
      stream: true,
    };

    // Build full endpoint URL - auto-detect and append path if needed
    const { fullUrl, isAnthropicFormat } = this.buildProviderUrl(model.providerBaseUrl);

    // Build headers based on provider format
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAnthropicFormat) {
      headers['x-api-key'] = model.providerToken;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${model.providerToken}`;
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(transformedBody),
      });
    } catch (error) {
      callbacks.onError(new Error('Provider request failed'));
      return;
    }

    if (!response.ok || !response.body) {
      callbacks.onError(new Error(`Provider returned status ${response.status}`));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let tokensInput = 0;
    let tokensOutput = 0;
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              // Extract tokens from streaming response
              if (parsed.usage) {
                tokensInput = parsed.usage.input_tokens || parsed.usage.prompt_tokens || tokensInput;
                tokensOutput = parsed.usage.output_tokens || parsed.usage.completion_tokens || tokensOutput;
              }
              // Transform model name back
              if (parsed.model) {
                parsed.model = modelName;
              }
              callbacks.onData(`data: ${JSON.stringify(parsed)}\n\n`);
            } catch {
              callbacks.onData(line + '\n');
            }
          } else if (line.trim()) {
            callbacks.onData(line + '\n');
          }
        }
      }

      const durationMs = Date.now() - startTime;

      // Log request
      const cost = this.calculateCost(tokensInput, tokensOutput, model);
      await usageService.logRequest({
        userId,
        apiKeyId,
        modelId: model.id,
        tokensInput,
        tokensOutput,
        cost,
        statusCode: response.status,
        durationMs,
        ipAddress,
      });

      // Deduct credits
      if (cost > 0) {
        await creditService.deductCredits(userId, cost, {
          apiKeyId,
          modelId: model.id,
          tokensInput,
          tokensOutput,
        });
        await usageService.incrementQuotaUsed(apiKeyId);
      }

      callbacks.onEnd(tokensInput, tokensOutput);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Stream processing failed'));
    }
  }

  private extractInputTokens(response: any): number {
    // Anthropic format
    if (response.usage?.input_tokens) {
      return response.usage.input_tokens;
    }
    // OpenAI format
    if (response.usage?.prompt_tokens) {
      return response.usage.prompt_tokens;
    }
    return 0;
  }

  private extractOutputTokens(response: any): number {
    // Anthropic format
    if (response.usage?.output_tokens) {
      return response.usage.output_tokens;
    }
    // OpenAI format
    if (response.usage?.completion_tokens) {
      return response.usage.completion_tokens;
    }
    return 0;
  }

  private calculateCost(tokensInput: number, tokensOutput: number, model: ShadowModel): number {
    const inputCost = (tokensInput / 1000) * Number(model.pricingInput);
    const outputCost = (tokensOutput / 1000) * Number(model.pricingOutput);
    return inputCost + outputCost;
  }

  private transformResponse(response: any, originalModelName: string): any {
    // Replace provider model name with display name
    if (response.model) {
      response.model = originalModelName;
    }
    return response;
  }

  /**
   * Build full provider URL by auto-detecting and appending endpoint path if needed
   * - If URL already contains /messages or /chat/completions, use as-is
   * - If URL contains 'anthropic', append /v1/messages
   * - Otherwise, append /v1/chat/completions (OpenAI compatible)
   */
  private buildProviderUrl(baseUrl: string): { fullUrl: string; isAnthropicFormat: boolean } {
    const url = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes

    // Check if URL already has endpoint path
    if (url.includes('/messages')) {
      return { fullUrl: url, isAnthropicFormat: true };
    }
    if (url.includes('/chat/completions')) {
      return { fullUrl: url, isAnthropicFormat: false };
    }

    // Auto-detect provider type from URL
    const isAnthropicProvider = url.toLowerCase().includes('anthropic');

    if (isAnthropicProvider) {
      return { fullUrl: `${url}/v1/messages`, isAnthropicFormat: true };
    } else {
      // Default to OpenAI compatible format
      return { fullUrl: `${url}/v1/chat/completions`, isAnthropicFormat: false };
    }
  }
}

export const proxyService = new ProxyService();

