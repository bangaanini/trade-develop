--
-- PostgreSQL database dump
--

\restrict vuLTgncS4ULX5n2bgr5dX2Lbs0Nxf6UJdRapNbbqfR1nENxUgvEvuHt03U71jgJ

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

-- Started on 2025-12-17 17:19:46 WIB

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

DROP INDEX IF EXISTS public.idx_spot_orders_user;
DROP INDEX IF EXISTS public.idx_price_cache_symbol;
DROP INDEX IF EXISTS public.idx_options_user_status;
DROP INDEX IF EXISTS public.idx_options_expires;
DROP INDEX IF EXISTS public.idx_kyc_submissions_user_id;
DROP INDEX IF EXISTS public.idx_kyc_submissions_status;
DROP INDEX IF EXISTS public.idx_email_verifications_expires;
DROP INDEX IF EXISTS public.idx_email_verifications_email;
ALTER TABLE IF EXISTS ONLY public.wallet_addresses DROP CONSTRAINT IF EXISTS wallet_addresses_user_id_network_key;
ALTER TABLE IF EXISTS ONLY public.wallet_addresses DROP CONSTRAINT IF EXISTS wallet_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.swaps DROP CONSTRAINT IF EXISTS swaps_pkey;
ALTER TABLE IF EXISTS ONLY public.option_settings DROP CONSTRAINT IF EXISTS option_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_user_id_key;
ALTER TABLE IF EXISTS ONLY public.kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.email_verifications DROP CONSTRAINT IF EXISTS email_verifications_pkey;
DROP TABLE IF EXISTS public.withdraws;
DROP TABLE IF EXISTS public.withdraw_requests;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.wallet_logs;
DROP TABLE IF EXISTS public.wallet_addresses;
DROP TABLE IF EXISTS public.users_view;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.swaps;
DROP TABLE IF EXISTS public.spot_orders;
DROP TABLE IF EXISTS public.price_cache;
DROP TABLE IF EXISTS public.options;
DROP TABLE IF EXISTS public.option_settings;
DROP TABLE IF EXISTS public.option_pairs;
DROP TABLE IF EXISTS public.option_durations;
DROP TABLE IF EXISTS public.kyc_submissions;
DROP TABLE IF EXISTS public.email_verifications;
DROP TABLE IF EXISTS public.deposits;
DROP TABLE IF EXISTS public.deposit_methods;
DROP TABLE IF EXISTS public.admin_logs;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- TOC entry 2 (class 3079 OID 16472)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3876 (class 0 OID 0)
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
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE email_verifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.email_verifications IS 'Stores OTP codes for email verification during registration';


--
-- TOC entry 229 (class 1259 OID 16633)
-- Name: kyc_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kyc_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(20) NOT NULL,
    id_card_filename text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_note text,
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT kyc_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE kyc_submissions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.kyc_submissions IS 'Stores KYC verification submissions with local file references';


--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 229
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
    payout_percent numeric
);


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
    last_login timestamp with time zone
);


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
    updated_at timestamp without time zone
);


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
-- TOC entry 3851 (class 0 OID 16386)
-- Dependencies: 210
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_logs (id, admin_id, action, details, created_at) FROM stdin;
\.


--
-- TOC entry 3852 (class 0 OID 16391)
-- Dependencies: 211
-- Data for Name: deposit_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deposit_methods (id, coin, network, address, qr_code_url, is_active, created_at, updated_at) FROM stdin;
62fe76c2-48ef-4685-a8c1-8227b058fcce	ETH	ETH	8xuduhdhuuhddhuudhudhudhu	/uploads/1765800175749_d2dyq.png	t	\N	2025-12-15 19:39:15.542126
56350a89-fa8c-45ab-8d3d-78ed6f500ec7	USDT	TRC20	0xjjdujdudududhd7yd7dy7dyd7		t	\N	2025-12-15 19:39:33.562033
\.


