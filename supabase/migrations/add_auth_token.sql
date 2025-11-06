-- Add auth_token column to profiles table for custom authorization
-- Migration: add_auth_token

-- Add auth_token column with unique constraint
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_token VARCHAR(16) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_token ON profiles(auth_token);

-- Add is_authorized column to track authorization status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_authorized BOOLEAN DEFAULT FALSE;

-- Add authorized_at timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ;

-- Function to generate a unique 16-character alphanumeric token
CREATE OR REPLACE FUNCTION generate_auth_token()
RETURNS VARCHAR(16) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result VARCHAR(16) := '';
  i INTEGER;
  token_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..16 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE auth_token = result) INTO token_exists;
    
    -- If unique, exit loop
    IF NOT token_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comment on columns
COMMENT ON COLUMN profiles.auth_token IS 'Unique 16-character alphanumeric token for user authorization';
COMMENT ON COLUMN profiles.is_authorized IS 'Whether user has completed authorization via token link';
COMMENT ON COLUMN profiles.authorized_at IS 'Timestamp when user completed authorization';
