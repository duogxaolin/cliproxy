# API Marketplace Platform - Tasks

## Phase 1: Project Setup
**Prerequisites**: None

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Initialize Node.js project with TypeScript | `package.json`, `tsconfig.json`, `src/index.ts` | Project compiles with `npm run build` | [ ] |
| Setup Express server with basic middleware | `src/index.ts`, `src/config/index.ts` | Server starts on configured port | [ ] |
| Setup Prisma with PostgreSQL schema | `prisma/schema.prisma`, `.env` | `npx prisma generate` succeeds | [ ] |
| Create database migrations | `prisma/migrations/` | `npx prisma migrate dev` creates all tables | [ ] |
| Configure Docker and docker-compose | `Dockerfile`, `docker-compose.yml` | `docker-compose up` starts all services | [ ] |
| Setup React + Vite frontend | `frontend/package.json`, `frontend/vite.config.ts` | `npm run dev` starts frontend | [ ] |
| Configure TailwindCSS with white theme | `frontend/tailwind.config.js`, `frontend/src/index.css` | Tailwind classes work in components | [ ] |
| Setup frontend routing | `frontend/src/App.tsx`, `frontend/src/pages/` | Routes render correct components | [ ] |

**Git Commit**: `feat: initial project setup`

---

## Phase 2: Authentication System
**Prerequisites**: Phase 1 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Create User model and seed admin | `prisma/schema.prisma`, `prisma/seed.ts` | Admin user exists in database | [ ] |
| Implement registration endpoint | `src/controllers/auth.ts`, `src/routes/auth.ts` | POST `/api/auth/register` creates user | [ ] |
| Implement login endpoint with JWT | `src/controllers/auth.ts`, `src/services/auth.ts` | POST `/api/auth/login` returns JWT | [ ] |
| Implement logout endpoint | `src/controllers/auth.ts` | POST `/api/auth/logout` invalidates session | [ ] |
| Create JWT auth middleware | `src/middleware/auth.ts` | Protected routes require valid JWT | [ ] |
| Create role-based access middleware | `src/middleware/auth.ts` | Admin routes reject non-admin users | [ ] |
| Create login page | `frontend/src/pages/LoginPage.tsx` | User can log in via form | [ ] |
| Create registration page | `frontend/src/pages/RegisterPage.tsx` | User can register via form | [ ] |
| Setup auth context and hooks | `frontend/src/hooks/useAuth.ts`, `frontend/src/context/AuthContext.tsx` | Auth state persists across pages | [ ] |
| Implement protected route wrapper | `frontend/src/components/ProtectedRoute.tsx` | Unauthenticated users redirected to login | [ ] |

**Git Commit**: `feat: authentication system`

---

## Phase 3: Admin Features
**Prerequisites**: Phase 2 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Create admin dashboard layout | `frontend/src/pages/AdminDashboard.tsx` | Admin sees dashboard with stats placeholders | [ ] |
| Implement shadow model CRUD endpoints | `src/controllers/admin/models.ts`, `src/services/model.ts` | All CRUD operations work via API | [ ] |
| Create shadow model management UI | `frontend/src/pages/AdminModelsPage.tsx` | Admin can create/edit/delete models | [ ] |
| Implement user listing endpoint | `src/controllers/admin/users.ts` | GET `/api/admin/users` returns paginated users | [ ] |
| Create user management UI | `frontend/src/pages/AdminUsersPage.tsx` | Admin sees user list with details | [ ] |
| Implement credit grant endpoint | `src/controllers/admin/credits.ts`, `src/services/credit.ts` | POST `/api/admin/credits/grant` adds credits | [ ] |
| Create credit grant UI | `frontend/src/components/admin/CreditGrantModal.tsx` | Admin can grant credits via modal | [ ] |
| Implement platform stats endpoint | `src/controllers/admin/stats.ts` | GET `/api/admin/stats` returns metrics | [ ] |
| Integrate CLI Proxy iframe | `frontend/src/pages/CliProxyPage.tsx` | Admin can access CLI Proxy at `/cliproxy/control-panel` | [ ] |
| Add admin navigation | `frontend/src/components/AdminNav.tsx` | Admin nav shows all admin routes | [ ] |

**Git Commit**: `feat: admin features`

---

## Phase 4: User Features
**Prerequisites**: Phase 2 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Create user dashboard | `frontend/src/pages/Dashboard.tsx` | User sees balance and quick stats | [ ] |
| Implement get profile endpoint | `src/controllers/user.ts` | GET `/api/users/me` returns user data | [ ] |
| Implement get credits endpoint | `src/controllers/user.ts` | GET `/api/users/me/credits` returns balance and history | [ ] |
| Create credit balance component | `frontend/src/components/CreditBalance.tsx` | User sees current balance | [ ] |
| Implement API key CRUD endpoints | `src/controllers/apiKeys.ts`, `src/services/apiKey.ts` | All CRUD operations work | [ ] |
| Create API key management page | `frontend/src/pages/ApiKeysPage.tsx` | User can create/view/revoke keys | [ ] |
| Create API key creation form | `frontend/src/components/ApiKeyForm.tsx` | Form with name, models, quota, expiration | [ ] |
| Display API key only once on creation | `frontend/src/components/ApiKeyReveal.tsx` | Key shown once with copy button | [ ] |
| Add user navigation | `frontend/src/components/UserNav.tsx` | User nav shows all user routes | [ ] |

