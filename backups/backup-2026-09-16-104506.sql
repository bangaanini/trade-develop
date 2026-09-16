--
-- PostgreSQL database dump
--

\restrict hnhgWEFjBw2RYKYaccQTdjyywnElLqJtMMkge7zzS4fA6Zz1EIvr7yZUr8stOtI

-- Dumped from database version 18.4 (Ubuntu 18.4-1.pgdg24.04+1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-1.pgdg24.04+1)

-- Started on 2026-09-16 10:45:07 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey;
DROP INDEX IF EXISTS public.idx_wallets_user_coin_type;
DROP INDEX IF EXISTS public.idx_users_referral_code;
DROP INDEX IF EXISTS public.idx_uploaded_images_key;
DROP INDEX IF EXISTS public.idx_tickets_user_id;
DROP INDEX IF EXISTS public.idx_tickets_status;
DROP INDEX IF EXISTS public.idx_spot_orders_user;
DROP INDEX IF EXISTS public.idx_site_settings_key;
DROP INDEX IF EXISTS public.idx_site_settings_category;
DROP INDEX IF EXISTS public.idx_settings_history_key;
DROP INDEX IF EXISTS public.idx_settings_history_date;
DROP INDEX IF EXISTS public.idx_referrals_referrer;
DROP INDEX IF EXISTS public.idx_referrals_referred;
DROP INDEX IF EXISTS public.idx_price_cache_symbol;
DROP INDEX IF EXISTS public.idx_options_user_status;
DROP INDEX IF EXISTS public.idx_options_expires;
DROP INDEX IF EXISTS public.idx_kyc_submissions_user_id;
DROP INDEX IF EXISTS public.idx_kyc_submissions_status;
DROP INDEX IF EXISTS public.idx_email_verifications_expires;
DROP INDEX IF EXISTS public.idx_email_verifications_email;
DROP INDEX IF EXISTS public.idx_chat_sessions_user_id;
DROP INDEX IF EXISTS public.idx_chat_sessions_status;
DROP INDEX IF EXISTS public.idx_chat_messages_session_id;
DROP INDEX IF EXISTS public.idx_chat_messages_created_at;
ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_user_coin_type_unique;
ALTER TABLE IF EXISTS ONLY public.wallet_addresses DROP CONSTRAINT IF EXISTS wallet_addresses_user_id_network_key;
ALTER TABLE IF EXISTS ONLY public.wallet_addresses DROP CONSTRAINT IF EXISTS wallet_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_uid_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_referral_code_key;
ALTER TABLE IF EXISTS ONLY public.user_win_rates DROP CONSTRAINT IF EXISTS user_win_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.user_registration_info DROP CONSTRAINT IF EXISTS user_registration_info_pkey;
ALTER TABLE IF EXISTS ONLY public.uploaded_images DROP CONSTRAINT IF EXISTS uploaded_images_pkey;
ALTER TABLE IF EXISTS ONLY public.uploaded_images DROP CONSTRAINT IF EXISTS uploaded_images_image_key_key;
ALTER TABLE IF EXISTS ONLY public.tickets DROP CONSTRAINT IF EXISTS tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.swaps DROP CONSTRAINT IF EXISTS swaps_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings_history DROP CONSTRAINT IF EXISTS settings_history_pkey;
ALTER TABLE IF EXISTS ONLY public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_id_key;
ALTER TABLE IF EXISTS ONLY public.referrals DROP CONSTRAINT IF EXISTS referrals_pkey;
ALTER TABLE IF EXISTS ONLY public.option_settings DROP CONSTRAINT IF EXISTS option_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_user_id_key;
ALTER TABLE IF EXISTS ONLY public.kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.email_verifications DROP CONSTRAINT IF EXISTS email_verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
ALTER TABLE IF EXISTS public.uploaded_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.settings_history ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.withdraws;
DROP TABLE IF EXISTS public.withdraw_requests;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.wallet_logs;
DROP TABLE IF EXISTS public.wallet_addresses;
DROP TABLE IF EXISTS public.users_view;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_win_rates;
DROP TABLE IF EXISTS public.user_registration_info;
DROP SEQUENCE IF EXISTS public.uploaded_images_id_seq;
DROP TABLE IF EXISTS public.uploaded_images;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.tickets;
DROP TABLE IF EXISTS public.swaps;
DROP TABLE IF EXISTS public.spot_orders;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.settings_history_id_seq;
DROP TABLE IF EXISTS public.settings_history;
DROP TABLE IF EXISTS public.referrals;
DROP TABLE IF EXISTS public.price_cache;
DROP TABLE IF EXISTS public.options;
DROP TABLE IF EXISTS public.option_settings;
DROP TABLE IF EXISTS public.option_pairs;
DROP TABLE IF EXISTS public.option_durations;
DROP TABLE IF EXISTS public.kyc_submissions;
DROP TABLE IF EXISTS public.email_verifications;
DROP TABLE IF EXISTS public.deposits;
DROP TABLE IF EXISTS public.deposit_methods;
DROP TABLE IF EXISTS public.chat_sessions;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.admin_logs;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- TOC entry 2 (class 3079 OID 230455)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3728 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 230493)
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id uuid NOT NULL,
    admin_id uuid,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone
);


--
-- TOC entry 221 (class 1259 OID 230500)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    sender_type text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chat_messages_sender_type_check CHECK ((sender_type = ANY (ARRAY['user'::text, 'admin'::text])))
);


--
-- TOC entry 3729 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE chat_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chat_messages IS 'Stores individual messages in chat sessions';


--
-- TOC entry 3730 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN chat_messages.sender_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_messages.sender_type IS 'Type of sender: user or admin';


--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN chat_messages.is_read; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_messages.is_read IS 'Whether the message has been read by the recipient';


--
-- TOC entry 222 (class 1259 OID 230514)
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    last_message_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chat_sessions_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


--
-- TOC entry 3732 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE chat_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chat_sessions IS 'Stores chat sessions between users and admin';


--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN chat_sessions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_sessions.status IS 'Session status: open or closed';


--
-- TOC entry 223 (class 1259 OID 230527)
-- Name: deposit_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deposit_methods (
    id uuid NOT NULL,
    coin text NOT NULL,
    network text NOT NULL,
    address text NOT NULL,
    qr_code_url text,
    is_active boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 224 (class 1259 OID 230537)
-- Name: deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deposits (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    deposit_method_id uuid NOT NULL,
    coin text NOT NULL,
    network text NOT NULL,
    amount numeric NOT NULL,
    txid text NOT NULL,
    proof_url text,
    status text,
    created_at timestamp without time zone
);


--
-- TOC entry 225 (class 1259 OID 230549)
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    otp_code character varying(6) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    verified boolean DEFAULT false,
    attempts integer DEFAULT 0
);


--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE email_verifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.email_verifications IS 'Stores OTP codes for email verification during registration';


--
-- TOC entry 226 (class 1259 OID 230563)
-- Name: kyc_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kyc_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    id_card_number character varying(50) NOT NULL,
    id_card_front_filename text NOT NULL,
    id_card_back_filename text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_note text,
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT kyc_submissions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text])))
);


--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE kyc_submissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.kyc_submissions IS 'Stores KYC verification submissions with ID card photos (front and back)';


--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN kyc_submissions.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.name IS 'Full name as shown on ID card';


--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN kyc_submissions.id_card_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_number IS 'ID card number';


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN kyc_submissions.id_card_front_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_front_filename IS 'Filename for front photo of ID card';


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN kyc_submissions.id_card_back_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_back_filename IS 'Filename for back photo of ID card';


--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN kyc_submissions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.status IS 'pending, approved, or rejected';


--
-- TOC entry 227 (class 1259 OID 230578)
-- Name: option_durations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_durations (
    id uuid NOT NULL,
    seconds integer NOT NULL,
    is_active boolean NOT NULL,
    payout_percent numeric,
    min_amount numeric DEFAULT 10
);


--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN option_durations.min_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.option_durations.min_amount IS 'Minimum order amount for this duration in USDT';


--
-- TOC entry 228 (class 1259 OID 230587)
-- Name: option_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_pairs (
    id uuid NOT NULL,
    symbol text NOT NULL,
    is_active boolean NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 230595)
-- Name: option_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_settings (
    id uuid NOT NULL,
    min_amount numeric DEFAULT 10,
    max_amount numeric DEFAULT 1000,
    is_enabled boolean DEFAULT true,
    profit_percent numeric DEFAULT 80,
    payout_percent numeric DEFAULT 80
);


--
-- TOC entry 230 (class 1259 OID 230606)
-- Name: options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.options (
    id uuid NOT NULL,
    user_id uuid,
    symbol text NOT NULL,
    direction text,
    amount numeric NOT NULL,
    entry_price numeric NOT NULL,
    exit_price numeric,
    profit numeric,
    status text,
    duration integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    payout_percent numeric DEFAULT 85.00,
    closed_at timestamp with time zone
);


--
-- TOC entry 231 (class 1259 OID 230619)
-- Name: price_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_cache (
    symbol text NOT NULL,
    price numeric NOT NULL,
    updated_at timestamp with time zone
);


--
-- TOC entry 232 (class 1259 OID 230626)
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 233 (class 1259 OID 230634)
-- Name: settings_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_history (
    id integer NOT NULL,
    setting_key character varying(255),
    old_value text,
    new_value text,
    changed_by uuid,
    changed_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 234 (class 1259 OID 230641)
-- Name: settings_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 234
-- Name: settings_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_history_id_seq OWNED BY public.settings_history.id;


--
-- TOC entry 235 (class 1259 OID 230642)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'text'::character varying,
    category character varying(100),
    description text,
    updated_at timestamp without time zone DEFAULT now(),
    updated_by uuid
);


--
-- TOC entry 236 (class 1259 OID 230651)
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 236
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- TOC entry 237 (class 1259 OID 230652)
-- Name: spot_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spot_orders (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_id uuid NOT NULL,
    symbol text NOT NULL,
    side text NOT NULL,
    type text NOT NULL,
    price numeric,
    amount numeric NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    filled_amount numeric DEFAULT 0
);


--
-- TOC entry 238 (class 1259 OID 230667)
-- Name: swaps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    from_coin character varying(20) NOT NULL,
    to_coin character varying(20) NOT NULL,
    amount_in numeric(20,8) NOT NULL,
    amount_out numeric(20,8) NOT NULL,
    fee numeric(20,8) NOT NULL,
    rate numeric(20,8) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 239 (class 1259 OID 230680)
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 240 (class 1259 OID 230693)
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    user_id uuid,
    coin text,
    amount numeric,
    type text,
    status text,
    created_at timestamp without time zone
);


--
-- TOC entry 241 (class 1259 OID 230699)
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploaded_images (
    id integer NOT NULL,
    image_key character varying(255) NOT NULL,
    file_name character varying(255),
    file_path text,
    file_url text,
    file_size integer,
    mime_type character varying(100),
    width integer,
    height integer,
    uploaded_at timestamp without time zone DEFAULT now(),
    uploaded_by uuid
);


--
-- TOC entry 242 (class 1259 OID 230707)
-- Name: uploaded_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.uploaded_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 242
-- Name: uploaded_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uploaded_images_id_seq OWNED BY public.uploaded_images.id;


--
-- TOC entry 243 (class 1259 OID 230708)
-- Name: user_registration_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_registration_info (
    user_id uuid NOT NULL,
    ip_address character varying(50),
    device_info text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 244 (class 1259 OID 230715)
-- Name: user_win_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_win_rates (
    user_id uuid NOT NULL,
    win_rate integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 245 (class 1259 OID 230721)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone,
    first_name text,
    last_name text,
    phone text,
    address text,
    city text,
    state text,
    zip text,
    country text,
    email_verified boolean,
    phone_verified boolean,
    kyc_verified boolean,
    twofa_enabled boolean,
    banned boolean,
    email text,
    password_hash text DEFAULT ''::text NOT NULL,
    last_login timestamp with time zone,
    referral_code character varying(20),
    uid bigint,
    visible_password character varying(255)
);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 245
-- Name: COLUMN users.referral_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.referral_code IS 'Unique referral code for inviting new users';


--
-- TOC entry 246 (class 1259 OID 230730)
-- Name: users_view; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_view (
    id uuid,
    email character varying(255),
    role text,
    banned boolean,
    created_at timestamp with time zone
);


--
-- TOC entry 247 (class 1259 OID 230735)
-- Name: wallet_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_addresses (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    network character varying(50) NOT NULL,
    address character varying(255) NOT NULL,
    label character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 248 (class 1259 OID 230744)
-- Name: wallet_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_logs (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    coin text NOT NULL,
    change numeric NOT NULL,
    balance_before numeric NOT NULL,
    balance_after numeric NOT NULL,
    type text NOT NULL,
    reference_id uuid,
    description text,
    created_at timestamp without time zone
);


--
-- TOC entry 249 (class 1259 OID 230756)
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    coin text NOT NULL,
    balance numeric DEFAULT 0,
    frozen_balance numeric DEFAULT 0,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    wallet_type character varying(20) DEFAULT 'trading'::character varying NOT NULL,
    CONSTRAINT wallets_type_check CHECK (((wallet_type)::text = ANY (ARRAY[('funding'::character varying)::text, ('trading'::character varying)::text])))
);


--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN wallets.wallet_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wallets.wallet_type IS 'Type of wallet: funding (for deposits/withdrawals) or trading (for trading activities)';


--
-- TOC entry 250 (class 1259 OID 230769)
-- Name: withdraw_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdraw_requests (
    id uuid NOT NULL,
    user_id uuid,
    amount numeric NOT NULL,
    address text NOT NULL,
    tx_hash text,
    status text,
    created_at timestamp with time zone,
    approved_at timestamp with time zone
);


--
-- TOC entry 251 (class 1259 OID 230777)
-- Name: withdraws; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdraws (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    coin text NOT NULL,
    network text NOT NULL,
    amount numeric NOT NULL,
    address text NOT NULL,
    txid text,
    status text,
    created_at timestamp without time zone
);


--
-- TOC entry 3448 (class 2604 OID 230788)
-- Name: settings_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_history ALTER COLUMN id SET DEFAULT nextval('public.settings_history_id_seq'::regclass);


--
-- TOC entry 3450 (class 2604 OID 230789)
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- TOC entry 3461 (class 2604 OID 230790)
-- Name: uploaded_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images ALTER COLUMN id SET DEFAULT nextval('public.uploaded_images_id_seq'::regclass);


--
-- TOC entry 3691 (class 0 OID 230493)
-- Dependencies: 220
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_logs (id, admin_id, action, details, created_at) FROM stdin;
94ebf3b6-5729-446c-a48e-bef58183912f	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 100, "old_win_rate": 0, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 17:37:45.903935+00
cba11a1d-dda7-4c34-9ca2-d41c6673c823	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 1, "old_win_rate": 100, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 17:40:55.200987+00
8b7944ce-9526-4137-a0ee-19d1c329837e	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 100, "old_win_rate": 1, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 17:53:57.40557+00
a5001f3a-cb22-4104-baab-adc42bf8dbce	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 100, "old_win_rate": 100, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 18:00:31.756307+00
94307b0f-f29c-4430-8b5a-17dc0151d4eb	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 1, "old_win_rate": 100, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 18:03:07.740602+00
f3a72440-8ef8-42e9-8360-84155a2fb18f	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "rokeroke41@gmail.com", "new_win_rate": 1, "old_win_rate": 0, "target_user_id": "0d9fd4bd-28a4-4a67-a87b-80af24ceaec0"}	2026-08-25 19:12:25.0759+00
f10d1a77-bfa2-4a39-b76b-09c701f1508e	8a0ea156-beea-4748-8712-e932367886b2	CHANGE_WINRATE	{"target_user": "admin@walnesia.com", "new_win_rate": 100, "old_win_rate": 1, "target_user_id": "592542db-23d1-4d6a-91a8-e183b9bd570d"}	2026-08-25 19:23:10.829333+00
1ec7cc88-59f2-411b-995e-a43c099f1c51	592542db-23d1-4d6a-91a8-e183b9bd570d	CHANGE_WINRATE	{"target_user": "dianmda833@gmail.com", "new_win_rate": 100, "old_win_rate": 0, "target_user_id": "fb88afb5-29c2-45f5-8731-6daa4887808e"}	2026-09-03 10:22:55.02514+00
\.


--
-- TOC entry 3692 (class 0 OID 230500)
-- Dependencies: 221
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, session_id, sender_id, sender_type, message, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3693 (class 0 OID 230514)
-- Dependencies: 222
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, user_id, status, last_message_at, created_at) FROM stdin;
fd733c0a-e4c7-4e10-8712-645c0530d4d9	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	open	2026-08-25 19:19:08.283742+00	2026-08-25 19:19:08.283742+00
5a526507-bfad-482c-8f42-a0041add13f3	fb88afb5-29c2-45f5-8731-6daa4887808e	open	2026-09-05 06:36:52.626622+00	2026-09-05 06:36:52.626622+00
\.


