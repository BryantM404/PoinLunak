-- Migration: Add stock and validity_days to reward_items
-- Note: These columns were already added in a previous migration (20260108_restructure_rewards_tables)
-- This migration is now a no-op to prevent duplicate column errors

-- Columns stock and validity_days already exist, skipping...
SELECT 1;
