# API Marketplace Platform - Technical Design

## Architecture Overview

A monolithic Node.js application with React frontend, PostgreSQL database, and Redis cache. The system acts as an API proxy that routes requests through admin-configured shadow models while handling authentication, billing, and analytics.

```mermaid
flowchart TB
    subgraph Frontend
        UI[React + Vite + TailwindCSS]
    end
    
    subgraph Backend
        API[Express API Server]
        Proxy[API Proxy Middleware]
        Auth[JWT Auth]
    end
    
    subgraph Data
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
    end
    
    subgraph External
        CLI[CLI Proxy Service]
        Providers[Backend API Providers]
    end
    
    UI --> API
    API --> Auth
    API --> PG
    API --> Redis
    Proxy --> Providers
    UI -.->|iframe| CLI
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Node.js + Express + TypeScript | API server and proxy |
| Frontend | React + Vite + TailwindCSS | User interface (white theme) |
| Database | PostgreSQL + Prisma ORM | Persistent data storage |
| Cache | Redis | Sessions, rate limiting, caching |
| Auth | JWT + bcrypt | Authentication and API key hashing |
| Container | Docker + Docker Compose | Deployment and orchestration |

## Database Schema

```mermaid
erDiagram
    users ||--o{ user_credits : has
    users ||--o{ api_keys : owns
    users ||--o{ credit_transactions : has
    users ||--o{ api_requests : makes
    api_keys ||--o{ api_requests : used_in
    shadow_models ||--o{ api_requests : routes_to

    users {
        uuid id PK
        string email UK
        string username UK
        string password_hash
        enum role "admin|user"
        enum status "active|suspended"
        timestamp created_at
        timestamp updated_at
    }

    user_credits {
        uuid id PK
        uuid user_id FK
        decimal balance
        decimal total_purchased
        decimal total_consumed
        timestamp updated_at
    }

    credit_transactions {
        uuid id PK
        uuid user_id FK
        enum type "grant|deduction|refund"
        decimal amount
        decimal balance_after
        string description
        timestamp created_at
    }

    api_keys {
        uuid id PK
        uuid user_id FK
        string key_hash
        string key_prefix
        string name
        jsonb allowed_models
        integer quota_limit
        integer quota_used
        timestamp expires_at
        timestamp created_at
        timestamp revoked_at
    }

    shadow_models {
        uuid id PK
        string display_name UK
        string provider_base_url
        string provider_token_encrypted
        string provider_model
        decimal pricing_input
        decimal pricing_output
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    api_requests {
        uuid id PK
        uuid user_id FK
        uuid api_key_id FK
        uuid model_id FK
        integer tokens_input
        integer tokens_output
        decimal cost
        integer status_code
        integer duration_ms
        timestamp created_at
    }
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | JWT |

### User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user profile | JWT |
| GET | `/api/users/me/credits` | Get credit balance and history | JWT |
| GET | `/api/users/me/usage` | Get usage statistics | JWT |

### API Keys
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/api-keys` | List user's API keys | JWT |
| POST | `/api/api-keys` | Create new API key | JWT |
| DELETE | `/api/api-keys/:id` | Revoke API key | JWT |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| POST | `/api/admin/credits/grant` | Grant credits to user | Admin |
| GET | `/api/admin/models` | List shadow models | Admin |
| POST | `/api/admin/models` | Create shadow model | Admin |
| PUT | `/api/admin/models/:id` | Update shadow model | Admin |
| DELETE | `/api/admin/models/:id` | Delete shadow model | Admin |
| GET | `/api/admin/stats` | Platform statistics | Admin |

### Proxy Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/messages` | Anthropic-compatible | API Key |
| POST | `/api/v1/chat/completions` | OpenAI-compatible | API Key |

## Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | LandingPage | Public | Landing page |
| `/login` | LoginPage | Public | User login |
| `/register` | RegisterPage | Public | User registration |
| `/dashboard` | Dashboard | User | User dashboard |
| `/api-keys` | ApiKeysPage | User | API key management |
| `/usage` | UsagePage | User | Usage statistics |
| `/admin` | AdminDashboard | Admin | Admin dashboard |
| `/admin/users` | AdminUsersPage | Admin | User management |
| `/admin/models` | AdminModelsPage | Admin | Shadow model config |
| `/cliproxy/control-panel` | CliProxyPage | Admin | CLI Proxy iframe |

## Key Flows

### API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Proxy as API Proxy
    participant Auth as Auth Middleware
    participant DB as PostgreSQL
    participant Redis
    participant Provider as Backend Provider

    Client->>Proxy: POST /api/v1/messages (API Key)
    Proxy->>Auth: Validate API Key
    Auth->>DB: Lookup api_keys by key_hash
    Auth-->>Proxy: Key valid, user_id, allowed_models

    Proxy->>DB: Check user credit balance
    alt Insufficient credits
        Proxy-->>Client: 402 Payment Required
    end

    Proxy->>Redis: Check rate limit
    alt Rate limited
        Proxy-->>Client: 429 Too Many Requests
    end

    Proxy->>DB: Lookup shadow_model by display_name
    Proxy->>Provider: Forward request (transformed)
    Provider-->>Proxy: Response with usage

    Proxy->>DB: Deduct credits, log request
    Proxy->>DB: Update quota_used
    Proxy-->>Client: Response (model name restored)
```

### Credit Grant Flow

```mermaid
sequenceDiagram
    participant Admin
    participant API as Admin API
    participant DB as PostgreSQL

    Admin->>API: POST /api/admin/credits/grant
    API->>DB: Begin transaction
    API->>DB: Update user_credits.balance
    API->>DB: Insert credit_transaction
    API->>DB: Commit transaction
    API-->>Admin: Success response
```

## Components

| Component | Responsibility | Location |
|-----------|---------------|----------|
| AuthMiddleware | JWT validation, role checking | `src/middleware/auth.ts` |
| ApiKeyMiddleware | API key validation for proxy | `src/middleware/apiKey.ts` |
| ProxyController | Request transformation and routing | `src/controllers/proxy.ts` |
| CreditService | Balance management, deductions | `src/services/credit.ts` |
| ModelService | Shadow model CRUD operations | `src/services/model.ts` |
| UsageService | Analytics and statistics | `src/services/usage.ts` |

## Error Handling

| Error Case | HTTP Status | Response |
|------------|-------------|----------|
| Invalid credentials | 401 | `{ error: "Invalid credentials" }` |
| Invalid/revoked API key | 401 | `{ error: "Invalid API key" }` |
| Insufficient permissions | 403 | `{ error: "Access denied" }` |
| Model not allowed | 403 | `{ error: "Model not in allowed list" }` |
| Insufficient credits | 402 | `{ error: "Insufficient credits" }` |
| Rate limit exceeded | 429 | `{ error: "Rate limit exceeded" }` |
| Model not found | 404 | `{ error: "Model not found" }` |
| Provider error | 502 | `{ error: "Provider error", details: ... }` |

## Security Considerations

- Passwords hashed with bcrypt (cost factor 12)
- API keys hashed with SHA-256, only prefix stored in plain text
- Provider tokens encrypted with AES-256 before storage
- JWT tokens expire after 24 hours
- Rate limiting per API key and per IP
- CORS configured for frontend origin only
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM

## Project Structure

```
├── docker-compose.yml
├── Dockerfile
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
└── database/
    └── migrations/
```

## Test Strategy

- **Unit Tests**: Services, utilities, transformations
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Critical user flows (login, API key creation, proxy requests)

