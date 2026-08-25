-- Migration: Create tickets table for support ticket system

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Add check constraint for status
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('open', 'in_progress', 'closed'));

-- Grant permissions to trader user
GRANT ALL PRIVILEGES ON TABLE tickets TO trader;

-- Add comments
COMMENT ON TABLE tickets IS 'Support tickets submitted by users';
COMMENT ON COLUMN tickets.status IS 'Ticket status: open, in_progress, closed';

-- Verification
SELECT 'Tickets table created successfully!' as status;
