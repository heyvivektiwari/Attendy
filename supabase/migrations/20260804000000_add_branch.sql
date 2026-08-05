-- Add branch column to students table
-- Supports: 'Computer' (Computer Engineering) and 'DataScience' (CSE-DS)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS branch TEXT NOT NULL DEFAULT 'Computer';
