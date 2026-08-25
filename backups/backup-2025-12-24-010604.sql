--
-- PostgreSQL database dump
--

\restrict Snvgb3TntgPcOoifvhUvVYcQbkIr6hEIad3Qg0kPiXeyIMIqKkw9egGp0ID3awU

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

-- Started on 2025-12-24 01:06:04 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- TOC entry 2 (class 3079 OID 16472)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 16386)
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
-- TOC entry 236 (class 1259 OID 16724)
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
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE chat_messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chat_messages IS 'Stores individual messages in chat sessions';


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN chat_messages.sender_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_messages.sender_type IS 'Type of sender: user or admin';


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 236
-- Name: COLUMN chat_messages.is_read; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_messages.is_read IS 'Whether the message has been read by the recipient';


--
-- TOC entry 235 (class 1259 OID 16712)
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
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE chat_sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.chat_sessions IS 'Stores chat sessions between users and admin';


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN chat_sessions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.chat_sessions.status IS 'Session status: open or closed';


--
-- TOC entry 211 (class 1259 OID 16391)
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
-- TOC entry 212 (class 1259 OID 16396)
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
-- TOC entry 228 (class 1259 OID 16594)
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
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE email_verifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.email_verifications IS 'Stores OTP codes for email verification during registration';


--
-- TOC entry 237 (class 1259 OID 16744)
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
    CONSTRAINT kyc_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE kyc_submissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.kyc_submissions IS 'Stores KYC verification submissions with ID card photos (front and back)';


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN kyc_submissions.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.name IS 'Full name as shown on ID card';


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN kyc_submissions.id_card_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_number IS 'ID card number';


--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN kyc_submissions.id_card_front_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_front_filename IS 'Filename for front photo of ID card';


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN kyc_submissions.id_card_back_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.id_card_back_filename IS 'Filename for back photo of ID card';


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN kyc_submissions.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.kyc_submissions.status IS 'pending, approved, or rejected';


--
-- TOC entry 213 (class 1259 OID 16401)
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
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 213
-- Name: COLUMN option_durations.min_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.option_durations.min_amount IS 'Minimum order amount for this duration in USDT';


--
-- TOC entry 214 (class 1259 OID 16411)
-- Name: option_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_pairs (
    id uuid NOT NULL,
    symbol text NOT NULL,
    is_active boolean NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16538)
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
-- TOC entry 215 (class 1259 OID 16421)
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
-- TOC entry 216 (class 1259 OID 16426)
-- Name: price_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_cache (
    symbol text NOT NULL,
    price numeric NOT NULL,
    updated_at timestamp with time zone
);


--
-- TOC entry 238 (class 1259 OID 16786)
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 234 (class 1259 OID 16677)
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
-- TOC entry 233 (class 1259 OID 16676)
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
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 233
-- Name: settings_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_history_id_seq OWNED BY public.settings_history.id;


--
-- TOC entry 230 (class 1259 OID 16649)
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
-- TOC entry 229 (class 1259 OID 16648)
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
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 229
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- TOC entry 217 (class 1259 OID 16431)
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
-- TOC entry 226 (class 1259 OID 16551)
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
-- TOC entry 239 (class 1259 OID 16808)
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
-- TOC entry 218 (class 1259 OID 16436)
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
-- TOC entry 232 (class 1259 OID 16664)
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
-- TOC entry 231 (class 1259 OID 16663)
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
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 231
-- Name: uploaded_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uploaded_images_id_seq OWNED BY public.uploaded_images.id;


--
-- TOC entry 219 (class 1259 OID 16441)
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
    uid bigint
);


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN users.referral_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.referral_code IS 'Unique referral code for inviting new users';


--
-- TOC entry 220 (class 1259 OID 16446)
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
-- TOC entry 227 (class 1259 OID 16585)
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
-- TOC entry 221 (class 1259 OID 16451)
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
-- TOC entry 222 (class 1259 OID 16456)
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
    CONSTRAINT wallets_type_check CHECK (((wallet_type)::text = ANY ((ARRAY['funding'::character varying, 'trading'::character varying])::text[])))
);


--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN wallets.wallet_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wallets.wallet_type IS 'Type of wallet: funding (for deposits/withdrawals) or trading (for trading activities)';


--
-- TOC entry 223 (class 1259 OID 16461)
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
-- TOC entry 224 (class 1259 OID 16466)
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
-- TOC entry 3725 (class 2604 OID 16680)
-- Name: settings_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_history ALTER COLUMN id SET DEFAULT nextval('public.settings_history_id_seq'::regclass);


--
-- TOC entry 3720 (class 2604 OID 16652)
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- TOC entry 3723 (class 2604 OID 16667)
-- Name: uploaded_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images ALTER COLUMN id SET DEFAULT nextval('public.uploaded_images_id_seq'::regclass);


--
-- TOC entry 3949 (class 0 OID 16386)
-- Dependencies: 210
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_logs (id, admin_id, action, details, created_at) FROM stdin;
\.


--
-- TOC entry 3975 (class 0 OID 16724)
-- Dependencies: 236
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, session_id, sender_id, sender_type, message, is_read, created_at) FROM stdin;
14a3a7d5-a136-4442-ace7-64fe349a89cf	11eb54ee-5786-4545-a51e-bbfc01814d07	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	tes	t	2025-12-18 22:46:21.506174+07
2b8c6698-c3f8-4bb9-ad5d-68d42d9328de	11eb54ee-5786-4545-a51e-bbfc01814d07	8a0ea156-beea-4748-8712-e932367886b2	admin	ya kak	t	2025-12-18 22:47:28.379718+07
53d2f2c3-be76-4adc-bd9e-ab0603bd79c1	11eb54ee-5786-4545-a51e-bbfc01814d07	8a0ea156-beea-4748-8712-e932367886b2	admin	tessss	f	2025-12-18 22:48:48.837629+07
3bdba09a-573c-4a6d-b650-2e8dbec20404	d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	tesssss	t	2025-12-18 22:49:11.995388+07
3477c153-0f81-4935-8dac-bff1be97185b	d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	8a0ea156-beea-4748-8712-e932367886b2	admin	hol	t	2025-12-18 22:49:31.213682+07
13189f6d-50e1-4ea5-b550-6380e1408d6f	d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	lgi ap	t	2025-12-18 22:49:40.19442+07
a14325aa-c684-4062-91c7-2f827ec6d83b	d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	8a0ea156-beea-4748-8712-e932367886b2	admin	uuhuhu	t	2025-12-18 22:49:45.859709+07
d37dc9f3-f23c-4ec5-940d-f52888a8096c	d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	tes	t	2025-12-18 22:54:36.467649+07
\.


