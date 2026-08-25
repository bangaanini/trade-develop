-- =============================================
-- Admin Settings System - Phase 2
-- =============================================

-- Table 1: Site Settings
-- Stores all configurable site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  category VARCHAR(100),
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID
);

-- Create index for faster lookups
CREATE INDEX idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX idx_site_settings_category ON site_settings(category);

-- Table 2: Uploaded Images
-- Stores uploaded image metadata
CREATE TABLE IF NOT EXISTS uploaded_images (
  id SERIAL PRIMARY KEY,
  image_key VARCHAR(255) UNIQUE NOT NULL,
  file_name VARCHAR(255),
  file_path TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by UUID
);

-- Create index for faster lookups
CREATE INDEX idx_uploaded_images_key ON uploaded_images(image_key);

-- Table 3: Settings History (for audit trail)
CREATE TABLE IF NOT EXISTS settings_history (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255),
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_history_key ON settings_history(setting_key);
CREATE INDEX idx_settings_history_date ON settings_history(changed_at DESC);
