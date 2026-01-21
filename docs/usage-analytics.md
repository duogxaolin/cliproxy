# Usage Analytics

The platform tracks all API requests and provides detailed analytics for users and administrators.

## Request Logging

Every API request is logged with the following data:

```typescript
interface ApiRequest {
  id: string;
  userId: string;
  apiKeyId: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  statusCode: number;
  durationMs: number;
  ipAddress: string | null;
  errorMessage: string | null;
  createdAt: Date;
}
```

## User Analytics

### Usage Summary
```
GET /api/users/me/usage
```

Returns total statistics:
```json
{
  "total_requests": 1523,
  "total_tokens_input": 245000,
  "total_tokens_output": 189000,
  "total_cost": 45.67,
  "requests_today": 42,
  "cost_today": 1.23
}
```

### Usage by Time
```
GET /api/users/me/usage/by-time?start_date=2026-01-01&end_date=2026-01-31&group_by=day
```

Group options: `hour`, `day`, `week`, `month`

Response:
```json
{
  "data": [
    {
      "date": "2026-01-15",
      "requests": 156,
      "tokens_input": 25000,
      "tokens_output": 18000,
      "cost": 3.45
    }
  ]
}
```

### Usage by Model
```
GET /api/users/me/usage/by-model?start_date=2026-01-01&end_date=2026-01-31
```

Response:
```json
{
  "data": [
    {
      "model_id": "uuid",
      "model_name": "claude-3-opus",
      "requests": 500,
      "tokens_input": 80000,
      "tokens_output": 60000,
      "cost": 25.50
    }
  ]
}
```

### Usage by API Key
```
GET /api/users/me/usage/by-key?start_date=2026-01-01&end_date=2026-01-31
```

Response:
```json
{
  "data": [
    {
      "api_key_id": "uuid",
      "api_key_name": "Production Key",
      "key_prefix": "amp_a1b2c3d4",
      "requests": 1000,
      "tokens_input": 160000,
      "tokens_output": 120000,
      "cost": 35.00
    }
  ]
}
```

### Request Logs
```
GET /api/users/me/usage/logs?page=1&limit=20&api_key_id=uuid&model_id=uuid&status_code=200
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "model_name": "claude-3-opus",
      "api_key_name": "Production Key",
      "key_prefix": "amp_a1b2c3d4",
      "tokens_input": 150,
      "tokens_output": 200,
      "cost": 0.0234,
      "status_code": 200,
      "duration_ms": 1523,
      "created_at": "2026-01-21T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1523,
    "total_pages": 77
  }
}
```

## Admin Analytics

### Platform Overview
```
GET /api/admin/analytics?start_date=2026-01-01&end_date=2026-01-31
```

Response:
```json
{
  "total_requests": 50000,
  "total_tokens": 8500000,
  "total_cost": 1250.00,
  "unique_users": 45
}
```

### Analytics by User
```
GET /api/admin/analytics/by-user?start_date=2026-01-01&end_date=2026-01-31&limit=10
```

Top users by cost:
```json
{
  "data": [
    {
      "user_id": "uuid",
      "username": "poweruser",
      "email": "power@example.com",
      "requests": 5000,
      "tokens": 850000,
      "cost": 125.00
    }
  ]
}
```

### Analytics by Model
```
GET /api/admin/analytics/by-model?start_date=2026-01-01&end_date=2026-01-31
```

Response:
```json
{
  "data": [
    {
      "model_id": "uuid",
      "model_name": "claude-3-opus",
      "requests": 25000,
      "tokens": 4250000,
      "cost": 750.00,
      "unique_users": 30
    }
  ]
}
```

### Platform Statistics
```
GET /api/admin/stats
```

Response:
```json
{
  "users": {
    "total": 150,
    "active": 142,
    "suspended": 8
  },
  "api_keys": {
    "total": 450,
    "active": 380
  },
  "models": {
    "total": 10,
    "active": 8
  },
  "requests": {
    "total": 500000,
    "today": 2500
  },
  "revenue": {
    "total": 12500.00,
    "today": 125.00
  }
}
```

## Database Indexes

Optimized indexes for analytics queries:

```sql
-- User + time queries
CREATE INDEX idx_api_requests_user_created ON api_requests(user_id, created_at);

-- API key + time queries
CREATE INDEX idx_api_requests_key_created ON api_requests(api_key_id, created_at);

-- Model + time queries
CREATE INDEX idx_api_requests_model_created ON api_requests(model_id, created_at);
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | ISO 8601 | Start of date range (default: 30 days ago) |
| `end_date` | ISO 8601 | End of date range (default: now) |
| `group_by` | string | Time grouping: hour, day, week, month |
| `api_key_id` | UUID | Filter by specific API key |
| `model_id` | UUID | Filter by specific model |
| `status_code` | number | Filter by HTTP status code |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