--
-- TOC entry 3974 (class 0 OID 16712)
-- Dependencies: 235
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, user_id, status, last_message_at, created_at) FROM stdin;
28fdce34-8ca4-409d-81e0-51275a6ed2b8	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	open	2025-12-18 22:45:59.835793+07	2025-12-18 22:45:59.835793+07
11eb54ee-5786-4545-a51e-bbfc01814d07	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	open	2025-12-18 22:48:48.839849+07	2025-12-18 22:45:59.835026+07
d802e04c-18b1-4a32-a060-2b16111288a9	0a230878-9a65-48c1-bbe7-3b965b62af0e	open	2025-12-21 23:00:06.820956+07	2025-12-21 23:00:06.820956+07
d05a0a35-fcd9-4b6f-800e-8fae3881f2ed	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	open	2025-12-18 22:54:36.470336+07	2025-12-18 22:45:59.836431+07
\.


--
-- TOC entry 3950 (class 0 OID 16391)
-- Dependencies: 211
-- Data for Name: deposit_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposit_methods (id, coin, network, address, qr_code_url, is_active, created_at, updated_at) FROM stdin;
56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	TRayMkSEQgydxhowxpooCLJoWHXXckPtgw	/uploads/1766508869944_w1v9cs.jpeg	t	\N	2025-12-23 23:54:29.963439
9858cc3e-6056-4a38-b549-f2cd461c2532	USDT	ERC20	0x326e5d06250cbd2911dee32389aa5eb1affb05f8	/uploads/1766508992829_37g7d.jpg	t	\N	2025-12-23 23:56:32.835189
63e610d1-9262-4cf3-b299-7f976076e5b6	BTC	BITCOIN	bc1paaeua5wuvhlaf7wd5qn8v5yxnketcyvsfspql5t070g7zjemwhyqffxars	/uploads/1766509063290_wlz0s7.jpeg	t	\N	2025-12-23 23:57:43.293302
62fe76c2-48ef-4685-a8c1-8227b058fcce	ETH	ETH	0x326e5d06250cbd2911dee32389aa5eb1affb05f8	/uploads/1766509177158_9rpr6g.jpeg	t	\N	2025-12-23 23:59:37.163929
\.


--
-- TOC entry 3951 (class 0 OID 16396)
-- Dependencies: 212
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposits (id, user_id, deposit_method_id, coin, network, amount, txid, proof_url, status, created_at) FROM stdin;
5fae2f20-f666-43ee-a28b-00c140a885d8	023c6ce8-0cef-4d9d-bcbe-45662046a493	62fe76c2-48ef-4685-a8c1-8227b058fcce	eth	eth	123	88u8u88u8u8u8u	/uploads/proofs/023c6ce8-0cef-4d9d-bcbe-45662046a493_1765800346939.png	approved	\N
05c6cb2d-17e3-44b3-af27-5cbcc5f2448c	023c6ce8-0cef-4d9d-bcbe-45662046a493	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	usdt	trc20	200000	ydydydhydhdhd	/uploads/proofs/023c6ce8-0cef-4d9d-bcbe-45662046a493_1765801059905.png	approved	\N
76241e4e-04a0-4cff-8b0f-fafeceae531f	023c6ce8-0cef-4d9d-bcbe-45662046a493	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	10000	8au8a8auu8a	\N	approved	\N
68d5de26-54cb-4169-8b0f-286367614871	0a230878-9a65-48c1-bbe7-3b965b62af0e	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	10000	oxoxoxxoxoxooxxo	/uploads/proofs/0a230878-9a65-48c1-bbe7-3b965b62af0e_1765806384677.png	approved	\N
4bca19cb-02b0-4ae2-831a-78e408ad1c46	0a230878-9a65-48c1-bbe7-3b965b62af0e	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	1000	9iii9i9i9ii9i9i9i99	\N	approved	\N
16f2733f-8665-4f68-8262-72a856fb92bd	0a230878-9a65-48c1-bbe7-3b965b62af0e	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	10000	1w1w1w11w1	\N	approved	\N
ab0e55c0-8cbb-4a3b-be4e-2dc3406d903d	0a230878-9a65-48c1-bbe7-3b965b62af0e	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	10000	21212121j1j2j1j2	\N	pending	\N
b1026d97-e4d5-44b2-ae2c-730eb4bfc45b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	62fe76c2-48ef-4685-a8c1-8227b058fcce	ETH	ETH	30	ggvgvgvgvgvgvvgvgv	\N	approved	\N
d1591e75-aac5-4202-889d-38113e4d47d2	0a230878-9a65-48c1-bbe7-3b965b62af0e	56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	10000	ryuyuyrr7yr7ry7ryr7yr7ry	\N	approved	\N
afcb0f51-6c1a-49c7-a94d-3ca2afda84ad	0a230878-9a65-48c1-bbe7-3b965b62af0e	62fe76c2-48ef-4685-a8c1-8227b058fcce	ETH	ETH	90	vcvcvcvcvcvcvc	\N	approved	\N
01adbaea-3ebd-4c55-8c80-1d083291ab65	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	63e610d1-9262-4cf3-b299-7f976076e5b6	BTC	BITCOIN	1	YGGYGYGYYGGYYGGYGY	/uploads/proofs/359ec1a3-6517-43f8-a3e4-c72cf8c6260c_1766509234587.png	approved	\N
\.


