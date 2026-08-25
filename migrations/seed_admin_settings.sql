-- =============================================
-- Seed Default Settings Data
-- =============================================

-- SEO Settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
('site_name', 'Tools24', 'text', 'seo', 'Site name'),
('site_title', 'Tools24 - Professional Crypto Trading Platform', 'text', 'seo', 'Meta title'),
('site_description', 'Trade Bitcoin, Ethereum, and 100+ cryptocurrencies with advanced tools. Spot trading, options, secure wallet, and 24/7 support.', 'text', 'seo', 'Meta description'),
('site_keywords', '["crypto trading","bitcoin trading","ethereum trading","cryptocurrency exchange","spot trading","crypto options","digital assets","crypto wallet","trading platform"]', 'json', 'seo', 'Keywords array'),
('contact_email', 'support@tools24.online', 'text', 'contact', 'Support email'),
('social_twitter', '@tools24trading', 'text', 'social', 'Twitter handle'),
('social_facebook', '', 'url', 'social', 'Facebook URL'),
('social_instagram', '', 'url', 'social', 'Instagram URL'),
('social_telegram', '', 'url', 'social', 'Telegram URL')
ON CONFLICT (setting_key) DO NOTHING;

-- Content Settings - Company Introduction
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
('section_company_title', 'Company introduction', 'text', 'content', 'Company section title'),
('section_company_text1', 'The Bitgas Pro platform was launched in 2018, with the goal to bridge the gap between traditional currencies and digital assets. An ambitious, development-focused team, located in US, is constantly working on improving and expanding the Bitgas Pro platform.', 'text', 'content', 'Company intro paragraph 1'),
('section_company_text2', 'Bitgas Pro is one of US''s leading digital asset exchanges, it supports USD fiat pairs. Bitgas Pro is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.', 'text', 'content', 'Company intro paragraph 2')
ON CONFLICT (setting_key) DO NOTHING;

-- Content Settings - Journey Start
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
('section_journey_title', 'Start your journey of digital currency', 'text', 'content', 'Journey section title'),
('section_journey_card1_title', 'Trading Crypto with ZERO fees', 'text', 'content', 'Journey card 1 title'),
('section_journey_card1_text', 'Using a payment method to trade digital currency, 0 handling fee, safe and fast', 'text', 'content', 'Journey card 1 text'),
('section_journey_card2_title', 'Optimal transaction rate', 'text', 'content', 'Journey card 2 title'),
('section_journey_card2_text', 'Preferential transaction rates, enjoy the best quality service', 'text', 'content', 'Journey card 2 text'),
('section_journey_card3_title', '24/7 Chat Support', 'text', 'content', 'Journey card 3 title'),
('section_journey_card3_text', 'Full-time operation mode, instant assistance whenever you need', 'text', 'content', 'Journey card 3 text')
ON CONFLICT (setting_key) DO NOTHING;

-- Content Settings - Leading Platform
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
('section_leading_title', 'THE WORLD''S LEADING DIGITAL ASSET TRADING PLATFORM', 'text', 'content', 'Leading section title'),
('section_leading_subtitle', 'We provide reliable digital asset trading and asset management services to millions of users in more than 130 countries and regions.', 'text', 'content', 'Leading section subtitle'),
('section_leading_card1_title', 'Safe and Secure', 'text', 'content', 'Leading card 1 title'),
('section_leading_card1_text1', '5 years of experience in Canadian asset financial services', 'text', 'content', 'Leading card 1 text 1'),
('section_leading_card1_text2', 'Professional distributed system and DDoS attack prevention system', 'text', 'content', 'Leading card 1 text 2'),
('section_leading_card2_title', 'World Ecological Arrangement', 'text', 'content', 'Leading card 2 title'),
('section_leading_card2_text1', 'Localized trade service centers in many countries', 'text', 'content', 'Leading card 2 text 1'),
('section_leading_card2_text2', 'Promote global expansion across various business forms', 'text', 'content', 'Leading card 2 text 2'),
('section_leading_card3_title', 'User Friendly', 'text', 'content', 'Leading card 3 title'),
('section_leading_card3_text1', 'Establish a system of compensation in advance', 'text', 'content', 'Leading card 3 text 1'),
('section_leading_card3_text2', 'Dedicated investor protection fund', 'text', 'content', 'Leading card 3 text 2')
ON CONFLICT (setting_key) DO NOTHING;

-- Uploaded Images - Initial default images
INSERT INTO uploaded_images (image_key, file_name, file_path, file_url) VALUES
('hero_bg', 'banner.png', '/public/banner.png', '/banner.png'),
('mobile_slide1', 'slide1.jpg', '/public/slide1.jpg', '/slide1.jpg'),
('mobile_slide2', 'slide2.jpg', '/public/slide2.jpg', '/slide2.jpg'),
('mobile_slide3', 'slide3.jpg', '/public/slide3.jpg', '/slide3.jpg'),
('logo', 'logo.png', '/public/logo.png', '/logo.png'),
('og_image', 'og-image.png', '/public/og-image.png', '/og-image.png')
ON CONFLICT (image_key) DO NOTHING;
