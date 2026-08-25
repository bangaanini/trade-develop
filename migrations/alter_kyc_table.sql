-- Migration to update KYC submissions table structure
-- This replaces the old fields (full_name, address, phone, id_card_filename)
-- with new fields (name, id_card_number, id_card_front_filename, id_card_back_filename)

-- First, backup existing data if any exists
-- You may want to export current kyc_submissions before running this

-- Drop the old table and recreate with new structure
-- WARNING: This will delete existing KYC submissions
-- If you need to preserve data, manually migrate it first
DROP TABLE IF EXISTS kyc_submissions CASCADE;

-- Create KYC submissions table with new structure
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References users(id) but no FK constraint
  name VARCHAR(255) NOT NULL,
  id_card_number VARCHAR(50) NOT NULL,
  id_card_front_filename TEXT NOT NULL,
  id_card_back_filename TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,  -- References users(id) but no FK constraint
  UNIQUE(user_id)  -- One KYC submission per user
);

-- Create indexes for performance
CREATE INDEX idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_submissions_status ON kyc_submissions(status);

-- Comments
COMMENT ON TABLE kyc_submissions IS 'Stores KYC verification submissions with ID card photos (front and back)';
COMMENT ON COLUMN kyc_submissions.name IS 'Full name as shown on ID card';
COMMENT ON COLUMN kyc_submissions.id_card_number IS 'ID card number';
COMMENT ON COLUMN kyc_submissions.id_card_front_filename IS 'Filename for front photo of ID card';
COMMENT ON COLUMN kyc_submissions.id_card_back_filename IS 'Filename for back photo of ID card';
COMMENT ON COLUMN kyc_submissions.status IS 'pending, approved, or rejected';
