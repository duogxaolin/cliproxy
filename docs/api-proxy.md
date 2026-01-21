# API Proxy System

The API proxy routes user requests through admin-configured shadow models to backend AI providers, handling authentication, billing, and usage tracking transparently.

## Architecture

```
User Request → API Key Auth → Model Lookup → Transform Request → Provider → Transform Response → User
                    ↓              ↓                                              ↓
              Credit Check    Quota Check                                   Log Usage
                                                                           Deduct Credits
```

## Shadow Model Configuration

Shadow models map user-facing model names to actual provider endpoints and credentials.

### Model Schema
```typescript
interface ShadowModel {
  id: string;
  displayName: string;      // User-facing model name (e.g., "gpt-4")
  providerBaseUrl: string;  // Provider API endpoint
  providerToken: string;    // Provider API key (encrypted)
  providerModel: string;    // Actual model name at provider
  pricingInput: number;     // Cost per 1K input tokens
  pricingOutput: number;    // Cost per 1K output tokens
  isActive: boolean;        // Enable/disable model
}
```

### Example Configuration
| Display Name | Provider URL | Provider Model | Input Price | Output Price |
|--------------|--------------|----------------|-------------|--------------|
| claude-3-opus | https://api.anthropic.com/v1/messages | claude-3-opus-20240229 | $0.015 | $0.075 |
| gpt-4-turbo | https://api.openai.com/v1/chat/completions | gpt-4-turbo-preview | $0.01 | $0.03 |

## Supported Endpoints

### Anthropic-Compatible Endpoint
```
POST /api/v1/messages
```
Compatible with Anthropic's Messages API format.

### OpenAI-Compatible Endpoint
```
POST /api/v1/chat/completions
```
Compatible with OpenAI's Chat Completions API format.

## Request Flow

### 1. Authentication
- API key extracted from `X-API-Key` or `Authorization: Bearer` header
- Key validated against database (hash lookup)
- User status and key expiration checked

### 2. Model Validation
- Requested model name looked up in shadow models
- Model must be active
- If API key has `allowedModels` restriction, model must be in list

### 3. Pre-flight Checks
- **Credit Check**: User must have sufficient credits (minimum 0.001)
- **Quota Check**: If API key has quota limit, usage must be under limit

### 4. Request Transformation
```typescript
// Original request
{ model: "claude-3-opus", messages: [...] }

// Transformed request to provider
{ model: "claude-3-opus-20240229", messages: [...] }
```

### 5. Provider Request
Request sent to provider with:
- `Content-Type: application/json`
- `Authorization: Bearer <provider_token>`
- `x-api-key: <provider_token>` (for Anthropic compatibility)

### 6. Response Processing
- Extract token usage from response
- Calculate cost based on model pricing
- Log request to database
- Deduct credits from user balance
- Increment quota usage
- Transform response (restore original model name)

## Streaming Support

Both endpoints support streaming responses via `stream: true`.

### Stream Processing
1. Set SSE headers (`Content-Type: text/event-stream`)
2. Pipe provider stream to client
3. Parse chunks for token usage
4. Transform model names in chunks
5. Log usage and deduct credits on stream end

## Model Mapping

The proxy transparently maps model names:

| User Requests | Provider Receives | User Sees in Response |
|---------------|-------------------|----------------------|
| `claude-3-opus` | `claude-3-opus-20240229` | `claude-3-opus` |
| `gpt-4` | `gpt-4-turbo-preview` | `gpt-4` |

## Credit Deduction

Cost calculated as:
```
cost = (input_tokens / 1000) * pricing_input + (output_tokens / 1000) * pricing_output
```

Credits deducted only on successful responses (2xx status codes).

## Error Handling

| Error | Status | Response |
|-------|--------|----------|
| Missing API key | 401 | `{"error": "Missing API key"}` |
| Invalid API key | 401 | `{"error": "Invalid API key"}` |
| Expired API key | 401 | `{"error": "API key has expired"}` |
| Model not allowed | 403 | `{"error": "Model not in allowed list"}` |
| Model not found | 400 | `{"error": "Model not found: <name>"}` |
| Insufficient credits | 402 | `{"error": "Insufficient credits"}` |
| Quota exceeded | 429 | `{"error": "Quota exceeded"}` |
| Provider error | 502 | `{"error": "Provider request failed"}` |

## Usage Example

```bash
# Anthropic-compatible request
curl -X POST https://your-domain.com/api/v1/messages \
  -H "X-API-Key: amp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# OpenAI-compatible request
curl -X POST https://your-domain.com/api/v1/chat/completions \
  -H "Authorization: Bearer amp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