**Git Commit**: `feat: user features`

---

## Phase 5: API Proxy System
**Prerequisites**: Phase 3 and Phase 4 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Create API key validation middleware | `src/middleware/apiKey.ts` | Middleware validates key hash and checks expiration | [ ] |
| Implement model lookup service | `src/services/model.ts` | Service returns shadow model config by display name | [ ] |
| Create request transformer (Anthropic) | `src/services/proxy/anthropic.ts` | Transforms request to provider format | [ ] |
| Create request transformer (OpenAI) | `src/services/proxy/openai.ts` | Transforms request to provider format | [ ] |
| Implement proxy controller | `src/controllers/proxy.ts` | Routes requests through shadow models | [ ] |
| Create Anthropic-compatible endpoint | `src/routes/proxy.ts` | POST `/api/v1/messages` works | [ ] |
| Create OpenAI-compatible endpoint | `src/routes/proxy.ts` | POST `/api/v1/chat/completions` works | [ ] |
| Implement credit check before request | `src/middleware/creditCheck.ts` | Requests rejected if insufficient credits | [ ] |
| Implement credit deduction after request | `src/services/credit.ts` | Credits deducted based on token usage | [ ] |
| Implement usage logging | `src/services/usage.ts` | All requests logged to api_requests table | [ ] |
| Implement quota tracking | `src/services/apiKey.ts` | quota_used incremented, requests rejected at limit | [ ] |
| Add streaming support | `src/controllers/proxy.ts` | Streaming responses work correctly | [ ] |

**Git Commit**: `feat: api proxy system`

---

## Phase 6: Analytics & Statistics
**Prerequisites**: Phase 5 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Implement user usage endpoint | `src/controllers/user.ts` | GET `/api/users/me/usage` returns stats | [ ] |
| Create usage statistics page | `frontend/src/pages/UsagePage.tsx` | User sees usage data | [ ] |
| Add time range filter | `frontend/src/components/DateRangeFilter.tsx` | User can filter by date range | [ ] |
| Add API key filter | `frontend/src/components/ApiKeyFilter.tsx` | User can filter by API key | [ ] |
| Add model filter | `frontend/src/components/ModelFilter.tsx` | User can filter by model | [ ] |
| Create usage charts | `frontend/src/components/UsageCharts.tsx` | Charts show usage trends | [ ] |
| Implement CSV export | `src/controllers/user.ts`, `frontend/src/pages/UsagePage.tsx` | User can download usage CSV | [ ] |
| Implement admin platform stats | `src/controllers/admin/stats.ts` | Admin stats endpoint returns all metrics | [ ] |
| Create admin stats dashboard | `frontend/src/pages/AdminDashboard.tsx` | Admin sees platform-wide charts | [ ] |

**Git Commit**: `feat: analytics and statistics`

---

## Phase 7: Final Polish
**Prerequisites**: Phase 6 complete

| Task | Files | DoD | Status |
|------|-------|-----|--------|
| Implement rate limiting with Redis | `src/middleware/rateLimit.ts` | Rate limits enforced per key/IP | [ ] |
| Add rate limit headers | `src/middleware/rateLimit.ts` | X-RateLimit-* headers in responses | [ ] |
| Create landing page | `frontend/src/pages/LandingPage.tsx` | Attractive landing page with info | [ ] |
| Refine white theme styling | `frontend/src/index.css`, components | Consistent white theme throughout | [ ] |
| Add loading states | All pages | Loading spinners during API calls | [ ] |
| Add error handling UI | `frontend/src/components/ErrorBoundary.tsx` | Errors displayed gracefully | [ ] |
| Add toast notifications | `frontend/src/components/Toast.tsx` | Success/error toasts for actions | [ ] |
| Validate all form inputs | All forms | Client and server validation | [ ] |
| Add responsive design | All pages | UI works on mobile and desktop | [ ] |
| Security audit | All endpoints | No security vulnerabilities | [ ] |

**Git Commit**: `feat: final polish and docs`

---

## Definition of Done (Global)

Each task is complete when:
1. Code compiles without errors
2. Feature works as specified in requirements
3. No console errors in browser
4. API returns correct status codes
5. Database operations are transactional where needed
6. Error cases are handled gracefully

## Notes

- Follow YAGNI, KISS, DRY principles
- Keep implementation minimal but complete
- Commit after each phase completion
- Add migration files for any schema changes to `database/` folder
- Update docs after completing each major feature

