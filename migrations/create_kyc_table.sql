-- Create KYC submissions table
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References users(id) but no FK constraint
  full_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_card_filename TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,  -- References users(id) but no FK constraint
  UNIQUE(user_id)  -- One KYC submission per user
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);

-- Comment
COMMENT ON TABLE kyc_submissions IS 'Stores KYC verification submissions with local file references';
COMMENT ON COLUMN kyc_submissions.status IS 'pending, approved, or rejected';

