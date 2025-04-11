-- Add Google Calendar connection columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS selected_calendars TEXT[] DEFAULT '{}';