--
-- TOC entry 3967 (class 0 OID 16594)
-- Dependencies: 228
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verifications (id, email, otp_code, password_hash, created_at, expires_at, verified, attempts) FROM stdin;
fc46d2fc-bdec-4563-9ef5-9b5520dbac9d	bangaan2509@gmail.com	313039	$2b$10$5sRweoEkpUOL7rYEaiVEQuWHLjEii1Mp7LL01YYEd.ppMNrmZ4HE2	2025-12-16 22:20:54.947953+07	2025-12-16 22:25:54.947+07	t	0
\.


--
-- TOC entry 3976 (class 0 OID 16744)
-- Dependencies: 237
-- Data for Name: kyc_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kyc_submissions (id, user_id, name, id_card_number, id_card_front_filename, id_card_back_filename, status, admin_note, submitted_at, reviewed_at, reviewed_by) FROM stdin;
bc1a50e5-6412-4f67-9f08-e945367ab063	0a230878-9a65-48c1-bbe7-3b965b62af0e	uhuhuuhu	1234656566666	d8b000bf-5f75-45b0-85ce-4792f2ea6413.png	1cace7e1-0b22-4af1-b3c7-155254597724.png	approved	\N	2025-12-19 22:59:02.311895+07	2025-12-19 22:59:45.152633+07	8a0ea156-beea-4748-8712-e932367886b2
\.


--
-- TOC entry 3952 (class 0 OID 16401)
-- Dependencies: 213
-- Data for Name: option_durations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_durations (id, seconds, is_active, payout_percent, min_amount) FROM stdin;
33302a99-977c-4c14-abca-8dac8773abec	30	t	10	100
e8c2fd9e-f8d3-4dfb-a6a3-c9227f7bff4d	60	t	15	1000
2551e64e-7ac8-4ac0-aa94-4bb7c8e2ef84	90	t	20	5000
e54dc34f-191e-452b-a464-c0c20eff07d3	120	t	30	10000
66cc2d85-b9e7-4144-ab08-376c8017d132	180	t	40	300000
02e7ed50-e4ea-4a9f-a3e6-f7ed4e7c63fe	240	t	50	100000
60363d79-0fa7-4319-8715-d6d4c6199b71	300	t	60	200000
a2ce44b0-9ee9-4713-a798-9833c1cbce97	600	t	70	500000
\.


--
-- TOC entry 3953 (class 0 OID 16411)
-- Dependencies: 214
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
-- TOC entry 3964 (class 0 OID 16538)
-- Dependencies: 225
-- Data for Name: option_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_settings (id, min_amount, max_amount, is_enabled, profit_percent, payout_percent) FROM stdin;
d7b118c5-900d-43e3-8e33-c4ee6fcc156b	10	1000	t	80	80
\.