--
-- TOC entry 3694 (class 0 OID 230527)
-- Dependencies: 223
-- Data for Name: deposit_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposit_methods (id, coin, network, address, qr_code_url, is_active, created_at, updated_at) FROM stdin;
56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	TETjaW2ghourJ5bvXfzCEgL5wXKuHQ2gPR	/uploads/1788466284844_63251w.png	t	\N	2026-09-03 20:11:25.662953
63e610d1-9262-4cf3-b299-7f976076e5b6	BTC	BITCOIN	15dB6bneip7i3XKDEXe7BGnjdgyHEiGhkE	/uploads/1788466317194_8vwqsi.png	f	\N	2026-09-03 20:12:11.95544
62fe76c2-48ef-4685-a8c1-8227b058fcce	ETH	ETH	0xbf4cb80dce292ea00dcc212bdbd4cbbe4fbb4324	/uploads/1788466310780_lvi3.png	f	\N	2026-09-03 20:12:15.746904
9858cc3e-6056-4a38-b549-f2cd461c2532	USDT	ERC20	0xbf4cb80dce292ea00dcc212bdbd4cbbe4fbb4324	/uploads/1788466299070_6z474d.png	f	\N	2026-09-03 20:12:19.47796
\.


--
-- TOC entry 3695 (class 0 OID 230537)
-- Dependencies: 224
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposits (id, user_id, deposit_method_id, coin, network, amount, txid, proof_url, status, created_at) FROM stdin;
f97f4b45-7980-4815-af9b-3bb95188d3b0	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	63e610d1-9262-4cf3-b299-7f976076e5b6	BTC	BITCOIN	1	-	/uploads/proofs/0d9fd4bd-28a4-4a67-a87b-80af24ceaec0_1787685072761.jpg	approved	2026-08-25 19:11:13.36908
\.


--
-- TOC entry 3696 (class 0 OID 230549)
-- Dependencies: 225
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verifications (id, email, otp_code, password_hash, created_at, expires_at, verified, attempts) FROM stdin;
59198f75-9917-4798-a5b4-eefff22c2562	test_92d3627f@testsprite.com	985772	PENDING_REGISTRATION	2026-08-25 15:32:36.887982+00	2026-08-25 15:37:36.887+00	f	0
30ae35aa-bd46-4c5e-8864-67cc4834c103	admin@walnesia.com	846244	PENDING_REGISTRATION	2026-08-25 17:33:29.886981+00	2026-08-25 17:38:29.886+00	t	1
1502850d-631a-49f2-bf54-f1326fc71b0b	rokeroke41@gmail.com	900706	PENDING_REGISTRATION	2026-08-25 17:36:59.0949+00	2026-08-25 17:41:59.094+00	t	0
b660131a-bdec-4013-9552-8de06c7912f2	dianmda833@gmail.com	310520	PENDING_REGISTRATION	2026-09-03 10:02:29.718+00	2026-09-03 10:07:29.717+00	t	0
7ca758d5-0d64-462a-8b9e-6a4779566d89	iwaldlh@gmail.com	781582	PENDING_REGISTRATION	2026-09-08 17:05:13.928195+00	2026-09-08 17:10:13.928+00	t	0
92ba865d-4e3d-408f-b319-43b0c6e2a76e	andri281010@gmail.com	455849	PENDING_REGISTRATION	2026-09-08 18:32:49.38129+00	2026-09-08 18:37:49.381+00	t	0
e2d444d6-ac76-482b-8cc7-0e5a0e3a24fe	juliuxsheikh1@gmail.com	200000	PENDING_REGISTRATION	2026-09-13 01:17:29.478644+00	2026-09-13 01:22:29.478+00	f	0
1d8dbcbd-fd38-459d-9b18-142335175bea	gudone2021@gmail.com	608474	PENDING_REGISTRATION	2026-09-09 19:31:24.776275+00	2026-09-09 19:36:24.776+00	f	0
8bf8d329-64ff-45c7-b75d-25823e085450	rubanrub23@gmail.com	134544	PENDING_REGISTRATION	2026-09-09 19:33:22.46352+00	2026-09-09 19:38:22.463+00	f	0
\.


--
-- TOC entry 3697 (class 0 OID 230563)
-- Dependencies: 226
-- Data for Name: kyc_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kyc_submissions (id, user_id, name, id_card_number, id_card_front_filename, id_card_back_filename, status, admin_note, submitted_at, reviewed_at, reviewed_by) FROM stdin;
1aa0dd05-202d-4fe0-ab7d-db172a226b8c	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	asu	0181881	f014e96a-1f5c-41bb-bd4f-ecb602a3ac43.jpg	95efcbfd-23e0-4ed8-9bc3-a9bd8a4529f6.jpg	approved	\N	2026-08-25 19:10:30.268362+00	2026-08-25 19:10:57.650132+00	8a0ea156-beea-4748-8712-e932367886b2
de8bf5d7-5b63-41b0-b720-c71de63afafa	592542db-23d1-4d6a-91a8-e183b9bd570d	Teeee	756330743	1b0f1fb5-78f0-48c5-9d7b-24dfab77a3b1.jpg	96c2c2f7-55a4-42d8-8b57-76a992453f49.jpg	approved	\N	2026-08-25 19:38:12.04067+00	2026-08-25 19:44:53.73332+00	8a0ea156-beea-4748-8712-e932367886b2
e33aea83-a50b-4a5d-9dd4-2ced2b96d926	fb88afb5-29c2-45f5-8731-6daa4887808e	Dian	210374646292	512239ab-613e-4164-a31c-bb2b6b2334f2.jpg	b3135e14-bf0c-44e1-9ee9-acdcdfd6fcb2.jpg	approved	\N	2026-09-03 10:04:19.695427+00	2026-09-03 10:15:52.101788+00	592542db-23d1-4d6a-91a8-e183b9bd570d
0822230b-9a66-4e96-bfb0-c20302e57099	9652878a-5095-4617-af3d-bd327c00b08f	Iwal Abdalah	3202042104050002	0f2fc32b-ea2b-4711-88bc-fbcec42ca021.jpg	d91201d8-dcc6-4d48-9d40-7483f58dfbab.jpg	approved	\N	2026-09-08 17:07:07.195342+00	2026-09-08 17:07:40.121973+00	592542db-23d1-4d6a-91a8-e183b9bd570d
\.


--
-- TOC entry 3698 (class 0 OID 230578)
-- Dependencies: 227
-- Data for Name: option_durations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_durations (id, seconds, is_active, payout_percent, min_amount) FROM stdin;
33302a99-977c-4c14-abca-8dac8773abec	30	t	20	10
e8c2fd9e-f8d3-4dfb-a6a3-c9227f7bff4d	60	t	30	500
2551e64e-7ac8-4ac0-aa94-4bb7c8e2ef84	90	t	40	5000
e54dc34f-191e-452b-a464-c0c20eff07d3	120	t	50	10000
66cc2d85-b9e7-4144-ab08-376c8017d132	180	t	70	300000
40fce8a0-f31d-49b8-9b31-1c1631882748	160	t	60	20000
\.


--
-- TOC entry 3699 (class 0 OID 230587)
-- Dependencies: 228
-- Data for Name: option_pairs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_pairs (id, symbol, is_active) FROM stdin;
1984a1ac-55a4-47f6-a5f9-4f06e4d86194	ADA	t
021f9e09-12e3-47b6-8c32-90d6ec1a2859	BNB	t
ef1e5aed-b913-4d2b-8d53-b939a263e744	BTC	t
6f793b96-b459-40b1-a1e0-3c41c59cfe59	DOGE	t
1100f876-84f4-4f8f-93e5-669fb2f3bbec	ETH	t
f88d9524-23d6-4067-8ce5-97bca65e0dbf	LTC	t
af6fe6b4-1536-4191-85fa-c57d17d383ad	SOL	t
048ed303-69c5-4fc1-9480-74e84e1659fe	TRX	t
bdd9c017-cffa-4a96-af10-97fb8e6518ab	XRP	t
\.


--
-- TOC entry 3700 (class 0 OID 230595)
-- Dependencies: 229
-- Data for Name: option_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_settings (id, min_amount, max_amount, is_enabled, profit_percent, payout_percent) FROM stdin;
d7b118c5-900d-43e3-8e33-c4ee6fcc156b	10	1000	t	80	80
\.