--
-- TOC entry 3853 (class 0 OID 16396)
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
\.


--
-- TOC entry 3869 (class 0 OID 16594)
-- Dependencies: 228
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verifications (id, email, otp_code, password_hash, created_at, expires_at, verified, attempts) FROM stdin;
fc46d2fc-bdec-4563-9ef5-9b5520dbac9d	bangaan2509@gmail.com	313039	$2b$10$5sRweoEkpUOL7rYEaiVEQuWHLjEii1Mp7LL01YYEd.ppMNrmZ4HE2	2025-12-16 22:20:54.947953+07	2025-12-16 22:25:54.947+07	t	0
\.


--
-- TOC entry 3870 (class 0 OID 16633)
-- Dependencies: 229
-- Data for Name: kyc_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kyc_submissions (id, user_id, full_name, address, phone, id_card_filename, status, admin_note, submitted_at, reviewed_at, reviewed_by) FROM stdin;
56bfe18f-161f-4732-b11c-836101dd8250	359ec1a3-6517-43f8-a3e4-c72cf8c6260c	aan hendri	ahahuauhahauahuahuaahuauhahu	09277373	d35ba699-e462-4d5b-84f3-cb6f07d2e2bb.png	approved	\N	2025-12-16 22:51:55.061059+07	2025-12-16 23:05:39.938174+07	8a0ea156-beea-4748-8712-e932367886b2
\.


--
-- TOC entry 3854 (class 0 OID 16401)
-- Dependencies: 213
-- Data for Name: option_durations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_durations (id, seconds, is_active, payout_percent) FROM stdin;
33302a99-977c-4c14-abca-8dac8773abec	30	t	80
e8c2fd9e-f8d3-4dfb-a6a3-c9227f7bff4d	60	t	80
66cc2d85-b9e7-4144-ab08-376c8017d132	180	t	80
60363d79-0fa7-4319-8715-d6d4c6199b71	300	t	80
\.


--
-- TOC entry 3855 (class 0 OID 16411)
-- Dependencies: 214
-- Data for Name: option_pairs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_pairs (id, symbol, is_active) FROM stdin;
ef1e5aed-b913-4d2b-8d53-b939a263e744	BTC	t
1100f876-84f4-4f8f-93e5-669fb2f3bbec	ETH	t
\.


--
-- TOC entry 3866 (class 0 OID 16538)
-- Dependencies: 225
-- Data for Name: option_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_settings (id, min_amount, max_amount, is_enabled, profit_percent, payout_percent) FROM stdin;
d7b118c5-900d-43e3-8e33-c4ee6fcc156b	10	1000	t	80	80
\.