--
-- TOC entry 3954 (class 0 OID 16421)
-- Dependencies: 215
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.options (id, user_id, symbol, direction, amount, entry_price, exit_price, profit, status, duration, expires_at, created_at, payout_percent, closed_at) FROM stdin;
e54ac18f-1f6c-4ecd-97fd-32697f2e812a	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	200	89748.61	89748.61	0	lose	30	2025-12-15 19:45:14.473+07	2025-12-15 19:44:44.473782+07	80	2025-12-15 19:45:15.405365+07
ae4ee906-7dab-4385-a9df-e86b76192b11	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3617	0.3609	100	win	30	2025-12-21 22:57:06.313+07	2025-12-21 22:56:36.314042+07	10	2025-12-21 22:57:13.131959+07
1c1692d9-30f8-4043-9e65-f215003213be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	500	89748.61	89748.61	0	lose	30	2025-12-15 19:46:10.315+07	2025-12-15 19:45:40.315713+07	80	2025-12-15 19:46:10.43467+07
39fd11c0-acf4-403f-acc2-efa97308c57f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3609	0.3607	100	win	30	2025-12-21 23:12:19.3+07	2025-12-21 23:11:49.301504+07	10	2025-12-21 23:12:23.237247+07
d7e9a3aa-b185-46b2-a1cf-1b499d52e4c7	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89748.61	89748.61	0	lose	30	2025-12-15 19:48:53.483+07	2025-12-15 19:48:23.484602+07	80	2025-12-15 19:48:53.709654+07
824b9b46-bdc1-48ef-9f84-59551e06e9be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89665.08	89665.08	0	lose	30	2025-12-15 19:52:05.147+07	2025-12-15 19:51:35.148599+07	80	2025-12-15 19:52:07.195692+07
3c58d870-939d-48ac-9d2e-e0644cc0c436	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3607	0.361	100	win	30	2025-12-21 23:18:06.135+07	2025-12-21 23:17:36.136276+07	10	2025-12-21 23:18:13.290473+07
9b913e4f-3a5a-409b-a907-78a902d71b68	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	1000	3154.36	3155.25	0	lose	30	2025-12-15 19:53:01.525+07	2025-12-15 19:52:31.525679+07	80	2025-12-15 19:53:02.121734+07
c79a13e0-accd-4919-901d-f3505252e5ca	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88215.28	88099.99	0	lose	30	2025-12-21 23:19:02.287+07	2025-12-21 23:18:32.289673+07	10	2025-12-21 23:19:03.284067+07
bc937469-75f6-4be0-a8a6-6fb27dab1bb0	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	500	3155.5	3155.28	400	win	30	2025-12-15 19:53:41.421+07	2025-12-15 19:53:11.42179+07	80	2025-12-15 19:53:42.156812+07
54f8c001-8e0c-4e89-a79c-394bd224c47c	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	200	89534.66	89516.1	0	lose	30	2025-12-15 20:47:36.041+07	2025-12-15 20:47:06.045285+07	80	2025-12-15 20:47:36.488597+07
a602418e-537b-45ca-9fcb-12699f713434	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88099.99	88107.81	100	win	30	2025-12-21 23:19:45.61+07	2025-12-21 23:19:15.611135+07	10	2025-12-21 23:19:53.258079+07
154e0315-03b7-48bf-a1e0-03f9e4210544	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	200	89511.75	89562.46	0	lose	30	2025-12-15 20:48:24.805+07	2025-12-15 20:47:54.805744+07	80	2025-12-15 20:48:25.488131+07
eb664a26-ad52-46f2-a9cb-7d923bb386ec	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	86438.15	86430.01	0	lose	30	2025-12-16 06:45:54.823+07	2025-12-16 06:45:24.826305+07	80	2025-12-16 06:45:55.420135+07
f8012a2a-2c9f-43a2-8531-f6f9f8582cc3	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88107.81	88187.1	100	win	30	2025-12-21 23:20:36.572+07	2025-12-21 23:20:06.572926+07	10	2025-12-21 23:20:43.261438+07
1296e162-38f0-4e48-aa4c-0a6701448eb1	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	500	86448.9	86463.61	0	lose	30	2025-12-16 17:14:17.665+07	2025-12-16 17:13:47.668058+07	80	2025-12-16 17:14:20.622454+07
ecc2d20c-7079-4c72-82da-d167e9baabb5	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88107.81	88199.85	100	win	30	2025-12-21 23:20:51.083+07	2025-12-21 23:20:21.083694+07	10	2025-12-21 23:20:53.26345+07
5db9a8f4-fb30-4cc1-a888-3d956c686226	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86489	86488.99	800	win	30	2025-12-16 17:19:29.99+07	2025-12-16 17:18:59.990938+07	80	2025-12-16 17:19:30.611041+07
e410f04d-59de-4b91-ad7d-4851b2ce246a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88199.85	88228.58	100	win	30	2025-12-21 23:22:56.09+07	2025-12-21 23:22:26.091407+07	10	2025-12-21 23:23:03.319284+07
6250f3d1-42cd-479b-afcd-35470a148bbd	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	500	86446	86403.42	0	lose	30	2025-12-16 17:20:12.029+07	2025-12-16 17:19:42.029592+07	80	2025-12-16 17:20:20.606627+07
c9e07f2c-91bd-40ee-81c6-d1d7913ae14d	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86438	86431.05	800	win	30	2025-12-16 17:22:20.544+07	2025-12-16 17:21:50.544857+07	80	2025-12-16 17:22:21.148874+07
4e7b9382-c9ba-4a6b-a83a-78757c39d5d7	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88228.58	88297	100	win	30	2025-12-21 23:23:54.288+07	2025-12-21 23:23:24.28963+07	10	2025-12-21 23:24:03.31871+07
959419b8-0810-45f3-9a9f-dd6c5518754a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	87174.55	87138	800	win	30	2025-12-16 20:10:09.61+07	2025-12-16 20:09:39.613347+07	80	2025-12-16 20:10:10.349106+07
e4ec3b98-baff-489e-9d12-3f80c4f14a5a	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.361	0.363	0	lose	30	2025-12-21 23:24:55.693+07	2025-12-21 23:24:25.696926+07	10	2025-12-21 23:25:03.324857+07
9c6f54d5-3746-49a3-95ed-b4bf202c3a6e	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	87060	87087.88	800	win	30	2025-12-17 19:36:07.982+07	2025-12-17 19:35:37.992065+07	80	2025-12-17 19:36:16.370592+07
a427722b-fbf9-4aac-beba-7e5aaf35a06b	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	88197.24	88197.24	0	lose	30	2025-12-20 22:18:45.191+07	2025-12-20 22:18:15.192972+07	80	2025-12-20 22:18:46.196213+07
23f6bf6d-0955-4068-9ef1-c9c89694dcd7	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.363	0.3634	0	lose	30	2025-12-21 23:25:50.869+07	2025-12-21 23:25:20.870876+07	10	2025-12-21 23:25:53.329802+07
732b7e27-3234-4219-8e70-ec217023a918	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3634	0.3635	0	lose	30	2025-12-21 23:26:30.074+07	2025-12-21 23:26:00.074946+07	10	2025-12-21 23:26:33.322952+07
d7a3b70a-012e-4278-acfd-a329c36fee4f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	200	0.3766	0.377	0	lose	90	2025-12-20 22:32:15.871+07	2025-12-20 22:30:45.871522+07	80	2025-12-20 22:32:16.261966+07
80f388af-201a-430a-aac1-2661c6a59ca0	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3766	0.3774	800	win	600	2025-12-20 22:35:25.937+07	2025-12-20 22:25:25.93777+07	80	2025-12-20 22:35:33.216779+07
fc2e945d-6fa2-4492-bf17-fe7774471174	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3766	0.3772	0	lose	600	2025-12-20 22:40:06.817+07	2025-12-20 22:30:06.817942+07	80	2025-12-20 22:40:13.230548+07
45419aef-0710-49d9-aa4d-5d0bc810e07c	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3635	0.3638	-100	lose	30	2025-12-21 23:32:12.918+07	2025-12-21 23:31:42.919497+07	10	2025-12-21 23:32:14.48113+07
ab6cbf65-d88b-49f4-b573-27d393e816d8	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3772	0.377	0	lose	30	2025-12-20 23:24:13.952+07	2025-12-20 23:23:43.959168+07	10	2025-12-20 23:24:23.599334+07
92cacaad-ed90-41ac-9aba-c5ef5ac96fb3	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3638	0.3633	-100	lose	30	2025-12-21 23:32:59.211+07	2025-12-21 23:32:29.212052+07	10	2025-12-21 23:33:04.431533+07
d5e02c9a-b1af-4c64-89b0-aaf3ffe016fe	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.377	0.3771	0	lose	30	2025-12-20 23:27:18.321+07	2025-12-20 23:26:48.323251+07	10	2025-12-20 23:27:23.441633+07
423cc4fc-a6c9-4ee5-9417-3a9a2b8c48c4	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	500	88134.82	88162.45	0	lose	30	2025-12-20 23:35:00.8+07	2025-12-20 23:34:30.801817+07	10	2025-12-20 23:35:03.459715+07
fb00767a-2142-42c0-b321-a7def2e1e094	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	89487.03	89239.99	10	win	30	2025-12-22 22:36:30.118+07	2025-12-22 22:36:00.131343+07	10	2025-12-22 22:36:39.513909+07
4c8ad56b-ddcd-4d1c-b95d-309439e370bf	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3771	0.3761	100	win	30	2025-12-20 23:40:39.428+07	2025-12-20 23:40:09.429142+07	10	2025-12-20 23:40:43.507709+07
f8f77ae0-afb7-4674-8218-97c1db2ac0da	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.3633	0.3752	20	win	30	2025-12-22 22:39:16.829+07	2025-12-22 22:38:46.830109+07	10	2025-12-22 22:39:19.507845+07
790bf71a-4e2c-4803-a0bc-b94c3e4c5545	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3761	0.3757	0	lose	30	2025-12-20 23:43:07.244+07	2025-12-20 23:42:37.247385+07	10	2025-12-20 23:43:13.558616+07
7136192f-fef2-4451-8696-7e7683b3c4e3	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	200	0.3757	0.3596	0	lose	30	2025-12-21 22:40:33.399+07	2025-12-21 22:40:03.403279+07	10	2025-12-21 22:40:43.152287+07
12798157-4fd6-441d-8377-1c8ccf892d09	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	500	0.3752	0.377	-50	lose	30	2025-12-22 22:48:27.169+07	2025-12-22 22:47:57.171295+07	10	2025-12-22 22:48:29.793363+07
5a9f0fce-0dab-4ecf-97b3-ce86e7054f50	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	down	1000	0.3596	0.3596	0	lose	30	2025-12-21 22:46:12.076+07	2025-12-21 22:45:42.07843+07	10	2025-12-21 22:46:13.020683+07
4aca53da-4a42-4dc0-9bbe-b3e32ad1d14b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.377	0.3777	20	win	30	2025-12-22 22:52:09.41+07	2025-12-22 22:51:39.411338+07	10	2025-12-22 22:52:09.834922+07
2b0a6168-92dd-45d4-a174-2b8c586bbb6e	0a230878-9a65-48c1-bbe7-3b965b62af0e	ADA	up	1000	0.3596	0.3617	100	win	30	2025-12-21 22:55:06.467+07	2025-12-21 22:54:36.469264+07	10	2025-12-21 22:55:13.786277+07
3f9b582d-b9ad-4171-ab81-961296987ce9	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	500	0.3777	0.3802	-500	lose	30	2025-12-22 22:57:37.336+07	2025-12-22 22:57:07.340545+07	10	2025-12-22 22:57:41.952322+07
08472fad-d140-44dd-a7eb-948b1b1ff0ee	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	100	0.3802	0.3788	10	win	30	2025-12-22 23:05:33.553+07	2025-12-22 23:05:03.556965+07	10	2025-12-22 23:05:42.195065+07
f6aa6366-7cff-49f8-931c-02129c41b0a5	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	100	0.3788	0.3795	-100	lose	30	2025-12-22 23:06:34.813+07	2025-12-22 23:06:04.814077+07	10	2025-12-22 23:06:42.167389+07
b9fa9d55-097e-4101-94b8-a35361304a6a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	200	0.3795	0.3793	20	win	30	2025-12-22 23:09:47.28+07	2025-12-22 23:09:17.281973+07	10	2025-12-22 23:09:48.729358+07
3a01c894-9543-487c-9fa0-a5a86c4eed54	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	up	200	0.3793	0.3797	20	win	30	2025-12-22 23:10:32.368+07	2025-12-22 23:10:02.369395+07	10	2025-12-22 23:10:33.479414+07
38d5f5df-a4b8-45d7-8401-f2d22565870b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ADA	down	200	0.3797	0.3806	-200	lose	30	2025-12-22 23:11:50.288+07	2025-12-22 23:11:20.289209+07	10	2025-12-22 23:11:50.514227+07
13d5b729-4d3a-4ac3-b41e-29c62a119096	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	87766.81	87802.01	-10	lose	30	2025-12-23 23:40:42.522+07	2025-12-23 23:40:12.555523+07	10	2025-12-23 23:40:42.933698+07
9ea3e9bd-3290-4c79-bad0-997ba03144f4	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	down	100	87799.45	87801.47	-10	lose	30	2025-12-23 23:41:48.553+07	2025-12-23 23:41:18.554347+07	10	2025-12-23 23:41:48.776465+07
\.