--
-- TOC entry 3701 (class 0 OID 230606)
-- Dependencies: 230
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.options (id, user_id, symbol, direction, amount, entry_price, exit_price, profit, status, duration, expires_at, created_at, payout_percent, closed_at) FROM stdin;
e54ac18f-1f6c-4ecd-97fd-32697f2e812a	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	200	89748.61	89748.61	0	lose	30	2025-12-15 12:45:14.473+00	2025-12-15 12:44:44.473782+00	80	2025-12-15 12:45:15.405365+00
ae4ee906-7dab-4385-a9df-e86b76192b11	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3617	0.3609	100	win	30	2025-12-21 15:57:06.313+00	2025-12-21 15:56:36.314042+00	10	2025-12-21 15:57:13.131959+00
1c1692d9-30f8-4043-9e65-f215003213be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	500	89748.61	89748.61	0	lose	30	2025-12-15 12:46:10.315+00	2025-12-15 12:45:40.315713+00	80	2025-12-15 12:46:10.43467+00
39fd11c0-acf4-403f-acc2-efa97308c57f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3609	0.3607	100	win	30	2025-12-21 16:12:19.3+00	2025-12-21 16:11:49.301504+00	10	2025-12-21 16:12:23.237247+00
d7e9a3aa-b185-46b2-a1cf-1b499d52e4c7	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89748.61	89748.61	0	lose	30	2025-12-15 12:48:53.483+00	2025-12-15 12:48:23.484602+00	80	2025-12-15 12:48:53.709654+00
824b9b46-bdc1-48ef-9f84-59551e06e9be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89665.08	89665.08	0	lose	30	2025-12-15 12:52:05.147+00	2025-12-15 12:51:35.148599+00	80	2025-12-15 12:52:07.195692+00
3c58d870-939d-48ac-9d2e-e0644cc0c436	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3607	0.361	100	win	30	2025-12-21 16:18:06.135+00	2025-12-21 16:17:36.136276+00	10	2025-12-21 16:18:13.290473+00
9b913e4f-3a5a-409b-a907-78a902d71b68	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	1000	3154.36	3155.25	0	lose	30	2025-12-15 12:53:01.525+00	2025-12-15 12:52:31.525679+00	80	2025-12-15 12:53:02.121734+00
c79a13e0-accd-4919-901d-f3505252e5ca	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88215.28	88099.99	0	lose	30	2025-12-21 16:19:02.287+00	2025-12-21 16:18:32.289673+00	10	2025-12-21 16:19:03.284067+00
bc937469-75f6-4be0-a8a6-6fb27dab1bb0	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	500	3155.5	3155.28	400	win	30	2025-12-15 12:53:41.421+00	2025-12-15 12:53:11.42179+00	80	2025-12-15 12:53:42.156812+00
54f8c001-8e0c-4e89-a79c-394bd224c47c	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	200	89534.66	89516.1	0	lose	30	2025-12-15 13:47:36.041+00	2025-12-15 13:47:06.045285+00	80	2025-12-15 13:47:36.488597+00
a602418e-537b-45ca-9fcb-12699f713434	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88099.99	88107.81	100	win	30	2025-12-21 16:19:45.61+00	2025-12-21 16:19:15.611135+00	10	2025-12-21 16:19:53.258079+00
154e0315-03b7-48bf-a1e0-03f9e4210544	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	200	89511.75	89562.46	0	lose	30	2025-12-15 13:48:24.805+00	2025-12-15 13:47:54.805744+00	80	2025-12-15 13:48:25.488131+00
eb664a26-ad52-46f2-a9cb-7d923bb386ec	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	86438.15	86430.01	0	lose	30	2025-12-15 23:45:54.823+00	2025-12-15 23:45:24.826305+00	80	2025-12-15 23:45:55.420135+00
f8012a2a-2c9f-43a2-8531-f6f9f8582cc3	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88107.81	88187.1	100	win	30	2025-12-21 16:20:36.572+00	2025-12-21 16:20:06.572926+00	10	2025-12-21 16:20:43.261438+00
1296e162-38f0-4e48-aa4c-0a6701448eb1	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	500	86448.9	86463.61	0	lose	30	2025-12-16 10:14:17.665+00	2025-12-16 10:13:47.668058+00	80	2025-12-16 10:14:20.622454+00
ecc2d20c-7079-4c72-82da-d167e9baabb5	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88107.81	88199.85	100	win	30	2025-12-21 16:20:51.083+00	2025-12-21 16:20:21.083694+00	10	2025-12-21 16:20:53.26345+00
5db9a8f4-fb30-4cc1-a888-3d956c686226	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86489	86488.99	800	win	30	2025-12-16 10:19:29.99+00	2025-12-16 10:18:59.990938+00	80	2025-12-16 10:19:30.611041+00
e410f04d-59de-4b91-ad7d-4851b2ce246a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88199.85	88228.58	100	win	30	2025-12-21 16:22:56.09+00	2025-12-21 16:22:26.091407+00	10	2025-12-21 16:23:03.319284+00
6250f3d1-42cd-479b-afcd-35470a148bbd	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	500	86446	86403.42	0	lose	30	2025-12-16 10:20:12.029+00	2025-12-16 10:19:42.029592+00	80	2025-12-16 10:20:20.606627+00
c9e07f2c-91bd-40ee-81c6-d1d7913ae14d	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86438	86431.05	800	win	30	2025-12-16 10:22:20.544+00	2025-12-16 10:21:50.544857+00	80	2025-12-16 10:22:21.148874+00
4e7b9382-c9ba-4a6b-a83a-78757c39d5d7	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88228.58	88297	100	win	30	2025-12-21 16:23:54.288+00	2025-12-21 16:23:24.28963+00	10	2025-12-21 16:24:03.31871+00
959419b8-0810-45f3-9a9f-dd6c5518754a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	87174.55	87138	800	win	30	2025-12-16 13:10:09.61+00	2025-12-16 13:09:39.613347+00	80	2025-12-16 13:10:10.349106+00
e4ec3b98-baff-489e-9d12-3f80c4f14a5a	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.361	0.363	0	lose	30	2025-12-21 16:24:55.693+00	2025-12-21 16:24:25.696926+00	10	2025-12-21 16:25:03.324857+00
9c6f54d5-3746-49a3-95ed-b4bf202c3a6e	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	87060	87087.88	800	win	30	2025-12-17 12:36:07.982+00	2025-12-17 12:35:37.992065+00	80	2025-12-17 12:36:16.370592+00
a427722b-fbf9-4aac-beba-7e5aaf35a06b	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88197.24	88197.24	0	lose	30	2025-12-20 15:18:45.191+00	2025-12-20 15:18:15.192972+00	80	2025-12-20 15:18:46.196213+00
23f6bf6d-0955-4068-9ef1-c9c89694dcd7	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.363	0.3634	0	lose	30	2025-12-21 16:25:50.869+00	2025-12-21 16:25:20.870876+00	10	2025-12-21 16:25:53.329802+00
732b7e27-3234-4219-8e70-ec217023a918	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3634	0.3635	0	lose	30	2025-12-21 16:26:30.074+00	2025-12-21 16:26:00.074946+00	10	2025-12-21 16:26:33.322952+00
d7a3b70a-012e-4278-acfd-a329c36fee4f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	200	0.3766	0.377	0	lose	90	2025-12-20 15:32:15.871+00	2025-12-20 15:30:45.871522+00	80	2025-12-20 15:32:16.261966+00
80f388af-201a-430a-aac1-2661c6a59ca0	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3766	0.3774	800	win	600	2025-12-20 15:35:25.937+00	2025-12-20 15:25:25.93777+00	80	2025-12-20 15:35:33.216779+00
fc2e945d-6fa2-4492-bf17-fe7774471174	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3766	0.3772	0	lose	600	2025-12-20 15:40:06.817+00	2025-12-20 15:30:06.817942+00	80	2025-12-20 15:40:13.230548+00
45419aef-0710-49d9-aa4d-5d0bc810e07c	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3635	0.3638	-100	lose	30	2025-12-21 16:32:12.918+00	2025-12-21 16:31:42.919497+00	10	2025-12-21 16:32:14.48113+00
ab6cbf65-d88b-49f4-b573-27d393e816d8	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3772	0.377	0	lose	30	2025-12-20 16:24:13.952+00	2025-12-20 16:23:43.959168+00	10	2025-12-20 16:24:23.599334+00
92cacaad-ed90-41ac-9aba-c5ef5ac96fb3	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3638	0.3633	-100	lose	30	2025-12-21 16:32:59.211+00	2025-12-21 16:32:29.212052+00	10	2025-12-21 16:33:04.431533+00
d5e02c9a-b1af-4c64-89b0-aaf3ffe016fe	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.377	0.3771	0	lose	30	2025-12-20 16:27:18.321+00	2025-12-20 16:26:48.323251+00	10	2025-12-20 16:27:23.441633+00
423cc4fc-a6c9-4ee5-9417-3a9a2b8c48c4	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	500	88134.82	88162.45	0	lose	30	2025-12-20 16:35:00.8+00	2025-12-20 16:34:30.801817+00	10	2025-12-20 16:35:03.459715+00
fb00767a-2142-42c0-b321-a7def2e1e094	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	89487.03	89239.99	10	win	30	2025-12-22 15:36:30.118+00	2025-12-22 15:36:00.131343+00	10	2025-12-22 15:36:39.513909+00
4c8ad56b-ddcd-4d1c-b95d-309439e370bf	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3771	0.3761	100	win	30	2025-12-20 16:40:39.428+00	2025-12-20 16:40:09.429142+00	10	2025-12-20 16:40:43.507709+00
f8f77ae0-afb7-4674-8218-97c1db2ac0da	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.3633	0.3752	20	win	30	2025-12-22 15:39:16.829+00	2025-12-22 15:38:46.830109+00	10	2025-12-22 15:39:19.507845+00
790bf71a-4e2c-4803-a0bc-b94c3e4c5545	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3761	0.3757	0	lose	30	2025-12-20 16:43:07.244+00	2025-12-20 16:42:37.247385+00	10	2025-12-20 16:43:13.558616+00
7136192f-fef2-4451-8696-7e7683b3c4e3	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	200	0.3757	0.3596	0	lose	30	2025-12-21 15:40:33.399+00	2025-12-21 15:40:03.403279+00	10	2025-12-21 15:40:43.152287+00
12798157-4fd6-441d-8377-1c8ccf892d09	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	500	0.3752	0.377	-50	lose	30	2025-12-22 15:48:27.169+00	2025-12-22 15:47:57.171295+00	10	2025-12-22 15:48:29.793363+00
5a9f0fce-0dab-4ecf-97b3-ce86e7054f50	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3596	0.3596	0	lose	30	2025-12-21 15:46:12.076+00	2025-12-21 15:45:42.07843+00	10	2025-12-21 15:46:13.020683+00
4aca53da-4a42-4dc0-9bbe-b3e32ad1d14b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.377	0.3777	20	win	30	2025-12-22 15:52:09.41+00	2025-12-22 15:51:39.411338+00	10	2025-12-22 15:52:09.834922+00
2b0a6168-92dd-45d4-a174-2b8c586bbb6e	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3596	0.3617	100	win	30	2025-12-21 15:55:06.467+00	2025-12-21 15:54:36.469264+00	10	2025-12-21 15:55:13.786277+00
3f9b582d-b9ad-4171-ab81-961296987ce9	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	500	0.3777	0.3802	-500	lose	30	2025-12-22 15:57:37.336+00	2025-12-22 15:57:07.340545+00	10	2025-12-22 15:57:41.952322+00
08472fad-d140-44dd-a7eb-948b1b1ff0ee	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	100	0.3802	0.3788	10	win	30	2025-12-22 16:05:33.553+00	2025-12-22 16:05:03.556965+00	10	2025-12-22 16:05:42.195065+00
f6aa6366-7cff-49f8-931c-02129c41b0a5	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	100	0.3788	0.3795	-100	lose	30	2025-12-22 16:06:34.813+00	2025-12-22 16:06:04.814077+00	10	2025-12-22 16:06:42.167389+00
b9fa9d55-097e-4101-94b8-a35361304a6a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	200	0.3795	0.3793	20	win	30	2025-12-22 16:09:47.28+00	2025-12-22 16:09:17.281973+00	10	2025-12-22 16:09:48.729358+00
3a01c894-9543-487c-9fa0-a5a86c4eed54	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.3793	0.3797	20	win	30	2025-12-22 16:10:32.368+00	2025-12-22 16:10:02.369395+00	10	2025-12-22 16:10:33.479414+00
38d5f5df-a4b8-45d7-8401-f2d22565870b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	200	0.3797	0.3806	-200	lose	30	2025-12-22 16:11:50.288+00	2025-12-22 16:11:20.289209+00	10	2025-12-22 16:11:50.514227+00
13d5b729-4d3a-4ac3-b41e-29c62a119096	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	87766.81	87802.01	-10	lose	30	2025-12-23 16:40:42.522+00	2025-12-23 16:40:12.555523+00	10	2025-12-23 16:40:42.933698+00
9ea3e9bd-3290-4c79-bad0-997ba03144f4	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	87799.45	87801.47	-10	lose	30	2025-12-23 16:41:48.553+00	2025-12-23 16:41:18.554347+00	10	2025-12-23 16:41:48.776465+00
bd879ce3-02a5-4711-829e-9c1f8c5af1d4	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	1000	86948.45	86930.39	100	win	30	2025-12-24 14:59:44.522+00	2025-12-24 14:59:14.524777+00	10	2025-12-24 14:59:45.473561+00
6ebbefa8-6f32-4d1d-a13d-565672b8ac28	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	1000	87565.99	87566	-100	lose	30	2025-12-27 15:55:57.1+00	2025-12-27 15:55:27.10392+00	10	2025-12-27 15:55:58.315738+00
9e65c304-3d90-4e39-9f13-3e28a586b37c	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	down	1000	2921.53	2922.11	-100	lose	30	2025-12-27 17:05:17.478+00	2025-12-27 17:04:47.501398+00	10	2025-12-27 17:05:18.013069+00
dc76bb5d-921a-4ea3-99e2-efaedb1e72fa	8a0ea156-beea-4748-8712-e932367886b2	BTC	down	1000	88685.6	88597.22836186345	100	win	30	2025-12-31 01:38:28.312+00	2025-12-31 01:37:58.313254+00	10	2025-12-31 01:38:28.532386+00
e4f1373e-c9bb-4b07-a171-485f2b5f6a04	8a0ea156-beea-4748-8712-e932367886b2	BTC	down	1000	88665.21	88650.89	100	win	30	2025-12-31 01:39:47.03+00	2025-12-31 01:39:17.030449+00	10	2025-12-31 01:39:47.513732+00
2d0f9c5a-4771-4430-9fa2-cb8b8d66c604	8a0ea156-beea-4748-8712-e932367886b2	BTC	down	500	88680.37	88671.3	50	win	30	2025-12-31 01:40:51.567+00	2025-12-31 01:40:21.568319+00	10	2025-12-31 01:40:52.625194+00
c8761351-d45e-4ae7-b78b-72137f1e6016	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	up	100	89699.99	89687.12	-10	lose	30	2026-01-02 15:43:10.879+00	2026-01-02 15:42:40.880509+00	10	2026-01-02 15:43:11.807136+00
8114cc73-3051-4b03-ab23-f7d215b701cf	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	down	10000	89732.51	89764	-2000	lose	90	2026-01-02 15:44:57.258+00	2026-01-02 15:43:27.258498+00	20	2026-01-02 15:44:57.850962+00
d7dda447-0c48-4cea-a426-27a7e95dc5cb	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	down	1000	90064	90056.82	100	win	30	2026-01-02 16:46:33.781+00	2026-01-02 16:46:03.786733+00	10	2026-01-02 16:46:34.162503+00
a4b150d7-2c74-4403-b12c-d1e4322d6787	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	down	1000	90381.09	90444.57	-100	lose	30	2026-01-02 16:59:28.351+00	2026-01-02 16:58:58.357008+00	10	2026-01-02 16:59:29.615625+00
f1289b24-2c74-42b2-8079-8c5cddc08daf	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	up	1000	90913.84	90965.54663676111	100	win	30	2026-01-02 17:21:21.326+00	2026-01-02 17:20:51.328591+00	10	2026-01-02 17:21:22.182071+00
74c8cb27-37db-401e-b8ae-30f7c4a762d1	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	up	1000	90792.01	90844	100	win	30	2026-01-02 17:22:11.815+00	2026-01-02 17:21:41.816086+00	10	2026-01-02 17:22:12.237773+00
0fda6291-fe14-4835-b9e5-d5ae3acd0a14	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	up	1000	90802.35	90838.48	100	win	30	2026-01-02 17:22:24.175+00	2026-01-02 17:21:54.175739+00	10	2026-01-02 17:22:25.228973+00
f0655029-b62f-41af-8562-e036099cdaa3	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	down	1000	90848.59	90758.52	100	win	30	2026-01-02 17:22:43.661+00	2026-01-02 17:22:13.662572+00	10	2026-01-02 17:22:44.246802+00
7684f1c4-80d2-4ae1-acd9-e6e263061082	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	down	1000	90850	90774.17978013812	100	win	30	2026-01-02 17:23:29.521+00	2026-01-02 17:22:59.522216+00	10	2026-01-02 17:23:30.264045+00
07f03ba3-5a25-42cf-a5da-eff6f7e93efc	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	up	1000	90780.03	90866.97529580636	100	win	30	2026-01-02 17:24:29.327+00	2026-01-02 17:23:59.327948+00	10	2026-01-02 17:24:30.306066+00
e6ea6fad-8a6a-429a-965d-93ab91218083	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	100	77186.01	77245.25536320306	20	win	30	2026-09-10 17:03:07.436+00	2026-09-10 17:02:37.442072+00	20	2026-09-10 17:03:08.318119+00
89f5920f-38da-40e5-9b85-040fe5199beb	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79062	79080.05	100	win	30	2026-08-25 17:40:14.961+00	2026-08-25 17:39:44.96285+00	10	2026-08-25 17:40:15.60908+00
20cfb4df-935c-4f99-9851-b99dd67380cd	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	100	77128	77151.81	20	win	30	2026-09-10 17:04:26.063+00	2026-09-10 17:03:56.06375+00	20	2026-09-10 17:04:26.371751+00
ea53114e-149d-4fa9-b603-cb7438b6a1fb	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79134.36	79167.99	100	win	30	2026-08-25 17:41:33.48+00	2026-08-25 17:41:03.481325+00	10	2026-08-25 17:41:33.65578+00
f276925d-c475-40de-829d-428fcbc6ccc3	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	15000	77149.36	77149.37	3000	win	30	2026-09-10 19:22:43.343+00	2026-09-10 19:22:13.343639+00	20	2026-09-10 19:22:44.14623+00
e51c1246-b1bd-4ddb-b24a-310e98da9e10	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79142.06	79138	-100	lose	30	2026-08-25 17:42:35.588+00	2026-08-25 17:42:05.589017+00	10	2026-08-25 17:42:36.647436+00
013ac40b-1061-4d71-a1eb-a10e6b3bc434	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79192.61	79176	-1000	lose	10	2026-08-25 17:53:28.726+00	2026-08-25 17:53:18.727279+00	100	2026-08-25 17:53:29.037617+00
a0cfbaa1-5032-481c-a9c4-0a6376d6bad4	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	13000	77283.04	77268.08	2600	win	30	2026-09-10 20:58:54.687+00	2026-09-10 20:58:24.68827+00	20	2026-09-10 20:58:54.88101+00
dfe6ed5a-8bd1-4f13-8ed5-4a8e8b0520fa	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79191.74	79217.03	1000	win	10	2026-08-25 17:54:12.856+00	2026-08-25 17:54:02.856455+00	100	2026-08-25 17:54:13.046038+00
a403685e-5a19-4c6b-9ec5-ab592ae4ddb3	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	12000	77193	77145.94811374391	2400	win	30	2026-09-10 21:37:54.88+00	2026-09-10 21:37:24.881079+00	20	2026-09-10 21:37:55.630063+00
ae4e83e2-d68d-4391-b3db-af084aaaa302	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	down	10000	79222.01	79176.21344261953	1000	win	30	2026-08-25 18:01:06.738+00	2026-08-25 18:00:36.738485+00	10	2026-08-25 18:01:07.333963+00
19f7e87a-e163-403c-bd23-ff32ac1f1d87	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	down	1000	79290.09	79323.01	-1000	lose	10	2026-08-25 18:03:23.908+00	2026-08-25 18:03:13.909272+00	100	2026-08-25 18:03:24.419747+00
0dbc0526-dcac-428c-bdf7-5026571aeb37	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	5000	77630.31	77593.46	1000	win	30	2026-09-11 13:11:58.618+00	2026-09-11 13:11:28.61992+00	20	2026-09-11 13:11:59.415431+00
e3e09727-f16e-4989-9d25-43b97e401d1c	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	down	1000	79094.01	79080	1000	win	10	2026-08-25 19:12:10.704+00	2026-08-25 19:12:00.705644+00	100	2026-08-25 19:12:11.255661+00
4ccd8910-e93f-40f3-b9b3-c7b500f2351b	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	5000	77600.26	77649.42	1000	win	30	2026-09-11 13:12:19.521+00	2026-09-11 13:11:49.522341+00	20	2026-09-11 13:12:20.472416+00
b440d3ca-5d84-44f7-b6e6-8ff0a27aec24	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	down	1000	79058.64	79061.16	-1000	lose	10	2026-08-25 19:12:41.279+00	2026-08-25 19:12:31.27939+00	100	2026-08-25 19:12:42.244784+00
081f4eb2-2b79-4585-8a82-395493e44a30	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	down	2000	79073.47	79085.99	-2000	lose	30	2026-08-25 19:13:25.484+00	2026-08-25 19:12:55.485043+00	10	2026-08-25 19:13:26.270182+00
a29d2fa3-8d28-4b05-9412-6260828b3a47	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	20000	77328	77277.22	4000	win	30	2026-09-11 13:36:51.746+00	2026-09-11 13:36:21.747046+00	20	2026-09-11 13:36:52.129868+00
188669a6-bce3-411f-9ae8-36609ca5319c	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	30000	79199.92	79158.01	-30000	lose	30	2026-08-25 19:22:15.466+00	2026-08-25 19:21:45.466605+00	10	2026-08-25 19:22:15.580062+00
49b7d05e-c52c-4fb1-b83e-408b720f9d9c	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	153510	75909.86	75837.22929553314	30702	win	30	2026-09-16 03:01:18.964+00	2026-09-16 03:00:48.966692+00	20	2026-09-16 03:01:19.950004+00
91a4de9d-e99b-451a-a1d9-c6c09abb924a	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	30000	79162.01	79163.97	3000	win	30	2026-08-25 19:24:04.025+00	2026-08-25 19:23:34.025826+00	10	2026-08-25 19:24:04.314446+00
1a9af394-b209-4e87-b3b6-4ec3a1908c1d	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	up	1000	79163.97	79164.32	100	win	30	2026-08-25 19:24:40.786+00	2026-08-25 19:24:10.786876+00	10	2026-08-25 19:24:41.297647+00
23ad577d-668e-4e9a-9260-0738017affe9	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	184212	75944.98	75960.01	36842.4	win	30	2026-09-16 03:02:57.485+00	2026-09-16 03:02:27.485866+00	20	2026-09-16 03:02:57.905557+00
820d09db-627d-4200-a5eb-bbfb6e520e2b	592542db-23d1-4d6a-91a8-e183b9bd570d	BTC	down	100	78973.01	78911.83	10	win	30	2026-08-25 19:27:37.16+00	2026-08-25 19:27:07.160644+00	10	2026-08-25 19:27:37.383449+00
db24c0ce-555f-4211-af1c-5a8e147bed0e	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	221054	75940.44	75900.01	132632.4	win	160	2026-09-16 03:07:34.773+00	2026-09-16 03:04:54.773685+00	60	2026-09-16 03:07:35.077699+00
4019047e-02ee-4ba4-83db-c4ca2420ff68	592542db-23d1-4d6a-91a8-e183b9bd570d	TRX	down	11000	0.3384	0.3381825302238363	1100	win	30	2026-08-25 19:47:00.295+00	2026-08-25 19:46:30.296013+00	10	2026-08-25 19:47:01.037004+00
44056428-2eae-4b9f-958f-051173c12925	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	27000	77615.13	77608.02	5400	win	30	2026-09-03 10:32:04.278+00	2026-09-03 10:31:34.278593+00	20	2026-09-03 10:32:05.448409+00
6b0283a4-3223-43d2-806d-44b11a173e69	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	353686	76074	76030.31	247580.19999999998	win	180	2026-09-16 03:25:04.585+00	2026-09-16 03:22:04.586121+00	70	2026-09-16 03:25:04.753935+00
69e61447-ad2e-4c03-9fdb-04802a667933	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	2400	77537.06	77605.12380364905	480	win	30	2026-09-03 10:36:30.141+00	2026-09-03 10:36:00.142582+00	20	2026-09-03 10:36:30.414869+00
e02c4fef-938e-432d-863c-189368f05169	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	30000	81516.32	81432.88	12000	win	90	2026-09-03 20:15:53.188+00	2026-09-03 20:14:23.196467+00	40	2026-09-03 20:15:54.007711+00
8c7e17fe-ce7a-4980-8c5e-3fd7c9b702af	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	8000	79643.02	79592.89058190849	1600	win	30	2026-09-05 06:30:38.714+00	2026-09-05 06:30:08.717361+00	20	2026-09-05 06:30:39.749601+00
64ab887b-54f3-445c-b55c-a017d0f68f85	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	43600	79634.32	79574.43624813617	26160	win	160	2026-09-05 06:39:57.865+00	2026-09-05 06:37:17.866197+00	60	2026-09-05 06:39:58.013306+00
bfc2377f-d521-41ad-ab75-2157fb73ef15	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	200	79174.4	79158.09	40	win	30	2026-09-07 19:09:17.349+00	2026-09-07 19:08:47.350027+00	20	2026-09-07 19:09:17.917977+00
5e0eba2e-d1cb-45c0-9ffb-5d6be15fc12d	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	250	79158.01	79233.6189489502	50	win	30	2026-09-07 19:13:23.051+00	2026-09-07 19:12:53.052329+00	20	2026-09-07 19:13:24.025157+00
57f17ff0-d41d-4414-adba-98bfb196fda8	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	69850	79221.87	79175.58107617155	41910	win	160	2026-09-07 19:28:37.041+00	2026-09-07 19:25:57.041763+00	60	2026-09-07 19:28:37.532077+00
9fc3ef53-1a6e-496d-be6f-e206b8471c20	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	9500	79300.87	79348.64087059697	1900	win	30	2026-09-07 20:06:03.62+00	2026-09-07 20:05:33.621555+00	20	2026-09-07 20:06:04.722016+00
b5da8f8c-2e6d-45d3-9ece-043ec2297e33	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	20000	79268	79311.63965744809	4000	win	30	2026-09-07 20:07:36.806+00	2026-09-07 20:07:06.808426+00	20	2026-09-07 20:07:37.746477+00
03574b54-cd4d-40e9-b47f-d4ee700af8db	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	50	78349.56	78420.16970151341	10	win	30	2026-09-08 14:21:40.719+00	2026-09-08 14:21:10.720085+00	20	2026-09-08 14:21:41.731127+00
82ed9006-884e-4d3a-a7ea-410797ef5712	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	4000	78313.14	78251.59384141432	800	win	30	2026-09-08 14:22:11.793+00	2026-09-08 14:21:41.793942+00	20	2026-09-08 14:22:12.874682+00
bcacf7ac-ad4e-4ada-a2f6-152545e3adde	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	40000	78321.25	78250.98010747085	8000	win	30	2026-09-08 14:22:30.008+00	2026-09-08 14:22:00.009328+00	20	2026-09-08 14:22:30.72603+00
28c6c4bb-5f1b-4148-a4d8-afa38525dc58	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	10000	78504	78560.68080338396	2000	win	30	2026-09-08 20:56:40.439+00	2026-09-08 20:56:10.440682+00	20	2026-09-08 20:56:40.85375+00
6428e318-8924-4a3a-b7a9-02a124c0eac7	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	10000	78498	78506	2000	win	30	2026-09-08 20:57:22.511+00	2026-09-08 20:56:52.512004+00	20	2026-09-08 20:57:22.793114+00
c9099b29-fbe3-43ea-806c-698e272fb1f5	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	10000	78508.59	78575.66707576167	3000	win	60	2026-09-08 20:59:42.914+00	2026-09-08 20:58:42.914445+00	30	2026-09-08 20:59:43.910152+00
41263d56-1ee9-4e4c-8dab-8eb09c1aa6c5	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	down	10000	78496	78492	2000	win	30	2026-09-08 21:00:55.732+00	2026-09-08 21:00:25.732668+00	20	2026-09-08 21:00:55.938943+00
6d8fd757-919d-4243-8ce2-cf79c0dffdca	fb88afb5-29c2-45f5-8731-6daa4887808e	BTC	up	20000	78568.22	78627.73927358701	4000	win	30	2026-09-09 18:36:09.68+00	2026-09-09 18:35:39.681638+00	20	2026-09-09 18:36:10.198652+00
\.


