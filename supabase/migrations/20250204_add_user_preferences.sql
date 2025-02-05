-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
    ON user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
    ON user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
    ON user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences"
    ON user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add unique constraint on user_id
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- Add trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