--
-- TOC entry 3955 (class 0 OID 16426)
-- Dependencies: 216
-- Data for Name: price_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_cache (symbol, price, updated_at) FROM stdin;
BTC	87446.67	2025-12-24 00:56:58.353+07
BNB	840.99	2025-12-24 00:56:58.123+07
ETH	2921.19	2025-12-24 00:56:58.194+07
ADA	0.3806	2025-12-22 23:11:50.510259+07
\.


--
-- TOC entry 3977 (class 0 OID 16786)
-- Dependencies: 238
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referrals (id, referrer_id, referred_id, created_at) FROM stdin;
\.


--
-- TOC entry 3973 (class 0 OID 16677)
-- Dependencies: 234
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
\.


--
-- TOC entry 3969 (class 0 OID 16649)
-- Dependencies: 230
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
1	site_name	Trade Freedoms	text	seo	Site name	2025-12-17 22:11:05.878521	8a0ea156-beea-4748-8712-e932367886b2
2	site_title	Trade Freedoms - Profesional crypto trading platform	text	seo	Meta title	2025-12-17 22:11:05.892561	8a0ea156-beea-4748-8712-e932367886b2
3	site_description		text	seo	Meta description	2025-12-17 22:11:05.896428	8a0ea156-beea-4748-8712-e932367886b2
4	site_keywords	[]	json	seo	Keywords array	2025-12-17 22:11:05.901313	8a0ea156-beea-4748-8712-e932367886b2
5	contact_email	support@tradefreedoms.com	text	contact	Support email	2025-12-17 22:11:05.905549	8a0ea156-beea-4748-8712-e932367886b2
6	social_twitter		text	social	Twitter handle	2025-12-17 22:11:05.91313	8a0ea156-beea-4748-8712-e932367886b2
7	social_facebook		url	social	Facebook URL	2025-12-17 22:11:05.917496	8a0ea156-beea-4748-8712-e932367886b2
8	social_instagram		url	social	Instagram URL	2025-12-17 22:11:05.921335	8a0ea156-beea-4748-8712-e932367886b2
9	social_telegram		url	social	Telegram URL	2025-12-17 22:11:05.923865	8a0ea156-beea-4748-8712-e932367886b2
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
\.