--
-- TOC entry 3702 (class 0 OID 230619)
-- Dependencies: 231
-- Data for Name: price_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_cache (symbol, price, updated_at) FROM stdin;
ADA	0.3806	2025-12-22 16:11:50.510259+00
TRX	0.3385	2026-08-25 19:47:01.035869+00
BNB	711.8	2026-09-16 10:45:05.339+00
BTC	75987.78	2026-09-16 10:45:06.882+00
ETH	2406.41	2026-09-16 10:45:06.777+00
\.


--
-- TOC entry 3703 (class 0 OID 230626)
-- Dependencies: 232
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referrals (id, referrer_id, referred_id, created_at) FROM stdin;
\.


--
-- TOC entry 3704 (class 0 OID 230634)
-- Dependencies: 233
-- Data for Name: settings_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings_history (id, setting_key, old_value, new_value, changed_by, changed_at) FROM stdin;
1	section_company_text2	Bitgas Pro is one of US's leading digital asset exchanges, it supports USD fiat pairs. Bitgas Pro is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.	Trade Freedoms is one of US's leading digital asset exchanges, it supports USD fiat pairs. Bitgas Pro is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 21:53:35.289129
2	site_name	Tools24	Trade Freedoms	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.878521
3	site_title	Tools24 - Professional Crypto Trading Platform	Trade Freedoms - Profesional crypto trading platform	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.892561
4	site_description	Trade Bitcoin, Ethereum, and 100+ cryptocurrencies with advanced tools. Spot trading, options, secure wallet, and 24/7 support.		8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.896428
5	site_keywords	["crypto trading","bitcoin trading","ethereum trading","cryptocurrency exchange","spot trading","crypto options","digital assets","crypto wallet","trading platform"]	[]	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.901313
6	contact_email	support@tools24.online	support@tradefreedoms.com	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.905549
7	social_twitter	@tools24trading		8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:11:05.91313
8	section_company_text1	The Bitgas Pro platform was launched in 2018, with the goal to bridge the gap between traditional currencies and digital assets. An ambitious, development-focused team, located in US, is constantly working on improving and expanding the Bitgas Pro platform.	Trade Freedoms platform was launched in 2018, with the goal to bridge the gap between traditional currencies and digital assets. An ambitious, development-focused team, located in US, is constantly working on improving and expanding the Trade Freedoms platform.	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:13:43.951773
9	section_company_text2	Trade Freedoms is one of US's leading digital asset exchanges, it supports USD fiat pairs. Bitgas Pro is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.	Trade Freedoms is one of US's leading digital asset exchanges, it supports USD fiat pairs. Trade Freedoms is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.	8a0ea156-beea-4748-8712-e932367886b2	2025-12-17 22:13:43.958194
10	site_name	Trade Freedoms	Aethermarket	8a0ea156-beea-4748-8712-e932367886b2	2026-09-03 09:45:51.228098
11	site_title	Trade Freedoms - Profesional crypto trading platform	Aethermarket - Profesional crypto trading platform	8a0ea156-beea-4748-8712-e932367886b2	2026-09-03 09:45:51.235174
12	contact_email	support@tradefreedoms.com		8a0ea156-beea-4748-8712-e932367886b2	2026-09-03 09:45:51.238325
13	site_name	Aethermarket	Aether Trade	592542db-23d1-4d6a-91a8-e183b9bd570d	2026-09-03 10:17:47.440232
14	site_title	Aethermarket - Profesional crypto trading platform	Aether Trade - Profesional crypto trading platform	592542db-23d1-4d6a-91a8-e183b9bd570d	2026-09-03 10:17:47.445121
\.


--
-- TOC entry 3706 (class 0 OID 230642)
-- Dependencies: 235
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, setting_key, setting_value, setting_type, category, description, updated_at, updated_by) FROM stdin;
12	section_company_text2	Trade Freedoms is one of US's leading digital asset exchanges, it supports USD fiat pairs. Trade Freedoms is a member of the US Association of Bitcoin Companies, a self-regulating body with the goal of preventing fraud and money laundering.	text	content	Company intro paragraph 2	2025-12-17 22:13:43.958194	8a0ea156-beea-4748-8712-e932367886b2
13	section_journey_title	Start your journey of digital currency	text	content	Journey section title	2025-12-17 22:13:43.96257	8a0ea156-beea-4748-8712-e932367886b2
25	section_leading_card2_title	World Ecological Arrangement	text	content	Leading card 2 title	2025-12-17 22:13:44.036144	8a0ea156-beea-4748-8712-e932367886b2
26	section_leading_card2_text1	Localized trade service centers in many countries	text	content	Leading card 2 text 1	2025-12-17 22:13:44.046406	8a0ea156-beea-4748-8712-e932367886b2
27	section_leading_card2_text2	Promote global expansion across various business forms	text	content	Leading card 2 text 2	2025-12-17 22:13:44.084775	8a0ea156-beea-4748-8712-e932367886b2
28	section_leading_card3_title	User Friendly	text	content	Leading card 3 title	2025-12-17 22:13:44.120524	8a0ea156-beea-4748-8712-e932367886b2
29	section_leading_card3_text1	Establish a system of compensation in advance	text	content	Leading card 3 text 1	2025-12-17 22:13:44.127507	8a0ea156-beea-4748-8712-e932367886b2
30	section_leading_card3_text2	Dedicated investor protection fund	text	content	Leading card 3 text 2	2025-12-17 22:13:44.142401	8a0ea156-beea-4748-8712-e932367886b2
10	section_company_title	Company introduction	text	content	Company section title	2025-12-17 22:13:43.944079	8a0ea156-beea-4748-8712-e932367886b2
11	section_company_text1	Trade Freedoms platform was launched in 2018, with the goal to bridge the gap between traditional currencies and digital assets. An ambitious, development-focused team, located in US, is constantly working on improving and expanding the Trade Freedoms platform.	text	content	Company intro paragraph 1	2025-12-17 22:13:43.951773	8a0ea156-beea-4748-8712-e932367886b2
14	section_journey_card1_title	Trading Crypto with ZERO fees	text	content	Journey card 1 title	2025-12-17 22:13:43.967306	8a0ea156-beea-4748-8712-e932367886b2
15	section_journey_card1_text	Using a payment method to trade digital currency, 0 handling fee, safe and fast	text	content	Journey card 1 text	2025-12-17 22:13:43.974725	8a0ea156-beea-4748-8712-e932367886b2
16	section_journey_card2_title	Optimal transaction rate	text	content	Journey card 2 title	2025-12-17 22:13:43.978577	8a0ea156-beea-4748-8712-e932367886b2
17	section_journey_card2_text	Preferential transaction rates, enjoy the best quality service	text	content	Journey card 2 text	2025-12-17 22:13:43.983899	8a0ea156-beea-4748-8712-e932367886b2
18	section_journey_card3_title	24/7 Chat Support	text	content	Journey card 3 title	2025-12-17 22:13:43.992441	8a0ea156-beea-4748-8712-e932367886b2
19	section_journey_card3_text	Full-time operation mode, instant assistance whenever you need	text	content	Journey card 3 text	2025-12-17 22:13:43.997856	8a0ea156-beea-4748-8712-e932367886b2
20	section_leading_title	THE WORLD'S LEADING DIGITAL ASSET TRADING PLATFORM	text	content	Leading section title	2025-12-17 22:13:44.001798	8a0ea156-beea-4748-8712-e932367886b2
21	section_leading_subtitle	We provide reliable digital asset trading and asset management services to millions of users in more than 130 countries and regions.	text	content	Leading section subtitle	2025-12-17 22:13:44.007182	8a0ea156-beea-4748-8712-e932367886b2
22	section_leading_card1_title	Safe and Secure	text	content	Leading card 1 title	2025-12-17 22:13:44.01447	8a0ea156-beea-4748-8712-e932367886b2
23	section_leading_card1_text1	5 years of experience in Canadian asset financial services	text	content	Leading card 1 text 1	2025-12-17 22:13:44.027515	8a0ea156-beea-4748-8712-e932367886b2
24	section_leading_card1_text2	Professional distributed system and DDoS attack prevention system	text	content	Leading card 1 text 2	2025-12-17 22:13:44.031684	8a0ea156-beea-4748-8712-e932367886b2
1	site_name	Aether Trade	text	seo	Site name	2026-09-03 10:17:47.440232	592542db-23d1-4d6a-91a8-e183b9bd570d
2	site_title	Aether Trade - Profesional crypto trading platform	text	seo	Meta title	2026-09-03 10:17:47.445121	592542db-23d1-4d6a-91a8-e183b9bd570d
3	site_description		text	seo	Meta description	2026-09-03 10:17:47.447077	592542db-23d1-4d6a-91a8-e183b9bd570d
4	site_keywords	[]	json	seo	Keywords array	2026-09-03 10:17:47.448917	592542db-23d1-4d6a-91a8-e183b9bd570d
5	contact_email		text	contact	Support email	2026-09-03 10:17:47.45081	592542db-23d1-4d6a-91a8-e183b9bd570d
6	social_twitter		text	social	Twitter handle	2026-09-03 10:17:47.452799	592542db-23d1-4d6a-91a8-e183b9bd570d
7	social_facebook		url	social	Facebook URL	2026-09-03 10:17:47.454202	592542db-23d1-4d6a-91a8-e183b9bd570d
8	social_instagram		url	social	Instagram URL	2026-09-03 10:17:47.455357	592542db-23d1-4d6a-91a8-e183b9bd570d
9	social_telegram		url	social	Telegram URL	2026-09-03 10:17:47.456624	592542db-23d1-4d6a-91a8-e183b9bd570d
\.


--
-- TOC entry 3708 (class 0 OID 230652)
-- Dependencies: 237
-- Data for Name: spot_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spot_orders (id, created_at, user_id, symbol, side, type, price, amount, status, filled_amount) FROM stdin;
1765804969111	2025-12-15 13:22:48.766679+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	market	89457.73	0.00001	filled	0.00001
1765805053759	2025-12-15 13:24:13.38931+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	market	89387.14	0.0001	filled	0.0001
1765805086165	2025-12-15 13:24:46.076434+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	market	89386.96	0.001	filled	0.001
1765805007182	2025-12-15 13:23:26.574537+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	limit	89454	0.002	filled	0.002
1765805110001	2025-12-15 13:25:09.205123+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	limit	89400	0.001	filled	0.001
1765806235265	2025-12-15 13:43:54.786248+00	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	market	89508.92	0.002	filled	0.002
1765808109714	2025-12-15 14:15:09.683099+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89597.04	0.0001	filled	0.0001
1765808157420	2025-12-15 14:15:56.875372+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89545.83	0.002	filled	0.002
1765808165465	2025-12-15 14:16:05.156028+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89550.3	0.002	filled	0.002
1765808619119	2025-12-15 14:23:38.647971+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89490.16	0.005	filled	0.005
1765808650461	2025-12-15 14:24:09.637963+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	sell	market	89426.35	0.001	filled	0.001
1765890960845	2025-12-16 13:16:00.706205+00	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	87288.2	0.006	filled	0.006
1766508247793	2025-12-23 16:44:06.744082+00	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	sell	market	2954.59	5	filled	5
\.


--
-- TOC entry 3709 (class 0 OID 230667)
-- Dependencies: 238
-- Data for Name: swaps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.swaps (id, user_id, from_coin, to_coin, amount_in, amount_out, fee, rate, created_at) FROM stdin;
5db5d249-7d3e-4da2-9faf-4a19a1359130	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01128661	0.00005672	0.00001134	2025-12-15 14:58:11.250763+00
03494a56-6cb2-4828-b805-cf3c4b37dc4b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01130820	0.00005683	0.00001137	2025-12-15 15:01:49.090282+00
615d58d5-a325-49ee-84dd-91dfd718dd7a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.01000000	873.28513250	4.38836750	87767.35000000	2025-12-15 15:02:13.781301+00
ac90aabd-3bda-4c0d-a56d-8b5c71ae9dd7	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	100.00000000	0.00113001	0.50000000	0.00001136	2025-12-15 15:09:11.353996+00
abcb3cf4-61f0-4d88-ad89-43d14223fef3	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01134691	5.00000000	0.00001140	2025-12-15 15:10:37.411471+00
5371f647-dd97-4ab5-aaa3-2e84cd311330	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01135595	5.00000000	0.00001141	2025-12-15 15:12:11.070176+00
0532619c-8f5c-4183-bbb4-8a29b7cbb1dc	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.02000000	1742.86170100	8.75809900	87580.99000000	2025-12-15 15:14:19.05366+00
1dbdd9cf-43e7-4371-877c-f5c95005e7cb	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01146913	5.00000000	0.00001147	2025-12-15 15:16:49.628593+00
09de2ef7-31ed-44f7-a4b0-6887b115491f	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	USDT	1.00000000	2931.14065000	14.72935000	2945.87000000	2025-12-18 16:19:11.27744+00
6d64fe0e-f1ee-4500-9824-0d304c43e7f3	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.03000000	2634.67592250	13.23957750	88263.85000000	2025-12-19 17:21:08.576814+00
96482702-b2df-42b2-8765-b04aad9ab89b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	USDT	0.50000000	43797.06922500	220.08577500	88034.31000000	2025-12-23 17:10:57.29102+00
0bc3a350-9732-4d06-b270-d24c526419e3	8a0ea156-beea-4748-8712-e932367886b2	BTC	USDT	3.00000000	264823.28970000	1330.77030000	88718.02000000	2025-12-31 01:36:29.868889+00
f2a8a6fc-30f7-4268-b7c6-3436368a2d0f	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	USDT	1.00000000	89190.81495000	448.19505000	89639.01000000	2026-01-02 15:41:46.197006+00
7799c1f6-1bd6-40c7-a3fb-643fd77e6851	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	USDT	1.00000000	78721.21600000	395.58400000	79116.80000000	2026-08-25 19:11:45.85171+00
\.