--
-- TOC entry 3856 (class 0 OID 16421)
-- Dependencies: 215
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.options (id, user_id, symbol, direction, amount, entry_price, exit_price, profit, status, duration, expires_at, created_at, payout_percent, closed_at) FROM stdin;
e54ac18f-1f6c-4ecd-97fd-32697f2e812a	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	200	89748.61	89748.61	0	lose	30	2025-12-15 19:45:14.473+07	2025-12-15 19:44:44.473782+07	80	2025-12-15 19:45:15.405365+07
1c1692d9-30f8-4043-9e65-f215003213be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	500	89748.61	89748.61	0	lose	30	2025-12-15 19:46:10.315+07	2025-12-15 19:45:40.315713+07	80	2025-12-15 19:46:10.43467+07
d7e9a3aa-b185-46b2-a1cf-1b499d52e4c7	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89748.61	89748.61	0	lose	30	2025-12-15 19:48:53.483+07	2025-12-15 19:48:23.484602+07	80	2025-12-15 19:48:53.709654+07
824b9b46-bdc1-48ef-9f84-59551e06e9be	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	down	1000	89665.08	89665.08	0	lose	30	2025-12-15 19:52:05.147+07	2025-12-15 19:51:35.148599+07	80	2025-12-15 19:52:07.195692+07
9b913e4f-3a5a-409b-a907-78a902d71b68	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	1000	3154.36	3155.25	0	lose	30	2025-12-15 19:53:01.525+07	2025-12-15 19:52:31.525679+07	80	2025-12-15 19:53:02.121734+07
bc937469-75f6-4be0-a8a6-6fb27dab1bb0	023c6ce8-0cef-4d9d-bcbe-45662046a493	ETH	down	500	3155.5	3155.28	400	win	30	2025-12-15 19:53:41.421+07	2025-12-15 19:53:11.42179+07	80	2025-12-15 19:53:42.156812+07
54f8c001-8e0c-4e89-a79c-394bd224c47c	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	200	89534.66	89516.1	0	lose	30	2025-12-15 20:47:36.041+07	2025-12-15 20:47:06.045285+07	80	2025-12-15 20:47:36.488597+07
154e0315-03b7-48bf-a1e0-03f9e4210544	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	200	89511.75	89562.46	0	lose	30	2025-12-15 20:48:24.805+07	2025-12-15 20:47:54.805744+07	80	2025-12-15 20:48:25.488131+07
eb664a26-ad52-46f2-a9cb-7d923bb386ec	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	1000	86438.15	86430.01	0	lose	30	2025-12-16 06:45:54.823+07	2025-12-16 06:45:24.826305+07	80	2025-12-16 06:45:55.420135+07
1296e162-38f0-4e48-aa4c-0a6701448eb1	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	500	86448.9	86463.61	0	lose	30	2025-12-16 17:14:17.665+07	2025-12-16 17:13:47.668058+07	80	2025-12-16 17:14:20.622454+07
5db9a8f4-fb30-4cc1-a888-3d956c686226	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86489	86488.99	800	win	30	2025-12-16 17:19:29.99+07	2025-12-16 17:18:59.990938+07	80	2025-12-16 17:19:30.611041+07
6250f3d1-42cd-479b-afcd-35470a148bbd	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	up	500	86446	86403.42	0	lose	30	2025-12-16 17:20:12.029+07	2025-12-16 17:19:42.029592+07	80	2025-12-16 17:20:20.606627+07
c9e07f2c-91bd-40ee-81c6-d1d7913ae14d	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	86438	86431.05	800	win	30	2025-12-16 17:22:20.544+07	2025-12-16 17:21:50.544857+07	80	2025-12-16 17:22:21.148874+07
959419b8-0810-45f3-9a9f-dd6c5518754a	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	down	1000	87174.55	87138	800	win	30	2025-12-16 20:10:09.61+07	2025-12-16 20:09:39.613347+07	80	2025-12-16 20:10:10.349106+07
\.


--
-- TOC entry 3857 (class 0 OID 16426)
-- Dependencies: 216
-- Data for Name: price_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_cache (symbol, price, updated_at) FROM stdin;
BTC	86397.43	2025-12-17 17:08:10.384+07
ETH	2915.89	2025-12-17 17:08:10.407+07
BNB	858.79	2025-12-17 17:08:10.341+07
\.


--
-- TOC entry 3858 (class 0 OID 16431)
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
\.


--
-- TOC entry 3867 (class 0 OID 16551)
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
\.


--
-- TOC entry 3859 (class 0 OID 16436)
-- Dependencies: 218
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, coin, amount, type, status, created_at) FROM stdin;
\.


