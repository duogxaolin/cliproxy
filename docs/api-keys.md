# API Key Management

API keys provide programmatic access to the proxy endpoints. Users can create multiple keys with different permissions and quotas.

## Key Format

### Structure
```
amp_<64 hex characters>
```

- **Prefix**: `amp_` (API Marketplace Platform)
- **Random Part**: 32 bytes (64 hex characters) generated using `crypto.randomBytes()`
- **Total Length**: 68 characters

### Example
```
amp_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678
```

### Key Prefix
For display purposes, only the first 12 characters are stored as `keyPrefix`:
```
amp_a1b2c3d4
```

## Key Generation and Hashing

### Generation
```typescript
function generateApiKey(): { key: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32);
  const key = 'amp_' + randomBytes.toString('hex');
  const prefix = key.substring(0, 12);
  return { key, prefix };
}
```

### Hashing
Keys are hashed using SHA-256 before storage:
```typescript
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
```

**Important**: The full API key is only returned once at creation time. It cannot be retrieved later.

## Data Model

```typescript
interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;        // SHA-256 hash of full key
  keyPrefix: string;      // First 12 chars for display
  name: string;           // User-defined name
  allowedModels: string[] | null;  // Model restrictions
  quotaLimit: number | null;       // Max requests (null = unlimited)
  quotaUsed: number;      // Current request count
  expiresAt: Date | null; // Expiration date (null = never)
  createdAt: Date;
  revokedAt: Date | null; // Revocation timestamp
}
```

## Allowed Models Configuration

Restrict which models an API key can access:

### No Restriction (Default)
```json
{
  "allowed_models": null
}
```
Key can access all active models.

### Specific Models
```json
{
  "allowed_models": ["claude-3-opus", "gpt-4"]
}
```
Key can only access listed models.

### Validation
```typescript
if (apiKey.allowedModels && apiKey.allowedModels.length > 0) {
  if (!apiKey.allowedModels.includes(requestedModel)) {
    return res.status(403).json({ error: 'Model not in allowed list' });
  }
}
```

## Quota Limits

### Configuration
```json
{
  "quota_limit": 1000
}
```
- `null`: Unlimited requests
- `number`: Maximum requests allowed

### Tracking
- `quotaUsed` incremented after each successful request
- Checked before processing requests

### Quota Check
```typescript
if (apiKey.quotaLimit !== null && apiKey.quotaUsed >= apiKey.quotaLimit) {
  return res.status(429).json({ error: 'Quota exceeded' });
}
```

## Expiration

### Setting Expiration
```json
{
  "expires_at": "2026-12-31T23:59:59Z"
}
```
- `null`: Never expires
- `Date`: Key expires at specified time

### Validation
```typescript
if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
  return res.status(401).json({ error: 'API key has expired' });
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/api-keys` | List user's API keys |
| POST | `/api/api-keys` | Create new API key |
| GET | `/api/api-keys/:id` | Get key details |
| PUT | `/api/api-keys/:id` | Update key settings |
| DELETE | `/api/api-keys/:id` | Revoke API key |

## Create API Key

### Request
```bash
curl -X POST /api/api-keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Key",
    "allowed_models": ["claude-3-opus"],
    "quota_limit": 10000,
    "expires_at": "2026-12-31T23:59:59Z"
  }'
```

### Response
```json
{
  "id": "uuid",
  "name": "Production Key",
  "key": "amp_a1b2c3d4...",
  "key_prefix": "amp_a1b2c3d4",
  "allowed_models": ["claude-3-opus"],
  "quota_limit": 10000,
  "quota_used": 0,
  "expires_at": "2026-12-31T23:59:59Z",
  "created_at": "2026-01-21T10:00:00Z",
  "revoked_at": null
}
```

**Note**: The `key` field is only included in the creation response.

## Revocation

Revoking a key sets `revokedAt` timestamp. Revoked keys cannot be used for authentication.

```bash
curl -X DELETE /api/api-keys/:id \
  -H "Authorization: Bearer <jwt_token>"
```

## Security Best Practices

1. **Store keys securely**: Never commit API keys to version control
2. **Use environment variables**: Store keys in environment variables
3. **Rotate regularly**: Create new keys and revoke old ones periodically
4. **Limit scope**: Use `allowed_models` to restrict access
5. **Set quotas**: Prevent runaway costs with quota limits
6. **Set expiration**: Use expiration dates for temporary access
7. **Monitor usage**: Review usage statistics regularly

