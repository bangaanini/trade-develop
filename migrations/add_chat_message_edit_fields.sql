-- Migration: Add edit tracking fields to chat_messages
-- Description: Allows superadmin to edit messages while preserving an audit trail.

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS edited_by UUID;

COMMENT ON COLUMN public.chat_messages.is_edited IS 'TRUE when an admin has modified the original message text';
COMMENT ON COLUMN public.chat_messages.edited_at IS 'Timestamp of the most recent edit';
COMMENT ON COLUMN public.chat_messages.edited_by IS 'User id of the admin who performed the edit';
