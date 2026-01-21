-- ===========================================
-- API Marketplace Platform - Database Initialization
-- ===========================================
-- This script runs automatically when the PostgreSQL container starts
-- for the first time (empty data volume).

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types (if not using Prisma migrations)
-- Note: Prisma will handle table creation via migrations
-- This file is for extensions and any custom setup

-- Grant permissions (if needed for specific users)
-- GRANT ALL PRIVILEGES ON DATABASE api_marketplace TO postgres;

-- Create indexes for performance (Prisma handles most, but add custom ones here)
-- Example: CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom ON table_name (column);

-- Insert default admin user (optional - can also be done via seed script)
-- Note: Password should be hashed with bcrypt in production
-- INSERT INTO users (id, email, username, password_hash, role, status, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@example.com',
--     'admin',
--     '$2b$12$...',  -- bcrypt hash of password
--     'admin',
--     'active',
--     NOW(),
--     NOW()
-- ) ON CONFLICT (email) DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed at %', NOW();
END $$;

