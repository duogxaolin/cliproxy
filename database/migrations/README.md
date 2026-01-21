# Database Migrations

This folder contains database migration tracking and custom migration scripts.

## Prisma Migrations

The primary migration system uses Prisma. Migrations are stored in `backend/prisma/migrations/`.

### Running Migrations

```bash
# Development - create and apply migrations
cd backend
npx prisma migrate dev --name <migration_name>

# Production - apply pending migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Custom Migrations

For migrations that cannot be handled by Prisma (e.g., data migrations, complex SQL):

1. Create a new SQL file with timestamp prefix: `YYYYMMDD_HHMMSS_description.sql`
2. Document the migration purpose in the file header
3. Test in development before applying to production

### Example Custom Migration

```sql
-- Migration: 20260121_120000_add_custom_index.sql
-- Description: Add custom index for performance optimization
-- Author: Your Name
-- Date: 2026-01-21

BEGIN;

-- Your migration SQL here
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_example ON table_name (column);

COMMIT;
```

## Migration History

| Date | Migration | Description | Status |
|------|-----------|-------------|--------|
| 2026-01-21 | Initial | Prisma initial migration | Applied |

## Rollback Procedures

For critical migrations, document rollback procedures:

```sql
-- Rollback for: 20260121_120000_add_custom_index.sql
DROP INDEX IF EXISTS idx_example;
```

