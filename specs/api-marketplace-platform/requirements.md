# API Marketplace Platform with CLI Proxy

## Overview

A web platform for selling API access to users with admin-managed shadow model routing, credit-based billing, and integrated CLI Proxy control panel. Admins configure backend API mappings while users consume APIs through a unified proxy endpoint.

## User Stories

### Admin Features

#### US-A1: Admin Login and Dashboard Access
As an admin, I want to log in and access the admin dashboard so that I can manage the platform.

**Acceptance Criteria**:
- [ ] WHEN an admin enters valid credentials, THE SYSTEM SHALL authenticate and redirect to the admin dashboard.
- [ ] WHEN a non-admin user attempts to access admin routes, THE SYSTEM SHALL deny access and redirect to user dashboard.
- [ ] IF authentication fails, THEN THE SYSTEM SHALL display an error message and remain on login page.

#### US-A2: CLI Proxy Control Panel Access
As an admin, I want to access the CLI Proxy control panel at `/cliproxy/control-panel` so that I can manage CLI Proxy settings.

**Acceptance Criteria**:
- [ ] WHERE the user has admin role, THE SYSTEM SHALL display the CLI Proxy menu item in navigation.
- [ ] WHEN an admin navigates to `/cliproxy/control-panel`, THE SYSTEM SHALL load the CLI Proxy interface (iframe/proxy to existing service).
- [ ] WHEN a non-admin user attempts to access `/cliproxy/control-panel`, THE SYSTEM SHALL return 403 Forbidden.

#### US-A3: Configure Shadow Models
As an admin, I want to configure shadow models that map display names to actual backend APIs so that users see friendly model names while requests route to real providers.

**Acceptance Criteria**:
- [ ] WHEN an admin creates a shadow model, THE SYSTEM SHALL store display_name, provider_base_url, provider_token, provider_model, and pricing.
- [ ] WHEN an admin updates a shadow model, THE SYSTEM SHALL apply changes to all subsequent API requests.
- [ ] WHEN an admin deletes a shadow model, THE SYSTEM SHALL mark it as inactive and prevent new requests.
- [ ] THE SYSTEM SHALL validate that provider_base_url is a valid URL format.
- [ ] THE SYSTEM SHALL encrypt provider_token before storing in database.

#### US-A4: Grant and Manage User Credits
As an admin, I want to grant credits ($) to users so that they can use the API services.

**Acceptance Criteria**:
- [ ] WHEN an admin grants credits to a user, THE SYSTEM SHALL add the amount to user's balance and create a transaction record.
- [ ] WHEN an admin views a user's credit history, THE SYSTEM SHALL display all transactions with timestamps.
- [ ] THE SYSTEM SHALL prevent negative credit grants.

#### US-A5: View All Users and Usage
As an admin, I want to view all users and their usage statistics so that I can monitor platform activity.

**Acceptance Criteria**:
- [ ] WHEN an admin accesses user management, THE SYSTEM SHALL display a paginated list of all users.
- [ ] WHEN an admin selects a user, THE SYSTEM SHALL display their profile, credits, API keys, and usage statistics.
- [ ] THE SYSTEM SHALL allow filtering users by status, role, and registration date.

#### US-A6: Platform Statistics Dashboard
As an admin, I want to view platform-wide statistics so that I can understand overall usage patterns.

**Acceptance Criteria**:
- [ ] THE SYSTEM SHALL display total users, active users, total API requests, and total revenue.
- [ ] THE SYSTEM SHALL display usage charts by time period (daily, weekly, monthly).
- [ ] THE SYSTEM SHALL display top models by usage and top users by consumption.

### User Features

#### US-U1: User Registration and Login
As a user, I want to register and log in so that I can access the platform.

**Acceptance Criteria**:
- [ ] WHEN a user submits valid registration data, THE SYSTEM SHALL create an account and send confirmation.
- [ ] WHEN a user logs in with valid credentials, THE SYSTEM SHALL authenticate and redirect to dashboard.
- [ ] IF email is already registered, THEN THE SYSTEM SHALL display an error message.
- [ ] THE SYSTEM SHALL hash passwords using bcrypt before storing.

#### US-U2: View Credit Balance
As a user, I want to view my credit balance so that I know how much API usage I have available.

**Acceptance Criteria**:
- [ ] THE SYSTEM SHALL display current balance prominently on the dashboard.
- [ ] WHEN a user views credit details, THE SYSTEM SHALL display transaction history with type, amount, and timestamp.
- [ ] THE SYSTEM SHALL update balance display in real-time after API usage.

#### US-U3: Create and Manage API Keys
As a user, I want to create API keys with specific configurations so that I can control API access.

