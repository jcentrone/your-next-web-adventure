-- Add task_type column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT;

-- Add an index for better performance on task_type queries
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);