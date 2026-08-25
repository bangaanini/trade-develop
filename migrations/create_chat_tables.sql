-- Migration: Create Chat Tables
-- Description: Creates tables for custom live chat system between users and admin

-- Table: chat_sessions
-- Stores chat sessions between users and admin
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: chat_messages
-- Stores individual messages in chat sessions
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Comments for documentation
COMMENT ON TABLE public.chat_sessions IS 'Stores chat sessions between users and admin';
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages in chat sessions';
COMMENT ON COLUMN public.chat_sessions.status IS 'Session status: open or closed';
COMMENT ON COLUMN public.chat_messages.sender_type IS 'Type of sender: user or admin';
COMMENT ON COLUMN public.chat_messages.is_read IS 'Whether the message has been read by the recipient';