--
-- TOC entry 3956 (class 0 OID 16431)
-- Dependencies: 217
-- Data for Name: spot_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spot_orders (id, created_at, user_id, symbol, side, type, price, amount, status, filled_amount) FROM stdin;
1765804969111	2025-12-15 20:22:48.766679+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	market	89457.73	0.00001	filled	0.00001
1765805053759	2025-12-15 20:24:13.38931+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	market	89387.14	0.0001	filled	0.0001
1765805086165	2025-12-15 20:24:46.076434+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	market	89386.96	0.001	filled	0.001
1765805007182	2025-12-15 20:23:26.574537+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	buy	limit	89454	0.002	filled	0.002
1765805110001	2025-12-15 20:25:09.205123+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	limit	89400	0.001	filled	0.001
1765806235265	2025-12-15 20:43:54.786248+07	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	sell	market	89508.92	0.002	filled	0.002
1765808109714	2025-12-15 21:15:09.683099+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89597.04	0.0001	filled	0.0001
1765808157420	2025-12-15 21:15:56.875372+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89545.83	0.002	filled	0.002
1765808165465	2025-12-15 21:16:05.156028+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89550.3	0.002	filled	0.002
1765808619119	2025-12-15 21:23:38.647971+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	89490.16	0.005	filled	0.005
1765808650461	2025-12-15 21:24:09.637963+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	sell	market	89426.35	0.001	filled	0.001
1765890960845	2025-12-16 20:16:00.706205+07	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	buy	market	87288.2	0.006	filled	0.006
1766508247793	2025-12-23 23:44:06.744082+07	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	sell	market	2954.59	5	filled	5
\.


--
-- TOC entry 3965 (class 0 OID 16551)
-- Dependencies: 226
-- Data for Name: swaps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.swaps (id, user_id, from_coin, to_coin, amount_in, amount_out, fee, rate, created_at) FROM stdin;
5db5d249-7d3e-4da2-9faf-4a19a1359130	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01128661	0.00005672	0.00001134	2025-12-15 21:58:11.250763+07
03494a56-6cb2-4828-b805-cf3c4b37dc4b	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01130820	0.00005683	0.00001137	2025-12-15 22:01:49.090282+07
615d58d5-a325-49ee-84dd-91dfd718dd7a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.01000000	873.28513250	4.38836750	87767.35000000	2025-12-15 22:02:13.781301+07
ac90aabd-3bda-4c0d-a56d-8b5c71ae9dd7	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	100.00000000	0.00113001	0.50000000	0.00001136	2025-12-15 22:09:11.353996+07
abcb3cf4-61f0-4d88-ad89-43d14223fef3	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01134691	5.00000000	0.00001140	2025-12-15 22:10:37.411471+07
5371f647-dd97-4ab5-aaa3-2e84cd311330	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01135595	5.00000000	0.00001141	2025-12-15 22:12:11.070176+07
0532619c-8f5c-4183-bbb4-8a29b7cbb1dc	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.02000000	1742.86170100	8.75809900	87580.99000000	2025-12-15 22:14:19.05366+07
1dbdd9cf-43e7-4371-877c-f5c95005e7cb	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	BTC	1000.00000000	0.01146913	5.00000000	0.00001147	2025-12-15 22:16:49.628593+07
09de2ef7-31ed-44f7-a4b0-6887b115491f	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	USDT	1.00000000	2931.14065000	14.72935000	2945.87000000	2025-12-18 23:19:11.27744+07
6d64fe0e-f1ee-4500-9824-0d304c43e7f3	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	USDT	0.03000000	2634.67592250	13.23957750	88263.85000000	2025-12-20 00:21:08.576814+07
96482702-b2df-42b2-8765-b04aad9ab89b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	USDT	0.50000000	43797.06922500	220.08577500	88034.31000000	2025-12-24 00:10:57.29102+07
\.


--
-- TOC entry 3978 (class 0 OID 16808)
-- Dependencies: 239
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, user_id, title, content, status, created_at, updated_at) FROM stdin;
c9213865-f9c1-47cb-a865-fb97d1c38559	0a230878-9a65-48c1-bbe7-3b965b62af0e	tesss	ahuahauhauahauhauahuahauhauahauh	open	2025-12-20 01:19:25.415373	2025-12-20 01:19:25.415373
\.


--
-- TOC entry 3957 (class 0 OID 16436)
-- Dependencies: 218
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, coin, amount, type, status, created_at) FROM stdin;
\.


--
-- TOC entry 3971 (class 0 OID 16664)
-- Dependencies: 232
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploaded_images (id, image_key, file_name, file_path, file_url, file_size, mime_type, width, height, uploaded_at, uploaded_by) FROM stdin;
6	og_image	og_image-1765984149337.jpeg	/Users/mymac/bn/public/uploads/og_image-1765984149337.jpeg	/uploads/og_image-1765984149337.jpeg	44777	image/jpeg	\N	\N	2025-12-17 22:09:09.389863	8a0ea156-beea-4748-8712-e932367886b2
1	hero_bg	hero_bg-1765992158284.jpeg	/Users/mymac/bn/public/uploads/hero_bg-1765992158284.jpeg	/uploads/hero_bg-1765992158284.jpeg	108689	image/jpeg	\N	\N	2025-12-18 00:22:38.323146	8a0ea156-beea-4748-8712-e932367886b2
5	logo	logo-1765992308265.png	/Users/mymac/bn/public/uploads/logo-1765992308265.png	/uploads/logo-1765992308265.png	48850	image/png	\N	\N	2025-12-18 00:25:08.391984	8a0ea156-beea-4748-8712-e932367886b2
3	mobile_slide2	mobile_slide2-1766505202510.jpeg	/Users/mymac/bn/public/uploads/mobile_slide2-1766505202510.jpeg	/uploads/mobile_slide2-1766505202510.jpeg	58459	image/jpeg	\N	\N	2025-12-23 22:53:22.560818	8a0ea156-beea-4748-8712-e932367886b2
4	mobile_slide3	mobile_slide3-1766505215737.jpeg	/Users/mymac/bn/public/uploads/mobile_slide3-1766505215737.jpeg	/uploads/mobile_slide3-1766505215737.jpeg	61341	image/jpeg	\N	\N	2025-12-23 22:53:35.743572	8a0ea156-beea-4748-8712-e932367886b2
2	mobile_slide1	mobile_slide1-1766510952742.jpeg	/Users/mymac/bn/public/uploads/mobile_slide1-1766510952742.jpeg	/uploads/mobile_slide1-1766510952742.jpeg	108689	image/jpeg	\N	\N	2025-12-24 00:29:12.804658	8a0ea156-beea-4748-8712-e932367886b2
\.


