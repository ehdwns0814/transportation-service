-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  job_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS chat_messages_channel_idx ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_recipient_id_idx ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages(timestamp);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can select their own messages or messages sent to them
CREATE POLICY "Users can select their own messages or received messages"
  ON chat_messages
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR recipient_id IS NULL);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON chat_messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON chat_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 