--
-- TOC entry 3860 (class 0 OID 16441)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role, created_at, first_name, last_name, phone, address, city, state, zip, country, email_verified, phone_verified, kyc_verified, twofa_enabled, banned, email, password_hash, last_login) FROM stdin;
1eaceb48-19ba-4f30-8ff0-17f1460877d5	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	admin@local.com	$2b$10$RxTg6jo0fkeEpYiIPMxYUe8NxFzaMRd30advxYbAL9Q5iDobUv8HC	\N
8a0ea156-beea-4748-8712-e932367886b2	superadmin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	superadmin@local.com	$2b$10$RxTg6jo0fkeEpYiIPMxYUe8NxFzaMRd30advxYbAL9Q5iDobUv8HC	\N
8df72a9e-0b11-45f8-b2c9-9ce97c4c446a	user	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	akun@email.com	$2b$10$usNK4RrN4mSFsucg/CeyROSXQK64AkJDEP0ZYawq26z7GJYich4fK	\N
5508d664-1697-42ea-9186-24ed0ae7c42e	user	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	tes@email.com	$2b$10$2uZbs2n6q20ciDwVudZN5OAS2m3mm.G/ldpJrG56YmvraTOLz2o3a	\N
023c6ce8-0cef-4d9d-bcbe-45662046a493	user	2025-12-15 18:53:17.359311+07	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	admin@absaphone.com	$2b$10$xQPyu3Tn9z/2jtOyxJnvFeMrwiQkuQg34TsriyJCsZFOm.d9u/1aC	\N
0a230878-9a65-48c1-bbe7-3b965b62af0e	user	2025-12-15 20:45:42.069724+07	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	tes@absaphone.com	$2b$10$xuZRnTPbDmblYWQRE0eZ5uE5V5JkWg5tVFIPNFog1uJqPwr2I/aNu	\N
359ec1a3-6517-43f8-a3e4-c72cf8c6260c	user	2025-12-16 22:21:15.267704+07	\N	\N	\N	\N	\N	\N	\N	\N	t	f	t	f	f	bangaan2509@gmail.com	$2b$10$5sRweoEkpUOL7rYEaiVEQuWHLjEii1Mp7LL01YYEd.ppMNrmZ4HE2	\N
\.


--
-- TOC entry 3861 (class 0 OID 16446)
-- Dependencies: 220
-- Data for Name: users_view; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users_view (id, email, role, banned, created_at) FROM stdin;
\.


--
-- TOC entry 3868 (class 0 OID 16585)
-- Dependencies: 227
-- Data for Name: wallet_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_addresses (id, user_id, network, address, label, created_at, updated_at) FROM stdin;
545f5d2b-9e06-477a-97a9-54ca9e2e1697	0a230878-9a65-48c1-bbe7-3b965b62af0e	TRC20	iiiiuiuiu8u8u8u8u8u8u8998988	\N	2025-12-15 23:03:17.142609+07	2025-12-15 23:03:17.142609+07
5e5d703c-6268-4818-848c-b4a8c3096f9f	0a230878-9a65-48c1-bbe7-3b965b62af0e	ETH	wrwrwrwr34433434rw	\N	2025-12-15 23:07:09.22507+07	2025-12-15 23:07:09.22507+07
\.


--
-- TOC entry 3862 (class 0 OID 16451)
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
\.


--
-- TOC entry 3863 (class 0 OID 16456)
-- Dependencies: 222
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, coin, balance, frozen_balance, created_at, updated_at) FROM stdin;
372a2f10-1b35-4258-8788-2c93e2f4abd9	023c6ce8-0cef-4d9d-bcbe-45662046a493	USDT	1457.030191599999977	4332.261808400000003	\N	2025-12-15 20:42:41.899324
f71e035e-2ef9-4b68-96a0-05b5f6420916	023c6ce8-0cef-4d9d-bcbe-45662046a493	eth	492	0	\N	2025-12-15 19:12:11.131438
8b812db8-be13-4a61-b84c-53f6530dabc2	023c6ce8-0cef-4d9d-bcbe-45662046a493	BTC	0.000	0.003	\N	2025-12-15 20:43:54.784069
0137dd04-ccf7-4207-b9ab-e149467dcaf7	023c6ce8-0cef-4d9d-bcbe-45662046a493	usdt	199000	0	\N	2025-12-15 19:19:05.096479
35ee9bce-7272-41d1-87d7-551cc4984a48	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	15262.241219500001	1367.1519640000001	\N	2025-12-16 20:16:00.706205
017c907f-4e5a-47f9-b8b1-8159a6472f18	0a230878-9a65-48c1-bbe7-3b965b62af0e	BTC	0.0378968031293357822	0.000	\N	2025-12-15 22:16:49.628593
\.