--
-- TOC entry 3710 (class 0 OID 230680)
-- Dependencies: 239
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, user_id, title, content, status, created_at, updated_at) FROM stdin;
c9213865-f9c1-47cb-a865-fb97d1c38559	0a230878-9a65-48c1-bbe7-3b965b62af0e	tesss	ahuahauhauahauhauahuahauhauahauh	open	2025-12-20 01:19:25.415373	2025-12-20 01:19:25.415373
\.


--
-- TOC entry 3711 (class 0 OID 230693)
-- Dependencies: 240
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, coin, amount, type, status, created_at) FROM stdin;
\.


--
-- TOC entry 3712 (class 0 OID 230699)
-- Dependencies: 241
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploaded_images (id, image_key, file_name, file_path, file_url, file_size, mime_type, width, height, uploaded_at, uploaded_by) FROM stdin;
5	logo	logo-1788428910665.png	/root/trade-develop/public/uploads/logo-1788428910665.png	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/logo-1788428910665.png	75920	image/png	\N	\N	2026-09-03 09:48:31.560914	8a0ea156-beea-4748-8712-e932367886b2
21	favicon	favicon-1788429226955.png	/root/trade-develop/public/uploads/favicon-1788429226955.png	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/favicon-1788429226955.png	3325	image/png	\N	\N	2026-09-03 09:53:47.295281	8a0ea156-beea-4748-8712-e932367886b2
6	og_image	og_image-1788429238661.png	/root/trade-develop/public/uploads/og_image-1788429238661.png	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/og_image-1788429238661.png	83247	image/png	\N	\N	2026-09-03 09:53:59.623027	8a0ea156-beea-4748-8712-e932367886b2
2	mobile_slide1	mobile_slide1-1788429429253.png	/root/trade-develop/public/uploads/mobile_slide1-1788429429253.png	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/mobile_slide1-1788429429253.png	75920	image/png	\N	\N	2026-09-03 09:57:10.130752	8a0ea156-beea-4748-8712-e932367886b2
3	mobile_slide2	mobile_slide2-1788431327241.jpg	/root/trade-develop/public/uploads/mobile_slide2-1788431327241.jpg	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/mobile_slide2-1788431327241.jpg	106453	image/jpeg	\N	\N	2026-09-03 10:28:47.551235	592542db-23d1-4d6a-91a8-e183b9bd570d
4	mobile_slide3	mobile_slide3-1788431337359.jpg	/root/trade-develop/public/uploads/mobile_slide3-1788431337359.jpg	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/mobile_slide3-1788431337359.jpg	168986	image/jpeg	\N	\N	2026-09-03 10:28:57.97608	592542db-23d1-4d6a-91a8-e183b9bd570d
1	hero_bg	hero_bg-1788431403766.jpg	/root/trade-develop/public/uploads/hero_bg-1788431403766.jpg	https://pub-7f34ee4207fc4d899e212eeb20a30ed5.r2.dev/hero_bg-1788431403766.jpg	168986	image/jpeg	\N	\N	2026-09-03 10:30:04.302042	592542db-23d1-4d6a-91a8-e183b9bd570d
\.


--
-- TOC entry 3714 (class 0 OID 230708)
-- Dependencies: 243
-- Data for Name: user_registration_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_registration_info (user_id, ip_address, device_info, created_at) FROM stdin;
a24279d7-6115-418f-9d0a-0cb100370c21	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0	2026-01-01 22:36:29.66657
5c1abcbf-03c3-480f-be2f-fda3cdb95175	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0	2026-01-04 22:10:19.961731
592542db-23d1-4d6a-91a8-e183b9bd570d	103.140.78.166, 172.68.242.114	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	2026-08-25 17:34:09.265531
0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	110.76.147.34, 172.70.62.139	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	2026-08-25 17:37:30.211965
fb88afb5-29c2-45f5-8731-6daa4887808e	103.140.78.166, 172.70.143.199	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	2026-09-03 10:03:30.187385
9652878a-5095-4617-af3d-bd327c00b08f	103.140.78.166, 104.22.66.188	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36	2026-09-08 17:05:45.211498
2ec0faae-1cea-4e01-a3d6-fd30aaf32fff	36.77.250.68, 108.162.227.62	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	2026-09-08 18:33:37.743371
\.


--
-- TOC entry 3715 (class 0 OID 230715)
-- Dependencies: 244
-- Data for Name: user_win_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_win_rates (user_id, win_rate, updated_at) FROM stdin;
8a0ea156-beea-4748-8712-e932367886b2	100	2025-12-31 08:37:42.954943
a24279d7-6115-418f-9d0a-0cb100370c21	100	2026-01-03 00:20:22.965286
0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	1	2026-08-25 19:12:25.0759
592542db-23d1-4d6a-91a8-e183b9bd570d	100	2026-08-25 19:23:10.829333
fb88afb5-29c2-45f5-8731-6daa4887808e	100	2026-09-03 10:22:55.02514
\.


--
-- TOC entry 3716 (class 0 OID 230721)
-- Dependencies: 245
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role, created_at, first_name, last_name, phone, address, city, state, zip, country, email_verified, phone_verified, kyc_verified, twofa_enabled, banned, email, password_hash, last_login, referral_code, uid, visible_password) FROM stdin;
592542db-23d1-4d6a-91a8-e183b9bd570d	superadmin	2026-08-25 17:34:09.263545+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	f	f	admin@walnesia.com	$2b$10$0DlFexmCMiYU4gTSumqNr.Q3wAE1xz1T77jMyp4TmLxLUHmcoOd/q	\N	C880992F	62219849	Makemoney6688$
fb88afb5-29c2-45f5-8731-6daa4887808e	user	2026-09-03 10:03:30.185938+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	f	f	dianmda833@gmail.com	$2b$10$gifGKc.SjKvwwebJ3i0uuONC66r2KsKNoc2JxJ7Oyf5K8WYiH5mha	\N	9C4C0078	61715996	@Iwall21042005
9652878a-5095-4617-af3d-bd327c00b08f	user	2026-09-08 17:05:45.20847+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	f	f	iwaldlh@gmail.com	$2b$10$Flj9pOokciI7PkDRM.FyWuIZ93Vart875vQLMZyqnRNhJ8wNAk5V2	\N	B0A28F65	63342895	@Iwall21042005
2ec0faae-1cea-4e01-a3d6-fd30aaf32fff	user	2026-09-08 18:33:37.742104+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	f	f	f	andri281010@gmail.com	$2b$10$nkvlPStfNVXF5/.WA4UjjOLl8OxvcDfctejHJQXAd2a5dmc/H6J3m	\N	7DD34534	72997893	@Andri123
2bfb97fc-3d7e-4df1-916a-3be797aa75c7	user	2026-09-09 19:32:06.378899+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	f	f	f	gudone2021@gmail.com	$2b$10$HY4nTxloaj7QDxRnbNqf8.CRAbG/KOG6ZUzSk9Vcs0HAPxu3BwuV.	\N	5D3EED34	14105805	Gudone@12345
89b5dfd5-a529-40b8-97c4-ffad42b495c2	user	2026-09-09 19:34:02.581181+00	\N	\N	\N	\N	\N	\N	\N	\N	t	f	f	f	f	rubanrub23@gmail.com	$2b$10$CJ9pZnhwf0FeTCgnH8yRI.Zf8SlV5Yb4csfXleFuNzW4jgMcsI/9e	\N	0E88FB68	92610953	Gudone@12345
\.


--
-- TOC entry 3717 (class 0 OID 230730)
-- Dependencies: 246
-- Data for Name: users_view; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users_view (id, email, role, banned, created_at) FROM stdin;
\.


--
-- TOC entry 3718 (class 0 OID 230735)
-- Dependencies: 247
-- Data for Name: wallet_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_addresses (id, user_id, network, address, label, created_at, updated_at) FROM stdin;
545f5d2b-9e06-477a-97a9-54ca9e2e1697	0a230878-9a65-48c1-bbe7-3b965b62af0e	TRC20	iiiiuiuiu8u8u8u8u8u8u8998988	\N	2025-12-15 16:03:17.142609+00	2025-12-15 16:03:17.142609+00
5e5d703c-6268-4818-848c-b4a8c3096f9f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	wrwrwrwr34433434rw	\N	2025-12-15 16:07:09.22507+00	2025-12-15 16:07:09.22507+00
e1a3b597-6df4-431e-8ad6-cab23d220054	a24279d7-6115-418f-9d0a-0cb100370c21	ERC20	767676767gghghgygugug	\N	2026-01-02 17:40:31.41576+00	2026-01-02 17:40:52.37623+00
48e48223-83aa-4813-b84b-0be37c4a4086	fb88afb5-29c2-45f5-8731-6daa4887808e	TRC20	TETjaW2ghourJ5bvXfzCEgL5wXKuHQ2gPR	\N	2026-09-03 10:38:34.001482+00	2026-09-03 10:38:34.001482+00
\.


