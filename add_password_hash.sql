-- Add password_hash field to existing users table
-- Run this script to update your existing database schema

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of user password for local authentication';

-- Update existing users to have a default password hash (for existing accounts)
-- Note: This is just a placeholder - existing users will need to reset their passwords
UPDATE users 
SET password_hash = 'placeholder_hash_for_existing_users' 
WHERE password_hash IS NULL;

-- Make sure the column is not null for new users (optional)
-- ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';
