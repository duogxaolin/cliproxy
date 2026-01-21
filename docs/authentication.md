# Authentication System

The API Marketplace Platform uses a dual authentication system: JWT tokens for web dashboard access and API keys for programmatic API access.

## JWT-Based Authentication

### Overview
JWT (JSON Web Tokens) are used for authenticating users in the web dashboard. The system uses access tokens and refresh tokens for secure session management.

### Token Configuration
- **Access Token Expiration**: 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token Expiration**: 7 days
- **Secret Key**: Configured via `JWT_SECRET` environment variable

### Token Payload
```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout (requires auth) |
| POST | `/api/auth/refresh` | Refresh access token |

### Token Refresh Flow
1. Client sends expired access token request
2. Server returns 401 Unauthorized
3. Client sends refresh token to `/api/auth/refresh`
4. Server validates refresh token and user status
5. Server returns new access token and refresh token
6. Client retries original request with new access token

### Usage
```bash
# Login
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use access token
curl -X GET /api/users/me \
  -H "Authorization: Bearer <access_token>"

# Refresh token
curl -X POST /api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

## API Key Authentication

API keys are used for authenticating requests to the proxy endpoints (`/api/v1/*`).

### Authentication Methods
API keys can be provided via:
1. `X-API-Key` header (preferred)
2. `Authorization: Bearer <api_key>` header

### Validation Process
1. Extract API key from request headers
2. Hash the key using SHA-256
3. Look up key hash in database
4. Verify key is not revoked
5. Check expiration date
6. Verify user account is active
7. Attach key metadata to request

## Role-Based Access Control (RBAC)

### Roles
| Role | Description |
|------|-------------|
| `admin` | Full platform access, user management, model configuration |
| `user` | Standard user access, API key management, usage viewing |

### First User Admin
The first registered user automatically becomes an admin when `FIRST_USER_IS_ADMIN=true`.

### Protected Routes
```typescript
// Admin-only routes
router.use(authenticateJWT);
router.use(requireRole('admin'));
```

### Role Middleware
```typescript
function requireRole(...roles: UserRole[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
```

## Password Hashing

### Implementation
- **Algorithm**: bcrypt
- **Salt Rounds**: 12

### Functions
```typescript
// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret in production
   ```bash
   openssl rand -base64 64
   ```

2. **Password Requirements**: Enforce strong passwords (min 8 characters)

3. **Account Status**: Suspended accounts cannot authenticate

4. **Token Storage**: Store tokens securely on client side (httpOnly cookies recommended for web)

5. **HTTPS**: Always use HTTPS in production to protect tokens in transit