**Acceptance Criteria**:
- [ ] WHEN a user creates an API key, THE SYSTEM SHALL generate a unique key and allow setting: name, allowed models, quota limit, expiration date.
- [ ] THE SYSTEM SHALL display the full API key only once upon creation.
- [ ] WHEN a user lists API keys, THE SYSTEM SHALL show key prefix, name, status, and usage statistics.
- [ ] WHEN a user revokes an API key, THE SYSTEM SHALL immediately invalidate it for all requests.
- [ ] WHERE quota is set, THE SYSTEM SHALL enforce the limit and reject requests exceeding quota.
- [ ] WHERE expiration is set, THE SYSTEM SHALL reject requests after expiration date.

#### US-U4: View Usage Statistics
As a user, I want to view my usage statistics so that I can track my API consumption.

**Acceptance Criteria**:
- [ ] THE SYSTEM SHALL display usage statistics filterable by time range, API key, and model.
- [ ] THE SYSTEM SHALL display total requests, tokens used, and credits consumed.
- [ ] THE SYSTEM SHALL provide charts showing usage trends over time.
- [ ] WHEN a user exports usage data, THE SYSTEM SHALL generate a CSV file with detailed records.

#### US-U5: Use API Through Proxy Endpoint
As a user, I want to use APIs through the proxy endpoint so that I can access configured models.

**Acceptance Criteria**:
- [ ] WHEN a user sends a request with valid API key, THE SYSTEM SHALL authenticate and process the request.
- [ ] THE SYSTEM SHALL support Anthropic-compatible endpoint at `/api/v1/messages`.
- [ ] THE SYSTEM SHALL support OpenAI-compatible endpoint at `/api/v1/chat/completions`.
- [ ] IF API key is invalid or revoked, THEN THE SYSTEM SHALL return 401 Unauthorized.
- [ ] IF requested model is not in allowed_models, THEN THE SYSTEM SHALL return 403 Forbidden.

### System Features

#### US-S1: API Proxy with Shadow Model Routing
As the system, I want to route API requests through shadow model configurations so that users access backend providers transparently.

**Acceptance Criteria**:
- [ ] WHEN a request specifies a model name, THE SYSTEM SHALL lookup the shadow model configuration.
- [ ] THE SYSTEM SHALL transform the request to use provider_base_url, provider_token, and provider_model.
- [ ] THE SYSTEM SHALL forward the transformed request to the backend provider.
- [ ] THE SYSTEM SHALL transform the response back to use the original display model name.
- [ ] IF shadow model is not found or inactive, THEN THE SYSTEM SHALL return 404 with error message.

#### US-S2: Credit Deduction on API Usage
As the system, I want to deduct credits based on API usage so that users are billed accurately.

**Acceptance Criteria**:
- [ ] WHEN an API request completes, THE SYSTEM SHALL calculate cost based on tokens_input * pricing_input + tokens_output * pricing_output.
- [ ] THE SYSTEM SHALL deduct the calculated cost from user's credit balance.
- [ ] THE SYSTEM SHALL create a credit_transaction record for each deduction.
- [ ] IF user has insufficient credits, THEN THE SYSTEM SHALL reject the request with 402 Payment Required.
- [ ] THE SYSTEM SHALL check credit balance before forwarding request to provider.

#### US-S3: Rate Limiting and Quota Enforcement
As the system, I want to enforce rate limits and quotas so that the platform remains stable and fair.

**Acceptance Criteria**:
- [ ] THE SYSTEM SHALL enforce per-API-key quota limits when configured.
- [ ] THE SYSTEM SHALL track quota_used and compare against quota_limit.
- [ ] IF quota is exceeded, THEN THE SYSTEM SHALL return 429 Too Many Requests.
- [ ] THE SYSTEM SHALL implement global rate limiting using Redis.
- [ ] THE SYSTEM SHALL return rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset).

#### US-S4: Usage Logging and Analytics
As the system, I want to log all API usage so that analytics and billing are accurate.

**Acceptance Criteria**:
- [ ] THE SYSTEM SHALL log every API request with: user_id, api_key_id, model_id, tokens_input, tokens_output, cost, status_code, duration_ms, created_at.
- [ ] THE SYSTEM SHALL aggregate usage data for dashboard statistics.
- [ ] THE SYSTEM SHALL retain usage logs for at least 90 days.
- [ ] THE SYSTEM SHALL index logs for efficient querying by user, key, model, and time range.

## Out of Scope

- Payment gateway integration (credits are granted by admin only)
- Email verification for registration
- Password reset functionality
- Multi-factor authentication
- API versioning beyond v1
- Webhook notifications

## Success Metrics

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 500ms overhead |
| System Uptime | 99.9% |
| Credit Calculation Accuracy | 100% |
| Concurrent Users Supported | 1000+ |

