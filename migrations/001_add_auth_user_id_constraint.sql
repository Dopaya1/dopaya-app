-- Migration: Add unique constraint on auth_user_id
-- Date: 2025-11-20
-- Purpose: Prevent duplicate users when multiple requests create users concurrently

-- Add unique constraint on auth_user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'users_auth_user_id_unique'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);
        
        RAISE NOTICE '✅ Unique constraint added on auth_user_id';
    ELSE
        RAISE NOTICE 'ℹ️  Unique constraint already exists on auth_user_id';
    END IF;
END $$;

