-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create Policy for users to select only their own tasks
CREATE POLICY "Users can view their own tasks" 
ON tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create Policy for users to insert their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Policy for users to update only their own tasks
CREATE POLICY "Users can update their own tasks" 
ON tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create Policy for users to delete only their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id); 