--
-- TOC entry 3719 (class 0 OID 230744)
-- Dependencies: 248
-- Data for Name: wallet_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_logs (id, user_id, coin, change, balance_before, balance_after, type, reference_id, description, created_at) FROM stdin;
31495e5c-8ea9-4750-8fcc-e66e5f6f85e3	023c6ce8-0cef-4d9d-bcbe-45662046a493	eth	123	369	492	deposit	5fae2f20-f666-43ee-a28b-00c140a885d8	Deposit approved	2025-12-15 19:12:11.13469
d8492c39-9f92-44f8-9420-543d108009b0	023c6ce8-0cef-4d9d-bcbe-45662046a493	usdt	200000	0	200000	deposit	05c6cb2d-17e3-44b3-af27-5cbcc5f2448c	Deposit approved	2025-12-15 19:17:48.110737
518dac4e-727c-4f90-809c-798d4205401b	023c6ce8-0cef-4d9d-bcbe-45662046a493	usdt	-1000	200000	199000	withdraw_request	03a7f3c2-94df-498c-b49f-453a7916f06c	Withdraw requested (balance frozen)	2025-12-15 19:18:49.471236
d3f801fe-01dc-4e4a-96a0-e1d4a4418bc4	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	10000	0	10000	deposit	76241e4e-04a0-4cff-8b0f-fafeceae531f	Deposit approved	2025-12-15 19:40:11.498616
11e1d115-fcf6-49ff-9562-d2a974199ae5	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-1000	10000	9000	admin_adjust	\N	Admin balance adjustment	2025-12-15 19:40:41.185729
b988984a-8762-42dc-99ad-8001f138ff2c	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-200	8400	8400	option	e54ac18f-1f6c-4ecd-97fd-32697f2e812a	\N	2025-12-15 19:45:15.410106
07824f60-23cf-4b1e-8528-f0b44b2a7302	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-500	7900	7900	option	1c1692d9-30f8-4043-9e65-f215003213be	\N	2025-12-15 19:46:10.445588
39a7c57e-4f6e-4fff-88b9-0e142dd3f800	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-1000	6900	6900	option	d7e9a3aa-b185-46b2-a1cf-1b499d52e4c7	\N	2025-12-15 19:48:53.71465
7c89d650-ee08-4108-ab4e-0edae306aee1	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-1000	5900	5900	option	824b9b46-bdc1-48ef-9f84-59551e06e9be	\N	2025-12-15 19:52:07.20095
26861fcf-3ff1-4c6b-b5be-3ecc99dd97b4	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	-1000	4900	4900	option	9b913e4f-3a5a-409b-a907-78a902d71b68	\N	2025-12-15 19:53:02.126251
c8ea355c-a8da-4ca2-af35-50f7822699be	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	400	4400	5300	option	bc937469-75f6-4be0-a8a6-6fb27dab1bb0	\N	2025-12-15 19:53:42.161544
d499ec11-3119-4618-8ff0-0e003e6c1797	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	0.002	0	0.002	spot_buy	63e0ac36-c559-45ce-9e8c-810f322a3a3d	Spot Buy Order #1765805007182	2025-12-15 20:37:45.092787
137f20de-e408-4fd8-90bc-5907bf3e162e	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	89.4	1367.6301916	1457.0301916	spot_sell	1a4737ee-3737-46a4-ba8d-09843ad09a15	Spot Sell Order #1765805110001	2025-12-15 20:42:41.90132
84be8c12-526f-4036-a2d4-2feaec26b4f5	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	10000	0	10000	deposit	68d5de26-54cb-4169-8b0f-286367614871	Deposit approved	2025-12-15 20:46:33.904734
5597cc07-3f30-4cf8-a273-449dca0a1c0c	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-200	9800	9800	option	54f8c001-8e0c-4e89-a79c-394bd224c47c	\N	2025-12-15 20:47:36.493157
fe40fc39-a28d-463a-8773-df128a5fb5bd	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-200	9600	9600	option	154e0315-03b7-48bf-a1e0-03f9e4210544	\N	2025-12-15 20:48:25.49287
2aac902c-0043-4d52-bf8e-5a718731e5df	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.005	0	0.005	spot_buy	83fcf284-5cbe-457a-b6dc-d17af08a71f4	Spot Market Order #1765808619119	2025-12-15 21:23:38.647971
5992d8ba-1c2a-4685-8c89-44a6e347a835	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	89.42635000000001	8785.397236	8874.823586	spot_sell	b2fd3527-6d47-4bdb-a6d3-d52c004181b7	Spot Market Order #1765808650461	2025-12-15 21:24:09.637963
4b1fbfa0-478a-4e09-b90b-21afbb728463	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	8874.823586	7874.823586	swap_out	1fce1388-8e0a-4dba-85ce-330c0487cdd1	Swap to BTC	2025-12-15 21:58:11.250763
6977045a-0190-4f22-87a4-f48a2a14fcee	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.011286612580160473	0.004	0.015286612580160473	swap_in	5db5d249-7d3e-4da2-9faf-4a19a1359130	Swap from USDT	2025-12-15 21:58:11.250763
1964f9ce-a9e1-4de6-9016-df0459152ddd	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	7874.823586	6874.823586	swap_out	6cd061b6-8922-4202-8c36-3d672b3a3c2a	Swap to BTC	2025-12-15 22:01:49.090282
dcc1119b-793c-4f25-925b-a42f300f03d3	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.01130819829601931	0.015286612580160473	0.026594810876179785	swap_in	03494a56-6cb2-4828-b805-cf3c4b37dc4b	Swap from USDT	2025-12-15 22:01:49.090282
9d1b84a7-4a95-48e0-bfe2-1a541379eb4b	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.01	0.02659481087617978	0.016594810876179783	swap_out	2f610b17-cf52-448b-a2ef-f72b096419ff	Swap to USDT	2025-12-15 22:02:13.781301
5d64c5f4-00bb-4636-9a99-dae56737d98a	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	873.2851325000001	6874.823586	7748.108718500001	swap_in	615d58d5-a325-49ee-84dd-91dfd718dd7a	Swap from BTC	2025-12-15 22:02:13.781301
2a4456eb-7dbd-4e17-86fc-22244494eb2b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	7748.1087185	7648.1087185	swap_out	0d0a04cc-deb1-41c1-a6ee-e160e74393ef	Swap to BTC	2025-12-15 22:09:11.353996
ede4413c-6888-4d52-951b-6dac92d8a5ab	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.0011300102325549702	0.016594810876179783	0.017724821108734752	swap_in	ac90aabd-3bda-4c0d-a56d-8b5c71ae9dd7	Swap from USDT	2025-12-15 22:09:11.353996
4d43e46e-614c-4916-9eb2-2e7a4f5a4c34	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	7648.1087185	6648.1087185	swap_out	b69334d0-65e5-4eac-902a-0f9069e2319c	Swap to BTC	2025-12-15 22:10:37.411471
b5128bca-314a-409e-941b-c86e73171d4e	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.011346907579950938	0.017724821108734752	0.02907172868868569	swap_in	abcb3cf4-61f0-4d88-ad89-43d14223fef3	Swap from USDT	2025-12-15 22:10:37.411471
965f76a8-efea-4b0e-9883-9e3b07d708e5	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	6648.1087185	5648.1087185	swap_out	a00c35fa-d089-4a04-80f7-020c3bd82dfd	Swap to BTC	2025-12-15 22:12:11.070176
784885ab-34bc-4acc-ad60-ad7900859461	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.01135594555080901	0.02907172868868569	0.0404276742394947	swap_in	5371f647-dd97-4ab5-aaa3-2e84cd311330	Swap from USDT	2025-12-15 22:12:11.070176
dcc32f13-8811-4494-9491-2a48196023e1	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.02	0.0404276742394947	0.020427674239494698	swap_out	6124f052-701f-4146-8baf-67adc67d4469	Swap to USDT	2025-12-15 22:14:19.05366
41cd2247-6b6f-4733-9e20-30ef681f39a0	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1742.8617010000003	5648.1087185	7390.9704194999995	swap_in	0532619c-8f5c-4183-bbb4-8a29b7cbb1dc	Swap from BTC	2025-12-15 22:14:19.05366
d878e17c-15e4-411d-ac31-21d64e231000	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	7390.9704195	6390.9704195	swap_out	29618b06-fcca-4620-b25d-beb5eca36268	Swap to BTC	2025-12-15 22:16:49.628593
069a5c5c-d1e2-457d-b9b6-efbaa8afdeac	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	5	6390.9704195	6385.9704195	swap_fee	ffd20b92-4fc9-42a1-b3c3-f8130bd3bf1a	Swap Fee (0.5%)	2025-12-15 22:16:49.628593
24bc6b9f-be4a-4748-a5d5-9e652e6f06ed	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.011469128889841081	0.0204276742394947	0.03189680312933578	swap_in	1dbdd9cf-43e7-4371-877c-f5c95005e7cb	Swap from USDT	2025-12-15 22:16:49.628593
6bff1f87-9587-4d86-aea9-9e39f8e6a1fa	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	6385.9704195	5385.9704195	withdraw_request	f3f43d11-cb35-4035-acc5-09ad0967bf05	Withdraw request (Amount: 1000, Fee: $5 included)	2025-12-15 23:18:40.657388
96da6c9a-2d89-4144-b062-ab6d00a6844b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	5385.9704195	6385.9704195	deposit	4bca19cb-02b0-4ae2-831a-78e408ad1c46	Deposit approved	2025-12-15 23:46:16.368194
09eb9e5c-3967-409c-a7e6-ade600ca47c1	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	10000	6385.9704195	16385.9704195	deposit	16f2733f-8665-4f68-8262-72a856fb92bd	Deposit approved	2025-12-15 23:50:38.027099
54ec73bb-4315-45c2-8eca-3dbcb3da9a76	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	16385.9704195	15385.970419500001	withdraw_request	debcfc62-85bb-4e32-92a1-c854e5d93388	Withdraw request (Amount: 1000, Fee: $5 included)	2025-12-15 23:51:34.126315
ff0db068-28ed-4a4b-b233-613b2d174eb4	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	14385.970419500001	14385.970419500001	option	eb664a26-ad52-46f2-a9cb-7d923bb386ec	\N	2025-12-16 06:45:55.428499
38a92109-6cc5-44f1-a4fa-09b956a20b8e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-500	13885.970419500001	13885.970419500001	option	1296e162-38f0-4e48-aa4c-0a6701448eb1	\N	2025-12-16 17:14:20.628016
1b3a4941-ffac-4533-8ed6-4e938bbfa8e4	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	800	12885.970419500001	14685.970419500001	option	5db9a8f4-fb30-4cc1-a888-3d956c686226	\N	2025-12-16 17:19:30.615296
fcd3110f-2a13-4218-b96a-995731955d53	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-500	14185.970419500001	14185.970419500001	option	6250f3d1-42cd-479b-afcd-35470a148bbd	\N	2025-12-16 17:20:20.609513
1d038b73-48f7-4865-b43d-1da96249592b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	800	13185.970419500001	14985.970419500001	option	c9e07f2c-91bd-40ee-81c6-d1d7913ae14d	\N	2025-12-16 17:22:21.153514
69e0cc8d-62d6-41a8-9aa2-323c29de560a	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	800	13985.970419500001	15785.970419500001	option	959419b8-0810-45f3-9a9f-dd6c5518754a	\N	2025-12-16 20:10:10.353707
603073f2-1e37-4903-a8ac-3e0dddc91615	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.006	0.03189680312933578	0.03789680312933578	spot_buy	b881598d-5ae2-4f59-a446-9cab3a9c8ad7	Spot Market Order #1765890960845	2025-12-16 20:16:00.706205
1ce7556e-60cd-43e5-bd49-6307fd4c48df	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	800	14262.241219500001	16062.241219500002	option	9c6f54d5-3746-49a3-95ed-b4bf202c3a6e	\N	2025-12-17 19:36:16.375104
b6c67869-16ee-4ca1-8e1d-53ffc602d693	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	30	0	30	deposit	b1026d97-e4d5-44b2-ae2c-730eb4bfc45b	Deposit approved	2025-12-18 23:18:16.321754
7058dcb9-9d78-4149-8b84-5e47679bf0be	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	1	30	29	swap_out	af4eed51-681b-4133-931f-60390842586b	Swap to USDT	2025-12-18 23:19:11.27744
82cc93a6-537d-40ae-a079-2744b559f48c	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	2931.14065	0	2931.14065	swap_in	09de2ef7-31ed-44f7-a4b0-6887b115491f	Swap from ETH	2025-12-18 23:19:11.27744
ad69c876-b390-44b7-8a80-731a7488453c	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	16062.241219500002	15062.241219500002	transfer_out	\N	Transfer to funding wallet	2025-12-19 23:51:12.056511
2b121c2a-8dcf-416c-81b7-c316d28c7ed7	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	0	1000	transfer_in	\N	Transfer from trading wallet	2025-12-19 23:51:12.056511
f2c21be5-36db-4317-99f7-9fd34a299dde	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	10000	1000	11000	deposit	d1591e75-aac5-4202-889d-38113e4d47d2	Deposit approved	2025-12-19 23:57:48.254975
0d91a759-8f1d-49ed-af50-959e265328da	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-15062	15062.241219500002	0.24121950000153447	transfer_out	\N	Transfer to funding wallet	2025-12-20 00:15:00.407005
14b99b2d-7bc6-4912-9cd9-695b2fb20362	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	15062	11000	26062	transfer_in	\N	Transfer from trading wallet	2025-12-20 00:15:00.407005
ad420c35-03ee-4c33-ac1a-dfb2e86e2dee	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	90	0	90	deposit	afcb0f51-6c1a-49c7-a94d-3ca2afda84ad	Deposit approved	2025-12-20 00:16:34.839373
71257e23-d170-4ce1-a591-a67b3d57dbdf	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.03	0.037896803129335785	0.007896803129335786	swap_out	3c47cb4b-babe-4223-9c11-c0749fd9d270	Swap to USDT	2025-12-20 00:21:08.576814
c3df9a38-3139-41b0-a4d6-7c1de52c404e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	2634.6759225	0.241219500002	2634.917142000002	swap_in	6d64fe0e-f1ee-4500-9824-0d304c43e7f3	Swap from BTC	2025-12-20 00:21:08.576814
25cd0c13-6088-4f80-b16f-a60f51c37604	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-2634	2634.917142000002	0.9171420000020589	transfer_out	\N	Transfer to funding wallet	2025-12-20 00:24:03.128457
45e3cc62-44bb-414b-a382-f2b1d191a97e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	2634	26062	28696	transfer_in	\N	Transfer from trading wallet	2025-12-20 00:24:03.128457
b47da383-251f-48d2-a839-ea3e0edcb3ae	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-20000	28696	8696	transfer_out	\N	Transfer to trading wallet	2025-12-20 22:17:33.372635
d606de68-be92-46ca-8a61-8ce2db87db72	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	20000	0.917142000002	20000.917142000002	transfer_in	\N	Transfer from funding wallet	2025-12-20 22:17:33.372635
529a76f0-0711-4920-91f4-df2756c3fc92	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	8696	8696	option	a427722b-fbf9-4aac-beba-7e5aaf35a06b	\N	2025-12-20 22:18:46.207007
ced19bb7-f625-4819-ab60-2f76aecb81e8	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-200	8696	8696	option	d7a3b70a-012e-4278-acfd-a329c36fee4f	\N	2025-12-20 22:32:16.2665
d685473d-a206-4d70-b28a-d6e433082ec2	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	800	16800.917142000002	18600.917142000002	option	80f388af-201a-430a-aac1-2661c6a59ca0	\N	2025-12-20 22:35:33.224592
f28d65c0-6097-4b61-b428-139325970195	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	8696	8696	option	fc2e945d-6fa2-4492-bf17-fe7774471174	\N	2025-12-20 22:40:13.236863
fe6bc8b1-f091-4638-989d-ad432b30a275	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	8696	8696	option	ab6cbf65-d88b-49f4-b573-27d393e816d8	\N	2025-12-20 23:24:23.604093
92ace1c6-5be8-404f-91d2-95ba8b0d0d66	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	8696	8696	option	d5e02c9a-b1af-4c64-89b0-aaf3ffe016fe	\N	2025-12-20 23:27:23.446624
fadd5b72-8616-4328-866d-bfb116c34bd4	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-500	8696	8696	option	423cc4fc-a6c9-4ee5-9417-3a9a2b8c48c4	\N	2025-12-20 23:35:03.464414
f515c7f0-5392-4429-a8c4-c5c5f5eb056c	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	8696	9796	option	4c8ad56b-ddcd-4d1c-b95d-309439e370bf	\N	2025-12-20 23:40:43.517073
23c4fb49-cc4c-4026-96a7-1e8b190d9b02	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	9796	9796	option	790bf71a-4e2c-4803-a0bc-b94c3e4c5545	\N	2025-12-20 23:43:13.563374
7ad3f0fe-893e-4a0a-94d3-83bc25a2a4d2	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-200	9796	9796	option	7136192f-fef2-4451-8696-7e7683b3c4e3	\N	2025-12-21 22:40:43.159821
ebadc0ad-1d3f-4b35-a279-6f107bc6212e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	9796	9796	option	5a9f0fce-0dab-4ecf-97b3-ce86e7054f50	\N	2025-12-21 22:46:13.02585
f4909434-96c4-417d-b769-0a21f9f854b0	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	9796	10896	option	2b0a6168-92dd-45d4-a174-2b8c586bbb6e	\N	2025-12-21 22:55:13.792246
f5270548-111f-4ba3-a6d5-c13fd22890c6	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	10896	11996	option	ae4ee906-7dab-4385-a9df-e86b76192b11	\N	2025-12-21 22:57:13.137805
4005cacb-9293-4545-8113-fc8803f3e0fd	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	11996	13096	option	39fd11c0-acf4-403f-acc2-efa97308c57f	\N	2025-12-21 23:12:23.245062
1eac0ceb-0b1c-4a2d-bbf0-058885ed711f	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	13096	14196	option	3c58d870-939d-48ac-9d2e-e0644cc0c436	\N	2025-12-21 23:18:13.296614
b45ee8f0-8147-44ed-9159-ee495014dd1c	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	14196	14196	option	c79a13e0-accd-4919-901d-f3505252e5ca	\N	2025-12-21 23:19:03.289133
d8af0e6d-bdde-49d4-b96b-360b2dcf86cb	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	14196	15296	option	a602418e-537b-45ca-9fcb-12699f713434	\N	2025-12-21 23:19:53.262813
89b1c0cd-a40f-4fb7-8283-7f0bd328635e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	15296	16396	option	f8012a2a-2c9f-43a2-8531-f6f9f8582cc3	\N	2025-12-21 23:20:43.265516
6020a9d8-bd25-4750-8798-c49426af9b14	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	4900.917142000002	6000.917142000002	option	ecc2d20c-7079-4c72-82da-d167e9baabb5	\N	2025-12-21 23:20:53.267553
11d574e7-5a33-4cd0-b9b4-0506988b7ccd	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	5000.917142000002	6100.917142000002	option	e410f04d-59de-4b91-ad7d-4851b2ce246a	\N	2025-12-21 23:23:03.324
3c8cccaf-84b2-481e-b63f-d68cdb9f7132	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	100	5100.917142000002	6200.917142000002	option	4e7b9382-c9ba-4a6b-a83a-78757c39d5d7	\N	2025-12-21 23:24:03.328224
019752f8-c5bc-4bba-a5ff-7e19864e5fba	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	5200.917142000002	5200.917142000002	option	e4ec3b98-baff-489e-9d12-3f80c4f14a5a	\N	2025-12-21 23:25:03.331881
f8506458-c61e-4896-973e-8ea3b272aa5b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	4200.917142000002	4200.917142000002	option	23f6bf6d-0955-4068-9ef1-c9c89694dcd7	\N	2025-12-21 23:25:53.336786
29bca3d0-b897-4a50-997d-2ede40ad792e	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-1000	3200.917142000002	3200.917142000002	option	732b7e27-3234-4219-8e70-ec217023a918	\N	2025-12-21 23:26:33.326782
0dcc14ad-99a3-4d4e-9e62-f682d4eb2e95	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-100	2200.917142000002	3100.917142000002	option	45419aef-0710-49d9-aa4d-5d0bc810e07c	\N	2025-12-21 23:32:14.491397
d18f0d1d-81a9-4443-b236-ff113a458375	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	-100	2100.917142000002	3000.917142000002	option	92cacaad-ed90-41ac-9aba-c5ef5ac96fb3	\N	2025-12-21 23:33:04.43732
27ce895a-b7f2-44ba-9bf8-eeb0044e550c	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-2000	2931.14065	931.1406499999998	transfer_out	\N	Transfer to funding wallet	2025-12-22 22:35:24.652592
cf3b4366-5c01-40e8-836b-cae95ad1fa2b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	2000	0	2000	transfer_in	\N	Transfer from trading wallet	2025-12-22 22:35:24.652592
0d7e3a48-e7e0-4221-9bb4-56fa806ff094	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	10	831.14065	941.14065	option	fb00767a-2142-42c0-b321-a7def2e1e094	\N	2025-12-22 22:36:39.522061
2afcb889-1e2f-4033-8dfe-ddbb1fd89b39	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	20	741.14065	961.14065	option	f8f77ae0-afb7-4674-8218-97c1db2ac0da	\N	2025-12-22 22:39:19.514698
9c4fbe6b-3dc5-4d02-a9e2-49fc5e6453f0	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-50	461.14065	911.14065	option	12798157-4fd6-441d-8377-1c8ccf892d09	\N	2025-12-22 22:48:29.798933
01065c52-459f-43c2-8f56-29392d10d15d	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	20	711.14065	931.14065	option	4aca53da-4a42-4dc0-9bbe-b3e32ad1d14b	\N	2025-12-22 22:52:09.841204
32fcc1dc-8b8b-490e-a028-b18ccca6c9fb	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-500	931.14065	431.14065	option	3f9b582d-b9ad-4171-ab81-961296987ce9	\N	2025-12-22 22:57:41.958061
b6fa085c-1868-4579-916a-d4a9f723e288	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	10	431.14065	441.14065	option	08472fad-d140-44dd-a7eb-948b1b1ff0ee	\N	2025-12-22 23:05:42.217758
2e68948b-d730-4c5a-9518-1b203cebc715	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-100	441.14065	341.14065	option	f6aa6366-7cff-49f8-931c-02129c41b0a5	\N	2025-12-22 23:06:42.173171
e8210d91-0a61-4152-ae90-4117bc22d2d9	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	20	341.14065	361.14065	option	b9fa9d55-097e-4101-94b8-a35361304a6a	\N	2025-12-22 23:09:48.739064
cede2f12-eb74-4a60-b109-5000a2a4d9b8	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	20	361.14065	381.14065	option	3a01c894-9543-487c-9fa0-a5a86c4eed54	\N	2025-12-22 23:10:33.484972
07f4b7d6-8a5c-49b1-9b00-f6aac41c0d8d	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-200	381.14065	181.14065	option	38d5f5df-a4b8-45d7-8401-f2d22565870b	\N	2025-12-22 23:11:50.516692
f3183af6-5eec-4943-ad48-523ebc92b9fc	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-10	181.14065	171.14065	option	13d5b729-4d3a-4ac3-b41e-29c62a119096	\N	2025-12-23 23:40:42.966443
86b47b3f-a335-413c-a7ce-438c017842ca	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-10	171.14065	161.14065	option	9ea3e9bd-3290-4c79-bad0-997ba03144f4	\N	2025-12-23 23:41:48.784366
312415bc-4bcb-4fa8-85bc-6ae3bffad500	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	14772.95	2000	16772.95	spot_sell	f554d3eb-29c1-4b59-81c4-7cddf89b3565	Spot Market Order #1766508247793	2025-12-23 23:44:06.744082
984e315a-7466-4265-9327-18eac6fc2adc	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	1	0	1	deposit	01adbaea-3ebd-4c55-8c80-1d083291ab65	Deposit approved	2025-12-24 00:09:42.862247
e0aebc2a-fecb-4ae9-8dc4-076e505eaadb	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	0.5	1	0.5	swap_out	4bb282c3-3679-4013-a27f-7aa1e8ee7d3d	Swap to USDT	2025-12-24 00:10:57.29102
cbef3b19-0715-47fd-bf38-0fb675c8fcb6	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	43797.069225	161.14065	43958.209875	swap_in	96482702-b2df-42b2-8765-b04aad9ab89b	Swap from BTC	2025-12-24 00:10:57.29102
b28998f0-905b-49eb-a216-8b552a5e83d0	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	100	43958.209875	44058.209875	option	bd879ce3-02a5-4711-829e-9c1f8c5af1d4	\N	2025-12-24 21:59:45.484518
214e9ed1-af46-4874-b89f-aae88481d1d9	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-100	44058.209875	43958.209875	option	6ebbefa8-6f32-4d1d-a13d-565672b8ac28	\N	2025-12-27 22:55:58.323542
9d28d5e3-ec3a-44ac-9d52-a5f18eb6f3ed	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	-100	43958.209875	43858.209875	option	9e65c304-3d90-4e39-9f13-3e28a586b37c	\N	2025-12-28 00:05:18.018201
0640f062-f9dd-4d1d-b965-1f7187a9119d	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	1	0.5	1.5	admin_adjust	\N	Admin balance adjustment	2025-12-31 08:14:04.259433
e3c362b4-5c9d-428d-956b-b6f2fbd3d1f8	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	1000	3000.917142000002	4000.917142000002	admin_adjust	\N	Admin balance adjustment	2025-12-31 08:14:32.455086
f98cbac9-236a-4666-997e-e3b1088df610	8a0ea156-beea-4748-8712-e932367886b2	BTC	3	0	3	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2025-12-31 08:20:56.499029
f561fbd1-02d8-4d06-a28e-df9849d7fccf	8a0ea156-beea-4748-8712-e932367886b2	ETH	2	0	2	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2025-12-31 08:35:21.636662
92460107-50e2-4aff-9458-ce583482c3a9	8a0ea156-beea-4748-8712-e932367886b2	BTC	3	3	0	swap_out	89bdb3d5-8b26-438f-b528-ac55fbe46f4d	Swap to USDT	2025-12-31 08:36:29.868889
19e74d28-b8e6-4df5-a213-68b9465b920a	8a0ea156-beea-4748-8712-e932367886b2	USDT	264823.2897	0	264823.2897	swap_in	0bc3a350-9732-4d06-b270-d24c526419e3	Swap from BTC	2025-12-31 08:36:29.868889
ab509c4f-559a-4259-bcc5-7464c2dee817	8a0ea156-beea-4748-8712-e932367886b2	USDT	100	264823.2897	264923.2897	option	dc76bb5d-921a-4ea3-99e2-efaedb1e72fa	\N	2025-12-31 08:38:28.537016
986d00e4-f37a-4013-8bac-aeb161bedef7	8a0ea156-beea-4748-8712-e932367886b2	USDT	100	264923.2897	265023.2897	option	e4f1373e-c9bb-4b07-a171-485f2b5f6a04	\N	2025-12-31 08:39:47.517744
05660a62-a1b0-48f8-adfc-77d72e7d1469	8a0ea156-beea-4748-8712-e932367886b2	USDT	50	265023.2897	265073.2897	option	2d0f9c5a-4771-4430-9fa2-cb8b8d66c604	\N	2025-12-31 08:40:52.632291
bdaf0656-dcca-4ddc-8e86-d28f3aac0b1a	8a0ea156-beea-4748-8712-e932367886b2	USDT	1000	0	1000	deposit	c634aa89-3613-4d91-bedd-bee4a52d2597	Deposit approved	2026-01-01 08:17:05.116507
d2f3cd5c-d6e2-483e-9e03-6955c10200ac	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	1	0	1	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2026-01-02 22:40:47.476098
59502993-1dcb-40e3-a58d-3bdaa0f2e8a9	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	1	1	0	swap_out	1d067e68-c4fc-4c75-840f-fcbde8588561	Swap to USDT	2026-01-02 22:41:46.197006
eef9bd11-9bb6-4830-9c67-e5ff84d51320	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	89190.81495	0	89190.81495	swap_in	f2a8a6fc-30f7-4268-b7c6-3436368a2d0f	Swap from BTC	2026-01-02 22:41:46.197006
143db5c5-60e5-439e-bea3-ce777722ffec	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-10	89190.81495	89180.81495	option	c8761351-d45e-4ae7-b78b-72137f1e6016	\N	2026-01-02 22:43:11.816272
d3c204b9-6cf3-4fd0-9e23-108502736d6b	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-2000	89180.81495	87180.81495	option	8114cc73-3051-4b03-ab23-f7d215b701cf	\N	2026-01-02 22:44:57.859836
4effed64-a1da-40e7-b1ec-626e55323d4f	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	9000	0	9000	deposit	43850774-bd5a-4021-af14-d5bdeff6e3a8	Deposit approved	2026-01-02 22:58:23.528125
ef729b9a-1c68-43b7-85ab-264388ab8365	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-8000	87180.81495	79180.81495	transfer_out	\N	Transfer to funding wallet	2026-01-02 22:59:42.985882
91f527bd-a052-4b22-896f-a01e373d4d16	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	8000	9000	17000	transfer_in	\N	Transfer from trading wallet	2026-01-02 22:59:42.985882
85ff2160-63f9-4388-83fa-09f7b2aff9b6	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	79180.81495	79280.81495	option	d7dda447-0c48-4cea-a426-27a7e95dc5cb	\N	2026-01-02 23:46:34.174209
df9ff559-ff1a-42d5-93ef-f3ab44cece6d	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-100	79280.81495	79180.81495	option	a4b150d7-2c74-4403-b12c-d1e4322d6787	\N	2026-01-02 23:59:29.62775
25f69826-963f-4d50-8251-a7194875d64f	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	79180.81495	79280.81495	option	f1289b24-2c74-42b2-8079-8c5cddc08daf	\N	2026-01-03 00:21:22.187136
7a4a0f7f-0f73-450f-b226-f37a4d5a442c	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	78280.81495	78380.81495	option	74c8cb27-37db-401e-b8ae-30f7c4a762d1	\N	2026-01-03 00:22:12.243002
6cb1db81-7db3-4ea9-9389-3487d673dbad	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	78380.81495	78480.81495	option	0fda6291-fe14-4835-b9e5-d5ae3acd0a14	\N	2026-01-03 00:22:25.237351
7117e1fd-c6fd-4130-8cb2-55de8f2f3404	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	79480.81495	79580.81495	option	f0655029-b62f-41af-8562-e036099cdaa3	\N	2026-01-03 00:22:44.257836
f66435dc-52b5-4f4c-9c82-d1ee29bb5048	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	79580.81495	79680.81495	option	7684f1c4-80d2-4ae1-acd9-e6e263061082	\N	2026-01-03 00:23:30.268898
dcf2399b-f8e8-4f96-bec5-acc993f4ff0d	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	100	79680.81495	79780.81495	option	07f03ba3-5a25-42cf-a5da-eff6f7e93efc	\N	2026-01-03 00:24:30.313716
3d8d46a6-e3d6-4827-8128-00f0c7a21e3c	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-10000	17000	7000	withdraw_request	d00ab3b7-6d1a-43a6-a02d-fa2c09744377	Withdraw request (Amount: 10000, Fee: $5 included)	2026-01-03 00:41:26.540263
e1fdf8ee-41f6-40e3-977e-a295a200cd91	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	-1000	7000	6000	withdraw_request	ed60b7ee-84cf-45f9-9690-87caa253e4a2	Withdraw request (Amount: 1000, Fee: $5 included)	2026-01-03 00:50:19.63012
185e35f7-3509-43c9-a8dd-c1816e445f5e	8a0ea156-beea-4748-8712-e932367886b2	BTC	1	0	1	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2026-08-25 15:34:21.804065
c20568da-a2f4-4492-a962-8af09a34c53b	8a0ea156-beea-4748-8712-e932367886b2	USDT	-10	1000	990	transfer_out	\N	Transfer to trading wallet	2026-08-25 15:36:55.774088
31645e5b-7ec3-413a-a52d-1e98adec935e	8a0ea156-beea-4748-8712-e932367886b2	USDT	10	265073.2897	265083.2897	transfer_in	\N	Transfer from funding wallet	2026-08-25 15:36:55.774088
b073df69-5b69-46da-9e56-f5aa4de079f2	8a0ea156-beea-4748-8712-e932367886b2	USDT	-10	265083.2897	265073.2897	transfer_out	\N	Transfer to funding wallet	2026-08-25 15:36:56.316627
beeed525-7503-4d07-a7cd-58f7f3e9a4c3	8a0ea156-beea-4748-8712-e932367886b2	USDT	10	990	1000	transfer_in	\N	Transfer from trading wallet	2026-08-25 15:36:56.316627
336fa3a2-5f7c-428c-b219-43543bad302b	8a0ea156-beea-4748-8712-e932367886b2	USDT	-10	265073.2897	265063.2897	transfer_out	\N	Transfer to funding wallet	2026-08-25 15:36:57.205933
05aa2dea-0ec6-433d-ae22-97ccf86fd1c6	8a0ea156-beea-4748-8712-e932367886b2	USDT	10	1000	1010	transfer_in	\N	Transfer from trading wallet	2026-08-25 15:36:57.205933
84d3b746-9790-4148-847f-e3c0e084e383	8a0ea156-beea-4748-8712-e932367886b2	USDT	-10	1010	1000	transfer_out	\N	Transfer to trading wallet	2026-08-25 15:36:57.798933
67c4149b-1ffa-437d-8a7c-6b02754dcc3a	8a0ea156-beea-4748-8712-e932367886b2	USDT	10	265063.2897	265073.2897	transfer_in	\N	Transfer from funding wallet	2026-08-25 15:36:57.798933
e3ea9c1c-abaf-4fa8-95e4-6e5604f64b41	8a0ea156-beea-4748-8712-e932367886b2	USDT	-5	1000	995	transfer_out	\N	Transfer to trading wallet	2026-08-25 15:53:43.731956
234cd813-b173-426b-9a68-adf82d805a88	8a0ea156-beea-4748-8712-e932367886b2	USDT	5	265073.2897	265078.2897	transfer_in	\N	Transfer from funding wallet	2026-08-25 15:53:43.731956
c704a8fd-623f-4dfc-9b98-4ce5ca42a75e	8a0ea156-beea-4748-8712-e932367886b2	USDT	-5	265078.2897	265073.2897	transfer_out	\N	Transfer to funding wallet	2026-08-25 15:53:44.369658
9c348d44-c1a6-46e7-8bee-9a74ad885547	8a0ea156-beea-4748-8712-e932367886b2	USDT	5	995	1000	transfer_in	\N	Transfer from trading wallet	2026-08-25 15:53:44.369658
b7462ef7-3201-4970-bc2f-611f196f5e7a	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	70000	0	70000	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2026-08-25 17:38:03.944619
169522f9-ec68-4ce6-a494-3726255f5ce2	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	-70000	70000	0	transfer_out	\N	Transfer to trading wallet	2026-08-25 17:39:29.986322
4b9e1865-2de5-4b7f-8f8c-df415f7b763f	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	70000	0	70000	transfer_in	\N	Transfer from funding wallet	2026-08-25 17:39:29.986322
2fe8b836-a034-408e-83c7-2ae02e4cf0ff	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	100	70000	70100	option	89f5920f-38da-40e5-9b85-040fe5199beb	\N	2026-08-25 17:40:15.61177
a0dfafa0-6831-4ce3-8f05-a24b127eaa6b	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	100	70100	70200	option	ea53114e-149d-4fa9-b603-cb7438b6a1fb	\N	2026-08-25 17:41:33.657534
9878f2f1-e61f-4082-bfa1-4fa90af31f43	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	-100	70200	70100	option	e51c1246-b1bd-4ddb-b24a-310e98da9e10	\N	2026-08-25 17:42:36.649473
3a83e84a-829f-4ad0-a94a-53eb98b42645	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	-1000	70100	69100	option	013ac40b-1061-4d71-a1eb-a10e6b3bc434	\N	2026-08-25 17:53:29.039539
db00ca66-1fe9-4d68-8304-ff7eecbd8f04	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	1000	69100	70100	option	dfe6ed5a-8bd1-4f13-8ed5-4a8e8b0520fa	\N	2026-08-25 17:54:13.048131
1d285732-b459-411e-8fbd-b999a2b82fa1	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	1000	70100	71100	option	ae4e83e2-d68d-4391-b3db-af084aaaa302	\N	2026-08-25 18:01:07.336631
17e6346b-c669-42e8-a075-f8211760e92a	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	-1000	71100	70100	option	19f7e87a-e163-403c-bd23-ff32ac1f1d87	\N	2026-08-25 18:03:24.421639
3a5887d3-23ac-4818-90aa-a66305991846	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	1	0	1	deposit	f97f4b45-7980-4815-af9b-3bb95188d3b0	Deposit approved	2026-08-25 19:11:29.153654
062c4c39-e91e-4af0-b433-fb149795fa5f	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	1	1	0	swap_out	c84c2005-ba21-4906-9582-36d062b3db36	Swap to USDT	2026-08-25 19:11:45.85171
57b3a037-fcb6-41c2-9437-4c1b79ef4efa	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	USDT	78721.216	0	78721.216	swap_in	7799c1f6-1bd6-40c7-a3fb-643fd77e6851	Swap from BTC	2026-08-25 19:11:45.85171
a5950d31-b3da-4f10-bdff-1d212e8474b3	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	USDT	1000	78721.216	79721.216	option	e3e09727-f16e-4989-9d25-43b97e401d1c	\N	2026-08-25 19:12:11.259284
306c10eb-a918-491e-b68c-6f392cbb7997	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	USDT	-1000	79721.216	78721.216	option	b440d3ca-5d84-44f7-b6e6-8ff0a27aec24	\N	2026-08-25 19:12:42.246499
16b080c2-f1f4-4175-9375-da17408b4fa5	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	USDT	-2000	78721.216	76721.216	option	081f4eb2-2b79-4585-8a82-395493e44a30	\N	2026-08-25 19:13:26.2723
80900de2-35bb-4e4a-b7fa-a41c85afa91a	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	-30000	70100	40100	option	188669a6-bce3-411f-9ae8-36609ca5319c	\N	2026-08-25 19:22:15.581962
ffd462bc-e6d7-4598-ada9-2f9309ddc14c	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	3000	40100	43100	option	91a4de9d-e99b-451a-a1d9-c6c09abb924a	\N	2026-08-25 19:24:04.319256
dd088fb4-dad5-4ae5-b701-2e66a4949692	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	100	43100	43200	option	1a9af394-b209-4e87-b3b6-4ec3a1908c1d	\N	2026-08-25 19:24:41.299721
bad1205b-5a57-4560-9c39-daab815480f2	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	10	43200	43210	option	820d09db-627d-4200-a5eb-bbfb6e520e2b	\N	2026-08-25 19:27:37.386365
b46bf482-4b2a-480c-9a75-ad2ec8e8b156	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	1100	43210	44310	option	4019047e-02ee-4ba4-83db-c4ca2420ff68	\N	2026-08-25 19:47:01.039277
11b5b7b5-5570-4ea0-9253-465427386abe	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	27000	0	27000	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2026-09-03 10:16:29.63324
6e510e1e-9df1-419c-99d0-4a4a7f0f82dc	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	-27000	27000	0	transfer_out	\N	Transfer to trading wallet	2026-09-03 10:31:18.285074
cdb6437f-c0d3-4b6e-a25f-5ec71d209349	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	27000	0	27000	transfer_in	\N	Transfer from funding wallet	2026-09-03 10:31:18.285074
3d11590f-32d3-4aed-bb2f-bf6df364a3b8	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	5400	27000	32400	option	44056428-2eae-4b9f-958f-051173c12925	\N	2026-09-03 10:32:05.453121
222e31ac-0933-490a-9429-3305e185dc38	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	-30000	32400	2400	transfer_out	\N	Transfer to funding wallet	2026-09-03 10:35:35.526655
f7682564-97d4-4c72-ba26-dd38aacb568a	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	30000	0	30000	transfer_in	\N	Transfer from trading wallet	2026-09-03 10:35:35.526655
89c94c88-af40-4e3e-86c6-b6b394667b60	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	480	2400	2880	option	69e61447-ad2e-4c03-9fdb-04802a667933	\N	2026-09-03 10:36:30.417294
17a5d347-407a-4852-a9d7-cd316850fb5f	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	-30000	30000	0	transfer_out	\N	Transfer to trading wallet	2026-09-03 10:37:32.097537
4d25aa79-9cc7-4a37-9d6e-8e17d1ece6a7	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	30000	2880	32880	transfer_in	\N	Transfer from funding wallet	2026-09-03 10:37:32.097537
a676c758-d37e-4926-b483-8699cd1f9300	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	-2880	32880	30000	transfer_out	\N	Transfer to funding wallet	2026-09-03 10:37:42.013189
6fe5bd03-856c-4253-a67f-6ab8caa8a99f	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2880	0	2880	transfer_in	\N	Transfer from trading wallet	2026-09-03 10:37:42.013189
f2fcd5d9-0fee-4a9d-b576-b47e64e309d9	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	-2880	2880	0	withdraw_request	c8d46151-6864-4640-bf57-496c47d861b7	Withdraw request (Amount: 2880, Fee: 5 USDT)	2026-09-03 10:39:08.27591
86bf297e-e518-448f-bf63-0e4a903abce6	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	12000	30000	42000	option	e02c4fef-938e-432d-863c-189368f05169	\N	2026-09-03 20:15:54.011167
f8f354da-6b72-483f-b70e-75610931b9a6	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	1600	42000	43600	option	8c7e17fe-ce7a-4980-8c5e-3fd7c9b702af	\N	2026-09-05 06:30:39.751694
0ff1f638-fbec-48ff-8368-0ef57fb0a622	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	26160	43600	69760	option	64ab887b-54f3-445c-b55c-a017d0f68f85	\N	2026-09-05 06:39:58.016182
3fbc0664-c47f-4042-a4d6-ef822fd5eade	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	40	69760	69800	option	bfc2377f-d521-41ad-ab75-2157fb73ef15	\N	2026-09-07 19:09:17.920037
8a897745-e644-470b-b3ea-99397ddcd969	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	50	69800	69850	option	5e0eba2e-d1cb-45c0-9ffb-5d6be15fc12d	\N	2026-09-07 19:13:24.02695
2e471886-368b-4f2c-be81-e26b9e81d464	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	41910	69850	111760	option	57f17ff0-d41d-4414-adba-98bfb196fda8	\N	2026-09-07 19:28:37.533799
d4ed8697-f6d6-438a-baa2-80e464949011	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	1900	111760	113660	option	9fc3ef53-1a6e-496d-be6f-e206b8471c20	\N	2026-09-07 20:06:04.724896
5b271632-800b-4f9b-aedc-2048d152b9f4	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	4000	113660	117660	option	b5da8f8c-2e6d-45d3-9ece-043ec2297e33	\N	2026-09-07 20:07:37.75037
eb9424b0-f973-45f9-8d80-3310106533c3	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	10	117660	117670	option	03574b54-cd4d-40e9-b47f-d4ee700af8db	\N	2026-09-08 14:21:41.760083
064bbf69-2796-406f-8b12-5eaeb8bc2d97	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	800	77670	78470	option	82ed9006-884e-4d3a-a7ea-410797ef5712	\N	2026-09-08 14:22:12.876729
24a3b6eb-4647-4b2f-9521-f11974df3140	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	8000	118470	126470	option	bcacf7ac-ad4e-4ada-a2f6-152545e3adde	\N	2026-09-08 14:22:30.727849
568dfe95-262d-4e01-847b-17bfa902a999	9652878a-5095-4617-af3d-bd327c00b08f	USDT	10	0	10	admin_adjust	\N	Admin balance adjustment (Wallet Created)	2026-09-08 17:08:47.389252
f785ab3c-6a06-488c-befc-f3637fa734f2	9652878a-5095-4617-af3d-bd327c00b08f	USDT	30	10	40	admin_adjust	\N	Admin balance adjustment	2026-09-08 17:17:50.109062
e3e3fa96-5aa0-4bd8-8c67-8d80179262a4	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2000	126470	128470	option	28c6c4bb-5f1b-4148-a4d8-afa38525dc58	\N	2026-09-08 20:56:40.855711
b822185b-b7dc-4cb0-aec1-305dbaed0725	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2000	128470	130470	option	6428e318-8924-4a3a-b7a9-02a124c0eac7	\N	2026-09-08 20:57:22.799066
248f9b73-9e74-4228-a987-a1a19e231602	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	3000	130470	133470	option	c9099b29-fbe3-43ea-806c-698e272fb1f5	\N	2026-09-08 20:59:43.912399
0f0426a3-90ab-4b6e-9835-2c864ceeb2e5	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2000	133470	135470	option	41263d56-1ee9-4e4c-8dab-8eb09c1aa6c5	\N	2026-09-08 21:00:55.941079
e4c92e99-c64c-4f97-9ee2-e1e4909de4b3	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	4000	135470	139470	option	6d8fd757-919d-4243-8ce2-cf79c0dffdca	\N	2026-09-09 18:36:10.200798
1df418c7-5b1c-4f66-8e5c-7e938dcea87b	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	20	139470	139490	option	e6ea6fad-8a6a-429a-965d-93ab91218083	\N	2026-09-10 17:03:08.321445
7488749d-b9ac-4dd1-b456-f2e419c2022f	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	20	139490	139510	option	20cfb4df-935c-4f99-9851-b99dd67380cd	\N	2026-09-10 17:04:26.374817
6a5c512c-ef29-4e2d-9cbc-f8f3bea31baf	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	3000	139510	142510	option	f276925d-c475-40de-829d-428fcbc6ccc3	\N	2026-09-10 19:22:44.148124
aa56a19a-8761-4c60-9d77-aee6f32f9a9b	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2600	142510	145110	option	a0cfbaa1-5032-481c-a9c4-0a6376d6bad4	\N	2026-09-10 20:58:54.883627
31a06935-ad1a-407b-8e25-89e7fe2d356f	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	2400	145110	147510	option	a403685e-5a19-4c6b-9ec5-ab592ae4ddb3	\N	2026-09-10 21:37:55.632662
6b011946-9ab1-4d0a-a1ab-6ba0c5eb8b3a	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	1000	142510	143510	option	0dbc0526-dcac-428c-bdf7-5026571aeb37	\N	2026-09-11 13:11:59.41789
4519b249-9106-4417-b71b-528a410fc997	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	1000	148510	149510	option	4ccd8910-e93f-40f3-b9b3-c7b500f2351b	\N	2026-09-11 13:12:20.474709
73ca72a8-e30e-42a6-b4f9-0576a614b285	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	4000	149510	153510	option	a29d2fa3-8d28-4b05-9412-6260828b3a47	\N	2026-09-11 13:36:52.132324
026abadb-4788-4dad-ab18-a9e7bb140ffe	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	30702	153510	184212	option	49b7d05e-c52c-4fb1-b83e-408b720f9d9c	\N	2026-09-16 03:01:19.953118
3f60ece2-b5ca-4a88-b5a4-f2dabad39577	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	36842.4	184212	221054.4	option	23ad577d-668e-4e9a-9260-0738017affe9	\N	2026-09-16 03:02:57.90782
c6dad340-8a4c-414b-b59f-f9ecf121160f	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	132632.4	221054.4	353686.8	option	db24c0ce-555f-4211-af1c-5a8e147bed0e	\N	2026-09-16 03:07:35.080029
6c422a9a-1318-4563-bae1-254dd7df36f5	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	247580.19999999998	353686.80000000005	601267	option	6b0283a4-3223-43d2-806d-44b11a173e69	\N	2026-09-16 03:25:04.756439
\.