--
-- TOC entry 3864 (class 0 OID 16461)
-- Dependencies: 223
-- Data for Name: withdraw_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraw_requests (id, user_id, amount, address, tx_hash, status, created_at, approved_at) FROM stdin;
\.


--
-- TOC entry 3865 (class 0 OID 16466)
-- Dependencies: 224
-- Data for Name: withdraws; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdraws (id, user_id, coin, network, amount, address, txid, status, created_at) FROM stdin;
03a7f3c2-94df-498c-b49f-453a7916f06c	023c6ce8-0cef-4d9d-bcbe-45662046a493	usdt	trc20	1000	gyygygygygygygy	\N	approved	\N
f3f43d11-cb35-4035-acc5-09ad0967bf05	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	TRC20	1000	iiiiuiuiu8u8u8u8u8u8u8998988	\N	approved	\N
debcfc62-85bb-4e32-92a1-c854e5d93388	0a230878-9a65-48c1-bbe7-3b965b62af0e	USDT	TRC20	1000	iiiiuiuiu8u8u8u8u8u8u8998988	\N	pending	\N
\.


--
-- TOC entry 3703 (class 2606 OID 16604)
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3709 (class 2606 OID 16643)
-- Name: kyc_submissions kyc_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 16645)
-- Name: kyc_submissions kyc_submissions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_user_id_key UNIQUE (user_id);


--
-- TOC entry 3695 (class 2606 OID 16549)
-- Name: option_settings option_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_settings
    ADD CONSTRAINT option_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3697 (class 2606 OID 16557)
-- Name: swaps swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swaps
    ADD CONSTRAINT swaps_pkey PRIMARY KEY (id);


--
-- TOC entry 3699 (class 2606 OID 16591)
-- Name: wallet_addresses wallet_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 3701 (class 2606 OID 16593)
-- Name: wallet_addresses wallet_addresses_user_id_network_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_user_id_network_key UNIQUE (user_id, network);


--
-- TOC entry 3704 (class 1259 OID 16605)
-- Name: idx_email_verifications_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_email ON public.email_verifications USING btree (email);


--
-- TOC entry 3705 (class 1259 OID 16606)
-- Name: idx_email_verifications_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_verifications_expires ON public.email_verifications USING btree (expires_at);


--
-- TOC entry 3706 (class 1259 OID 16647)
-- Name: idx_kyc_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_status ON public.kyc_submissions USING btree (status);


--
-- TOC entry 3707 (class 1259 OID 16646)
-- Name: idx_kyc_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kyc_submissions_user_id ON public.kyc_submissions USING btree (user_id);


--
-- TOC entry 3690 (class 1259 OID 16535)
-- Name: idx_options_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_expires ON public.options USING btree (expires_at);


--
-- TOC entry 3691 (class 1259 OID 16534)
-- Name: idx_options_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_options_user_status ON public.options USING btree (user_id, status);


--
-- TOC entry 3692 (class 1259 OID 16537)
-- Name: idx_price_cache_symbol; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_price_cache_symbol ON public.price_cache USING btree (symbol);


--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 3692
-- Name: INDEX idx_price_cache_symbol; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_price_cache_symbol IS 'Optimizes price_cache queries by symbol for VPS performance';


--
-- TOC entry 3693 (class 1259 OID 16536)
-- Name: idx_spot_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_spot_orders_user ON public.spot_orders USING btree (user_id, status);


-- Completed on 2025-12-17 17:19:47 WIB

--
-- PostgreSQL database dump complete
--

\unrestrict vuLTgncS4ULX5n2bgr5dX2Lbs0Nxf6UJdRapNbbqfR1nENxUgvEvuHt03U71jgJ