--
-- TOC entry 3958 (class 0 OID 16441)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role, created_at, first_name, last_name, phone, address, city, state, zip, country, email_verified, phone_verified, kyc_verified, twofa_enabled, banned, email, password_hash, last_login, referral_code, uid) FROM stdin;
1eaceb48-19ba-4f30-8ff0-17f1460877d5	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	admin@local.com	$2b$10$RxTg6jo0fkeEpYiIPMxYUe8NxFzaMRd30advxYbAL9Q5iDobUv8HC	\N	A2CF3179	51189336
8a0ea156-beea-4748-8712-e932367886b2	superadmin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	superadmin@local.com	$2b$10$RxTg6jo0fkeEpYiIPMxYUe8NxFzaMRd30advxYbAL9Q5iDobUv8HC	\N	B43C95A5	29450008
359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	2025-12-16 22:21:15.267704+07	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	f	f	bangaan2509@gmail.com	$2b$10$ztxxPLZhRojvNkkKDGehfu/uKE0IJBs/5W3d6XwAfWTfPK9h1wkiO	\N	12C66B95	99458040
0a230878-9a65-48c1-bbe7-3b965b62af0e	user	2025-12-15 20:45:42.069724+07	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	f	f	tes@absaphone.com	$2b$10$xuZRnTPbDmblYWQRE0eZ5uE5V5JkWg5tVFIPNFog1uJqPwr2I/aNu	\N	9D184003	51790197
\.


--
-- TOC entry 3959 (class 0 OID 16446)
-- Dependencies: 220
-- Data for Name: users_view; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users_view (id, email, role, banned, created_at) FROM stdin;
\.


--
-- TOC entry 3966 (class 0 OID 16585)
-- Dependencies: 227
-- Data for Name: wallet_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_addresses (id, user_id, network, address, label, created_at, updated_at) FROM stdin;
545f5d2b-9e06-477a-97a9-54ca9e2e1697	0a230878-9a65-48c1-bbe7-3b965b62af0e	TRC20	iiiiuiuiu8u8u8u8u8u8u8998988	\N	2025-12-15 23:03:17.142609+07	2025-12-15 23:03:17.142609+07
5e5d703c-6268-4818-848c-b4a8c3096f9f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	wrwrwrwr34433434rw	\N	2025-12-15 23:07:09.22507+07	2025-12-15 23:07:09.22507+07
\.


--
-- TOC entry 3960 (class 0 OID 16451)
-- Dependencies: 221
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
\.


--
-- TOC entry 3961 (class 0 OID 16456)
-- Dependencies: 222
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, coin, balance, frozen_balance, created_at, updated_at, wallet_type) FROM stdin;
8b812db8-be13-4a61-b84c-53f6530dabc2	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	0.000	0.003	\N	2025-12-15 20:43:54.784069	trading
f71e035e-2ef9-4b68-96a0-05b5f6420916	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	492	0	\N	2025-12-15 19:12:11.131438	trading
372a2f10-1b35-4258-8788-2c93e2f4abd9	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	200457.030191599999977	4332.261808400000003	\N	2025-12-20 00:01:54.019192	trading
70cd4481-50af-49dc-ad95-d86ec4cf9f30	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	90	0	2025-12-20 00:16:34.83736	2025-12-20 00:16:34.83736	funding
017c907f-4e5a-47f9-b8b1-8159a6472f18	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.0078968031293357822	0.000	\N	2025-12-20 00:21:08.576814	trading
35ee9bce-7272-41d1-87d7-551cc4984a48	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	3000.917142000002	16267.1519640000001	\N	2025-12-21 23:33:04.435534	trading
8e9f73fe-5c67-4228-a703-d22a8c68431a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	ETH	24	0	\N	2025-12-23 23:44:06.744082	trading
427d2793-6a95-419c-b6de-da595ec3670e	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	16772.95	0	2025-12-22 22:35:24.652592	2025-12-22 22:35:24.652592	funding
ca169528-8bc8-4462-bfb7-27d5502b442a	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	BTC	0.5	0	2025-12-24 00:09:42.842475	2025-12-24 00:10:57.29102	funding
9dddd801-582e-4d27-802f-f552f379cf6b	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	USDT	43958.209875	0	\N	2025-12-24 00:10:57.29102	trading
6ca589cb-5478-4cd6-875b-aab282356172	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	16396	-14900	2025-12-19 23:51:12.056511	2025-12-21 23:20:43.263729	funding
\.


--
-- TOC entry 3962 (class 0 OID 16461)
-- Dependencies: 223
-- Data for Name: withdraw_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraw_requests (id, user_id, amount, address, tx_hash, status, created_at, approved_at) FROM stdin;
\.


--
-- TOC entry 3963 (class 0 OID 16466)
-- Dependencies: 224
-- Data for Name: withdraws; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraws (id, user_id, coin, network, amount, address, txid, status, created_at) FROM stdin;
03a7f3c2-94df-498c-b49f-453a7916f06c	023c6ce8-0cef-4d9d-bcbe-45662046a493	usdt	trc20	1000	gyygygygygygygy	\N	approved	\N
f3f43d11-cb35-4035-acc5-09ad0967bf05	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	TRC20	1000	iiiiuiuiu8u8u8u8u8u8u8998988	\N	approved	\N
debcfc62-85bb-4e32-92a1-c854e5d93388	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	TRC20	1000	iiiiuiuiu8u8u8u8u8u8u8998988	\N	pending	\N
\.