--
-- TOC entry 3720 (class 0 OID 230756)
-- Dependencies: 249
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, coin, balance, frozen_balance, created_at, updated_at, wallet_type) FROM stdin;
8b812db8-be13-4a61-b84c-53f6530dabc2	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	0.000	0.003	\N	2025-12-15 20:43:54.784069	trading
0de48b6f-030d-4fcf-9c95-132de0a31748	a24279d7-6115-418f-9d0a-0cb100370c21	BTC	0	0	2026-01-02 22:40:47.455853	2026-01-02 22:41:46.197006	funding
f71e035e-2ef9-4b68-96a0-05b5f6420916	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	492	0	\N	2025-12-15 19:12:11.131438	trading
372a2f10-1b35-4258-8788-2c93e2f4abd9	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	200457.030191599999977	4332.261808400000003	\N	2025-12-20 00:01:54.019192	trading
70cd4481-50af-49dc-ad95-d86ec4cf9f30	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	90	0	2025-12-20 00:16:34.83736	2025-12-20 00:16:34.83736	funding
017c907f-4e5a-47f9-b8b1-8159a6472f18	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.0078968031293357822	0.000	\N	2025-12-20 00:21:08.576814	trading
f5b4a315-a577-474d-84f1-7909b8c2a41e	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	79780.81495	0	\N	2026-01-03 00:24:30.30893	trading
32790389-dcbd-4881-9a7d-33f66e1fb962	a24279d7-6115-418f-9d0a-0cb100370c21	USDT	6000	0	2026-01-02 22:58:23.523709	2026-01-03 00:51:24.447188	funding
8e9f73fe-5c67-4228-a703-d22a8c68431a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	24	0	\N	2025-12-23 23:44:06.744082	trading
427d2793-6a95-419c-b6de-da595ec3670e	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	16772.95	0	2025-12-22 22:35:24.652592	2025-12-22 22:35:24.652592	funding
9dddd801-582e-4d27-802f-f552f379cf6b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	43858.209875	0	\N	2025-12-28 00:05:18.014941	trading
ca169528-8bc8-4462-bfb7-27d5502b442a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	1.5	0	2025-12-24 00:09:42.842475	2025-12-31 08:14:04.252572	funding
35ee9bce-7272-41d1-87d7-551cc4984a48	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	4000.917142000002	16267.1519640000001	\N	2025-12-31 08:14:32.451366	trading
20c3c31e-a1bc-40e9-85b9-dd6c1ac743e6	8a0ea156-beea-4748-8712-e932367886b2	ETH	2	0	2025-12-31 08:35:21.632424	2025-12-31 08:35:21.632424	funding
6ca589cb-5478-4cd6-875b-aab282356172	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	16396	-14900	2025-12-19 23:51:12.056511	2025-12-21 23:20:43.263729	funding
028e2e43-d9a4-4499-8393-405a6953e7ae	8a0ea156-beea-4748-8712-e932367886b2	BTC	0	0	2025-12-31 08:20:56.376636	2025-12-31 08:36:29.868889	trading
aa693c90-998f-4a7c-ae74-c07ade19cbcf	8a0ea156-beea-4748-8712-e932367886b2	BTC	1	0	2026-08-25 15:34:21.801595	2026-08-25 15:34:21.801595	funding
2a3a4626-8087-409b-bc8b-bff5e8a6f56a	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	0	0	2026-09-03 10:16:29.631776	2026-09-03 20:06:24.044923	funding
6b79bf44-24c6-44f2-8786-c31ccaeff90c	8a0ea156-beea-4748-8712-e932367886b2	USDT	265073.2897	0	\N	2026-08-25 15:53:44.369658	trading
2525a1b2-539a-4ccf-9278-06ea8ddea6c1	8a0ea156-beea-4748-8712-e932367886b2	USDT	1000	0	2026-01-01 08:17:05.096576	2026-08-25 15:53:44.369658	funding
f9308ef8-ac61-45c6-bcd4-b8fafab1dab5	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	0	0	2026-08-25 17:38:03.943522	2026-08-25 17:39:29.986322	funding
c5ee7a62-ad36-4233-a5dd-ea6f40bb60b1	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	BTC	0	0	2026-08-25 19:11:29.152547	2026-08-25 19:11:45.85171	funding
e83e813c-1095-40b5-923a-8d016a98f68a	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	601267.0	0	2026-09-03 10:31:18.285074	2026-09-16 03:25:04.754692	trading
da4f3e97-2701-4cd7-b58f-476ddca9ee19	0d9fd4bd-28a4-4a67-a87b-80af24ceaec0	USDT	76721.216	0	\N	2026-08-25 19:13:26.270836	trading
5423f1d0-6760-4bc6-984d-a08fa81335fc	9652878a-5095-4617-af3d-bd327c00b08f	USDT	40	0	2026-09-08 17:08:47.386085	2026-09-08 17:17:50.107985	funding
5049a476-e38d-43bb-b8c2-63e928ead4fd	592542db-23d1-4d6a-91a8-e183b9bd570d	USDT	44310	0	2026-08-25 17:39:29.986322	2026-08-25 19:47:01.03777	trading
\.


