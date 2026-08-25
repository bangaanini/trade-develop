CREATE TABLE public.admin_logs (
  id uuid NOT NULL,
  admin_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone
);

CREATE TABLE public.deposit_methods (
  id uuid NOT NULL,
  coin text NOT NULL,
  network text NOT NULL,
  address text NOT NULL,
  qr_code_url text,
  is_active boolean,
  created_at timestamp without time zone
);

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

CREATE TABLE public.option_durations (
  id uuid NOT NULL,
  seconds integer NOT NULL,
  is_active boolean NOT NULL,
  payout_percent numeric
);

CREATE TABLE public.option_orders (
  id uuid NOT NULL,
  user_id uuid,
  symbol text NOT NULL,
  duration integer NOT NULL,
  amount numeric NOT NULL,
  entry_price numeric,
  exit_price numeric,
  profit numeric,
  status text,
  created_at timestamp with time zone,
  closed_at timestamp with time zone
);

CREATE TABLE public.option_pairs (
  id uuid NOT NULL,
  symbol text NOT NULL,
  is_active boolean NOT NULL
);

CREATE TABLE public.option_positions (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  direction text NOT NULL,
  amount numeric NOT NULL,
  entry_price numeric NOT NULL,
  result_price numeric,
  profit numeric,
  status text,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone
);

CREATE TABLE public.option_settings (
  id integer NOT NULL,
  profit_percent numeric,
  min_amount numeric,
  durations ARRAY,
  uid uuid,
  payout_percent numeric NOT NULL,
  max_amount numeric NOT NULL,
  is_enabled boolean NOT NULL,
  updated_at timestamp with time zone
);

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
  created_at timestamp with time zone,
  payout_percent numeric
);

CREATE TABLE public.price_cache (
  symbol text NOT NULL,
  price numeric NOT NULL,
  updated_at timestamp with time zone
);

CREATE TABLE public.public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone,
  last_login timestamp with time zone
);

CREATE TABLE public.settings (
  id uuid NOT NULL,
  deposit_address text,
  binary_durations ARRAY,
  binary_payout numeric,
  updated_at timestamp with time zone
);

CREATE TABLE public.spot_orders (
  id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL,
  type text NOT NULL,
  price numeric,
  amount numeric NOT NULL,
  status text NOT NULL,
  filled_amount numeric
);

CREATE TABLE public.transactions (
  id uuid NOT NULL,
  user_id uuid,
  coin text,
  amount numeric,
  type text,
  status text,
  created_at timestamp without time zone
);

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
  email text
);

CREATE TABLE public.users_view (
  id uuid,
  email character varying(255),
  role text,
  banned boolean,
  created_at timestamp with time zone
);

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

CREATE TABLE public.wallets (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  coin text NOT NULL,
  balance numeric,
  frozen_balance numeric,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
);

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