--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 233
-- Name: settings_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_history_id_seq', 9, true);


--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 229
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 30, true);


--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 231
-- Name: uploaded_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.uploaded_images_id_seq', 15, true);


--
-- TOC entry 3790 (class 2606 OID 16734)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3786 (class 2606 OID 16723)
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3767 (class 2606 OID 16604)
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3796 (class 2606 OID 16754)
-- Name: kyc_submissions kyc_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3798 (class 2606 OID 16756)
-- Name: kyc_submissions kyc_submissions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_user_id_key UNIQUE (user_id);


--
-- TOC entry 3759 (class 2606 OID 16549)
-- Name: option_settings option_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_settings
    ADD CONSTRAINT option_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3802 (class 2606 OID 16792)
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- TOC entry 3804 (class 2606 OID 16794)
-- Name: referrals referrals_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_key UNIQUE (referred_id);


--
-- TOC entry 3784 (class 2606 OID 16685)
-- Name: settings_history settings_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_history
    ADD CONSTRAINT settings_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3773 (class 2606 OID 16658)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3775 (class 2606 OID 16660)
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 3761 (class 2606 OID 16557)
-- Name: swaps swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swaps
    ADD CONSTRAINT swaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3808 (class 2606 OID 16818)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3778 (class 2606 OID 16674)
-- Name: uploaded_images uploaded_images_image_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_image_key_key UNIQUE (image_key);


--
-- TOC entry 3780 (class 2606 OID 16672)
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 16766)
-- Name: users users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);


--
-- TOC entry 3754 (class 2606 OID 16823)
-- Name: users users_uid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uid_key UNIQUE (uid);


--
-- TOC entry 3763 (class 2606 OID 16591)
-- Name: wallet_addresses wallet_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3765 (class 2606 OID 16593)
-- Name: wallet_addresses wallet_addresses_user_id_network_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_user_id_network_key UNIQUE (user_id, network);


--
-- TOC entry 3757 (class 2606 OID 16763)
-- Name: wallets wallets_user_coin_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_coin_type_unique UNIQUE (user_id, coin, wallet_type);


--
-- TOC entry 3791 (class 1259 OID 16743)
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- TOC entry 3792 (class 1259 OID 16742)
-- Name: idx_chat_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_session_id ON public.chat_messages USING btree (session_id);


--
-- TOC entry 3787 (class 1259 OID 16741)
-- Name: idx_chat_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_status ON public.chat_sessions USING btree (status);


--
-- TOC entry 3788 (class 1259 OID 16740)
-- Name: idx_chat_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions USING btree (user_id);


--
-- TOC entry 3768 (class 1259 OID 16605)
-- Name: idx_email_verifications_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_email ON public.email_verifications USING btree (email);


--
-- TOC entry 3769 (class 1259 OID 16606)
-- Name: idx_email_verifications_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_expires ON public.email_verifications USING btree (expires_at);


--
-- TOC entry 3793 (class 1259 OID 16758)
-- Name: idx_kyc_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_status ON public.kyc_submissions USING btree (status);


--
-- TOC entry 3794 (class 1259 OID 16757)
-- Name: idx_kyc_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_user_id ON public.kyc_submissions USING btree (user_id);


--
-- TOC entry 3746 (class 1259 OID 16535)
-- Name: idx_options_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_expires ON public.options USING btree (expires_at);


--
-- TOC entry 3747 (class 1259 OID 16534)
-- Name: idx_options_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_user_status ON public.options USING btree (user_id, status);


--
-- TOC entry 3748 (class 1259 OID 16537)
-- Name: idx_price_cache_symbol; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_price_cache_symbol ON public.price_cache USING btree (symbol);


--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 3748
-- Name: INDEX idx_price_cache_symbol; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_price_cache_symbol IS 'Optimizes price_cache queries by symbol for VPS performance';


--
-- TOC entry 3799 (class 1259 OID 16796)
-- Name: idx_referrals_referred; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referred ON public.referrals USING btree (referred_id);


--
-- TOC entry 3800 (class 1259 OID 16795)
-- Name: idx_referrals_referrer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referrals_referrer ON public.referrals USING btree (referrer_id);


--
-- TOC entry 3781 (class 1259 OID 16687)
-- Name: idx_settings_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_history_date ON public.settings_history USING btree (changed_at DESC);


--
-- TOC entry 3782 (class 1259 OID 16686)
-- Name: idx_settings_history_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_history_key ON public.settings_history USING btree (setting_key);


--
-- TOC entry 3770 (class 1259 OID 16662)
-- Name: idx_site_settings_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_settings_category ON public.site_settings USING btree (category);


--
-- TOC entry 3771 (class 1259 OID 16661)
-- Name: idx_site_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_site_settings_key ON public.site_settings USING btree (setting_key);


--
-- TOC entry 3749 (class 1259 OID 16536)
-- Name: idx_spot_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spot_orders_user ON public.spot_orders USING btree (user_id, status);


--
-- TOC entry 3805 (class 1259 OID 16820)
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- TOC entry 3806 (class 1259 OID 16819)
-- Name: idx_tickets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_user_id ON public.tickets USING btree (user_id);


--
-- TOC entry 3776 (class 1259 OID 16675)
-- Name: idx_uploaded_images_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_uploaded_images_key ON public.uploaded_images USING btree (image_key);


--
-- TOC entry 3750 (class 1259 OID 16776)
-- Name: idx_users_referral_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_referral_code ON public.users USING btree (referral_code);


--
-- TOC entry 3755 (class 1259 OID 16764)
-- Name: idx_wallets_user_coin_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wallets_user_coin_type ON public.wallets USING btree (user_id, coin, wallet_type);


--
-- TOC entry 3809 (class 2606 OID 16735)
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;


-- Completed on 2025-12-24 01:06:05 WIB

--
-- PostgreSQL database dump complete
--

\unrestrict Snvgb3TntgPcOoifvhUvVYcQbkIr6hEIad3Qg0kPiXeyIMIqKkw9egGp0ID3awU