--
-- TOC entry 3721 (class 0 OID 230769)
-- Dependencies: 250
-- Data for Name: withdraw_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraw_requests (id, user_id, amount, address, tx_hash, status, created_at, approved_at) FROM stdin;
\.


--
-- TOC entry 3722 (class 0 OID 230777)
-- Dependencies: 251
-- Data for Name: withdraws; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraws (id, user_id, coin, network, amount, address, txid, status, created_at) FROM stdin;
c8d46151-6864-4640-bf57-496c47d861b7	fb88afb5-29c2-45f5-8731-6daa4887808e	USDT	TRC20	2880	TETjaW2ghourJ5bvXfzCEgL5wXKuHQ2gPR	\N	approved	2026-09-03 10:39:08.275083
\.


--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 234
-- Name: settings_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_history_id_seq', 14, true);


--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 236
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 30, true);


--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 242
-- Name: uploaded_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.uploaded_images_id_seq', 31, true);


--
-- TOC entry 3477 (class 2606 OID 230792)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3481 (class 2606 OID 230794)
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3485 (class 2606 OID 230796)
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3491 (class 2606 OID 230798)
-- Name: kyc_submissions kyc_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3493 (class 2606 OID 230800)
-- Name: kyc_submissions kyc_submissions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_user_id_key UNIQUE (user_id);


--
-- TOC entry 3495 (class 2606 OID 230802)
-- Name: option_settings option_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_settings
    ADD CONSTRAINT option_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 230804)
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 230806)
-- Name: referrals referrals_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);


--
-- TOC entry 3508 (class 2606 OID 230808)
-- Name: settings_history settings_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_history
    ADD CONSTRAINT settings_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3512 (class 2606 OID 230810)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3514 (class 2606 OID 230812)
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 3517 (class 2606 OID 230814)
-- Name: swaps swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swaps
    ADD CONSTRAINT swaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3521 (class 2606 OID 230816)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3524 (class 2606 OID 230818)
-- Name: uploaded_images uploaded_images_image_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_image_key_key UNIQUE (image_key);


--
-- TOC entry 3526 (class 2606 OID 230820)
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3528 (class 2606 OID 230822)
-- Name: user_registration_info user_registration_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_registration_info
    ADD CONSTRAINT user_registration_info_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3530 (class 2606 OID 230824)
-- Name: user_win_rates user_win_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_win_rates
    ADD CONSTRAINT user_win_rates_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3533 (class 2606 OID 230826)
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- TOC entry 3535 (class 2606 OID 230828)
-- Name: users users_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uid_key UNIQUE (uid);


--
-- TOC entry 3537 (class 2606 OID 230830)
-- Name: wallet_addresses wallet_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3539 (class 2606 OID 230832)
-- Name: wallet_addresses wallet_addresses_user_id_network_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_user_id_network_key UNIQUE (user_id, network);


--
-- TOC entry 3542 (class 2606 OID 230834)
-- Name: wallets wallets_user_coin_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_coin_type_unique UNIQUE (user_id, coin, wallet_type);


--
-- TOC entry 3478 (class 1259 OID 230835)
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- TOC entry 3479 (class 1259 OID 230836)
-- Name: idx_chat_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_session_id ON public.chat_messages USING btree (session_id);


--
-- TOC entry 3482 (class 1259 OID 230837)
-- Name: idx_chat_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_status ON public.chat_sessions USING btree (status);


--
-- TOC entry 3483 (class 1259 OID 230838)
-- Name: idx_chat_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions USING btree (user_id);


--
-- TOC entry 3486 (class 1259 OID 230839)
-- Name: idx_email_verifications_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_email ON public.email_verifications USING btree (email);


--
-- TOC entry 3487 (class 1259 OID 230840)
-- Name: idx_email_verifications_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_expires ON public.email_verifications USING btree (expires_at);


--
-- TOC entry 3488 (class 1259 OID 230841)
-- Name: idx_kyc_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_status ON public.kyc_submissions USING btree (status);


--
-- TOC entry 3489 (class 1259 OID 230842)
-- Name: idx_kyc_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_user_id ON public.kyc_submissions USING btree (user_id);


--
-- TOC entry 3496 (class 1259 OID 230843)
-- Name: idx_options_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_expires ON public.options USING btree (expires_at);


--
-- TOC entry 3497 (class 1259 OID 230844)
-- Name: idx_options_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_user_status ON public.options USING btree (user_id, status);


--
-- TOC entry 3498 (class 1259 OID 230845)
-- Name: idx_price_cache_symbol; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_price_cache_symbol ON public.price_cache USING btree (symbol);


--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 3498
-- Name: INDEX idx_price_cache_symbol; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_price_cache_symbol IS 'Optimizes price_cache queries by symbol for VPS performance';


--
-- TOC entry 3499 (class 1259 OID 230846)
-- Name: idx_referrals_referred; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referred ON public.referrals USING btree (referred_id);


--
-- TOC entry 3500 (class 1259 OID 230847)
-- Name: idx_referrals_referrer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);


--
-- TOC entry 3505 (class 1259 OID 230848)
-- Name: idx_settings_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_history_date ON public.settings_history USING btree (changed_at DESC);


--
-- TOC entry 3506 (class 1259 OID 230849)
-- Name: idx_settings_history_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_history_key ON public.settings_history USING btree (setting_key);


--
-- TOC entry 3509 (class 1259 OID 230850)
-- Name: idx_site_settings_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_settings_category ON public.site_settings USING btree (category);


--
-- TOC entry 3510 (class 1259 OID 230851)
-- Name: idx_site_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_settings_key ON public.site_settings USING btree (setting_key);


--
-- TOC entry 3515 (class 1259 OID 230852)
-- Name: idx_spot_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spot_orders_user ON public.spot_orders USING btree (user_id, status);


--
-- TOC entry 3518 (class 1259 OID 230853)
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- TOC entry 3519 (class 1259 OID 230854)
-- Name: idx_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_user_id ON public.tickets USING btree (user_id);


--
-- TOC entry 3522 (class 1259 OID 230855)
-- Name: idx_uploaded_images_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_uploaded_images_key ON public.uploaded_images USING btree (image_key);


--
-- TOC entry 3531 (class 1259 OID 230856)
-- Name: idx_users_referral_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_referral_code ON public.users USING btree (referral_code);


--
-- TOC entry 3540 (class 1259 OID 230857)
-- Name: idx_wallets_user_coin_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wallets_user_coin_type ON public.wallets USING btree (user_id, coin, wallet_type);


--
-- TOC entry 3543 (class 2606 OID 230858)
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


-- Completed on 2026-09-16 10:45:07 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict hnhgWEFjBw2RYKYaccQTdjyywnElLqJtMMkge7zzS4fA6Zz1EIvr7yZUr8stOtI

