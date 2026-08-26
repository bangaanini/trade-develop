# 📚 DOKUMENTASI UTAMA PROJECT TRADE FREEDOM

Dokumentasi ini mencakup penjelasan lengkap mengenai arsitektur project, struktur folder, fitur-fitur utama, panduan instalasi lokal, panduan deployment lengkap ke VPS dengan Nginx & SSL, konfigurasi Cloudflare R2 Storage, hingga pemeliharaan database dan pengujian.

---

## 📑 Daftar Isi

1. [Ringkasan & Arsitektur Project](#1-ringkasan--arsitektur-project)
2. [Peta Halaman & Fitur Aplikasi](#2-peta-halaman--fitur-aplikasi)
3. [Panduan Instalasi & Jalankan di Lokal (Development)](#3-panduan-instalasi--jalankan-di-lokal-development)
4. [Panduan Deployment Lengkap ke VPS (Production)](#4-panduan-deployment-lengkap-ke-vps-production)
5. [Konfigurasi Cloudflare R2 Storage](#5-konfigurasi-cloudflare-r2-storage)
6. [Konfigurasi Service & Layanan Tambahan](#6-konfigurasi-service--layanan-tambahan)
7. [Panduan Backup & Restore Database](#7-panduan-backup--restore-database)
8. [Panduan Pengujian (Testing)](#8-panduan-pengujian-testing)

---

## 1. Ringkasan & Arsitektur Project

**Trade Freedom** (nama paket: `bn`) adalah platform perdagangan cryptocurrency modern yang dibangun menggunakan **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, dan **PostgreSQL**.

### 🛠️ Tech Stack & Dependencies

*   **Frontend Framework**: Next.js 16.0.8 (App Router, Turbopack, Server Actions)
*   **UI Library**: React 19, Lucide Icons, React Hot Toast, Lightweight Charts (TradingView)
*   **Backend & Database**: Next.js Route Handlers (API), PostgreSQL (`pg` Pool), Node.js
*   **Object Storage**: Cloudflare R2 (S3-compatible via `@aws-sdk/client-s3`)
*   **Authentication & Security**: JWT Cookie-Based Auth, Bcrypt Password Hashing, Role Isolation (`user`, `admin`, `superadmin`)
*   **Realtime Price & Background Worker**: WebSocket Binance Stream API (`wss://stream.binance.com`), `tsx` Worker process (`worker/index.ts`)
*   **Process Manager**: PM2 (`ecosystem.config.js`)
*   **Web Server / Proxy**: Nginx + Certbot (SSL Let's Encrypt)

### 📁 Struktur Folder Utama

```
trade-develop/
├── app/                        # Next.js App Router (Pages & API Endpoints)
│   ├── (auth)/                 # Login, Register, Forgot Password
│   ├── account/                # User Profile & Security Settings
│   ├── admin/                  # Dashboard Admin Panel & Management Pages
│   │   ├── chat/               # Support Live Chat Admin Interface
│   │   ├── database/           # Database Viewer & Management
│   │   ├── deposit-methods/    # QR Code & Deposit Address Admin
│   │   ├── deposits/           # Deposit Approval System
│   │   ├── kyc/                # KYC Submissions Review
│   │   ├── option/             # Option Trading Parameters
│   │   ├── settings/           # SEO, Content, & Image Manager
│   │   ├── tickets/            # User Support Tickets
│   │   ├── trades/             # Option Trading History & Logs
│   │   ├── transactions/       # All Transactions Ledger
│   │   ├── users/              # User List & Win Rate Control
│   │   └── withdraws/          # Withdrawal Approval System
│   ├── api/                    # REST API Endpoints (88 Routes)
│   │   ├── admin/              # Admin CRUD APIs
│   │   ├── auth/               # Auth, Session, OTP, Login/Register APIs
│   │   ├── binance/            # Binance Market Price & Kline Proxies
│   │   ├── chat/               # Live Chat User APIs
│   │   ├── deposit/            # User Deposit APIs
│   │   ├── kyc/                # User KYC Submission APIs
│   │   ├── market/             # Market Overview API
│   │   ├── option/             # Option Orders & Settings APIs
│   │   ├── spot/               # Spot Orders & Cancel APIs
│   │   ├── swap/               # Crypto Swap APIs
│   │   ├── transfer/           # Inter-wallet Transfer APIs
│   │   ├── uploads/            # Dynamic File Proxy (R2 & Local)
│   │   ├── wallets/            # Wallet Balance APIs
│   │   └── withdraw/           # Withdrawal Request APIs
│   ├── deposit/                # Halaman Deposit User
│   ├── option/                 # Halaman Binary Option Trading
│   ├── spot/                   # Halaman Spot Trading
│   ├── swap/                   # Halaman Swap Crypto
│   ├── transfer/               # Halaman Transfer Antar Wallet
│   ├── wallet/                 # Halaman Dompet & Saldo
│   └── withdraw/               # Halaman Penarikan Dana (Withdrawal)
├── components/                 # Komponen React (Desktop & Mobile Layouts)
│   ├── admin/                  # Komponen UI Admin Panel
│   ├── mobile/                 # Layout & Slider Khusus Mobile
│   ├── option/                 # Komponen Chart & Panel Option Trading
│   ├── spot/                   # Komponen Chart & Orderbook Spot Trading
│   └── ui/                     # Reusable UI Elements (Modals, Buttons)
├── config/                     # Konfigurasi Branding & Site SEO (`site.ts`)
├── lib/                        # Utility Libraries
│   ├── auth.ts                 # JWT Sign & Verification
│   ├── db.ts                   # PostgreSQL Connection Pool
│   ├── email.ts                # Nodemailer Email Sender
│   ├── settings.ts             # Site Settings & Image Helpers
│   └── upload.ts               # Storage Manager (Cloudflare R2 & Local Fallback)
├── worker/                     # Background Worker Execution
│   ├── index.ts                # Main Worker Entrypoint
│   ├── priceFeed.ts            # Binance WebSocket Price Stream Cache
│   ├── settleOption.ts         # Binary Option Settlement Engine (Winrate Control)
│   └── settleSpotLimit.ts      # Spot Limit Order Execution Engine
├── ecosystem.config.js         # Konfigurasi Process PM2
├── next.config.ts              # Konfigurasi Next.js
└── database.sql / schema.sql   # Skema & Backup Database PostgreSQL
```

---

## 2. Peta Halaman & Fitur Aplikasi

### 🔹 Halaman Publik & Autentikasi
*   `/` : Homepage utama dengan banner slider mobile/desktop, daftar pasar realtime, & pengenalan platform.
*   `/login` : Halaman masuk menggunakan Email & Password.
*   `/register` : Halaman pendaftaran dengan verifikasi **Email OTP (6-digit)**.
*   `/forgot-password` : Halaman reset kata sandi menggunakan link/OTP email.
*   `/terms` & `/privacy` : Halaman syarat & ketentuan serta kebijakan privasi.
*   `/download` : Halaman unduh aplikasi (support PWA / instalasi layar utama).

### 🔹 Halaman User Trading & Financial
*   `/spot` : Halaman perdagangan Spot dengan grafik TradingView, orderbook live, serta form Buy/Sell Limit & Market.
*   `/option` : Halaman perdagangan **Binary Options** dengan durasi (30s, 60s, 180s, dst.), indikator naik/turun (Call/Put), popup estimasi hasil, & modal hasil win/lose.
*   `/wallet` : Ringkasan 5 jenis dompet (*Funding*, *Trading*, *Futures*, *Stocks*, *Mining*).
*   `/deposit` : Halaman penyetoran saldo USDT dengan pemilihan jaringan (TRC20, ERC20, BEP20, BTC), alamat dompet, kode QR, & unggah bukti transfer.
*   `/withdraw` : Halaman penarikan dana USDT ke dompet eksternal.
*   `/transfer` : Halaman transfer internal antar dompet (misal: *Funding* ↔ *Trading*).
*   `/swap` : Halaman penukaran antar koin crypto secara instan.
*   `/account` & `/account/security` : Profil pengguna, verifikasi KYC, & ubah password.

### 🔹 Halaman Admin Panel (`/admin`)
Halaman admin dilindungi middleware & otorisasi role (`admin` & `superadmin`):
*   `/admin` : Dashboard statistik (total pengguna, saldo deposit, withdrawal, total perdagangan).
*   `/admin/users` : Manajemen pengguna, aktivasi/blokir, serta **Kontrol Win Rate Per-User (0% - 100%)**.
*   `/admin/deposits` : Persetujuan (*Approve/Reject*) permohonan deposit saldo pengguna.
*   `/admin/withdraws` : Persetujuan (*Approve/Reject*) permohonan penarikan saldo pengguna.
*   `/admin/deposit-methods` : Pengaturan alamat dompet deposit & unggah foto kode QR.
*   `/admin/kyc` : Review & verifikasi dokumen foto KTP/ID card pengguna.
*   `/admin/option` : Pengaturan durasi option, persentase payout (misal 85%), min/max taruhan.
*   `/admin/trades` : Riwayat perdagangan option & log perubahan winrate.
*   `/admin/transactions` : Ledger seluruh transaksi sistem (deposit, withdraw, option, spot, swap).
*   `/admin/settings` : Pengaturan umum situs.
*   `/admin/settings/seo` : Pengaturan Meta Title, Description, Keywords SEO.
*   `/admin/settings/images` : Pengaturan Logo, Banner Hero, & Slider Mobile.
*   `/admin/database` : Pengelola tabel database langsung dari dashboard.

---

## 3. Panduan Instalasi & Jalankan di Lokal (Development)

### Requirements
*   Node.js v18+ atau v20+
*   PostgreSQL v14+
*   npm atau yarn

### Langkah-langkah Run Lokal

1. **Clone repository & masuk ke direktori project:**
    ```bash
    git clone https://github.com/bangaanini/trade.git
    cd trade
    ```

2. **Install dependensi Node.js:**
    ```bash
    npm install
    ```

3. **Buat file `.env` di root direktori:**
    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=your_postgres_password
    DB_NAME=trading2

    JWT_SECRET=SUPER_SECRET_KEY_CHANGE_THIS
    NEXTAUTH_SECRET=your-random-secret-here
    NEXTAUTH_URL=http://localhost:3000

    # Email OTP Configuration (Gmail App Password)
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-16-char-app-password

    # Cloudflare R2 Storage Configuration (Opsional)
    R2_ACCOUNT_ID=
    R2_ACCESS_KEY_ID=
    R2_SECRET_ACCESS_KEY=
    R2_BUCKET_NAME=
    R2_PUBLIC_URL=
    ```

4. **Setup Database PostgreSQL:**
    ```bash
    # Masuk ke PostgreSQL CLI
    psql -U postgres

    # Buat database
    CREATE DATABASE trading2;
    \q

    # Import schema database
    psql -U postgres -d trading2 -f database.sql
    ```

5. **Jalankan aplikasi (Development Mode):**
    ```bash
    # Terminal 1: Next.js Web App
    npm run dev

    # Terminal 2: Trading Background Worker (Settlement & Price Feed)
    npm run worker
    ```

    Aplikasi dapat diakses melalui browser di `http://localhost:3000`.

---

## 4. Panduan Deployment Lengkap ke VPS (Production)

Berikut panduan langkah demi langkah (dari 0) untuk mendepoy aplikasi pada VPS Ubuntu 20.04 / 22.04 LTS.

### 1️⃣ Persiapan VPS & Update System

```bash
# Login ke VPS via SSH
ssh root@YOUR_VPS_IP

# Update package manager
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Install Node.js, PostgreSQL, Nginx, & PM2

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify instalasi Node.js & npm
node -v
npm -v

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2 secara global
sudo npm install -g pm2 tsx
```

### 3️⃣ Konfigurasi Database PostgreSQL di VPS

```bash
# Masuk ke psql sebagai user postgres
sudo -u postgres psql

# Di dalam prompt psql, jalankan SQL berikut:
CREATE USER trader2 WITH ENCRYPTED PASSWORD 'Rahasia25@';
CREATE DATABASE trading2 OWNER trader2;
GRANT ALL PRIVILEGES ON DATABASE trading2 TO trader2;
\q
```

### 4️⃣ Deploy Code & Setup Environment

```bash
# Buat direktori project di VPS
mkdir -p /var/www/trade
cd /var/www/trade

# Clone repository (atau upload file via SCP / SFTP)
git clone https://github.com/bangaanini/trade.git .

# Install dependensi project
npm install

# Buat file .env di VPS
nano .env
```

**Isi file `.env` di VPS:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=trader2
DB_PASSWORD=Rahasia25@
DB_NAME=trading2

JWT_SECRET=SUPER_SECRET_KEY_PRODUCTION_998877
NEXTAUTH_SECRET=PRODUCTION_SECRET_KEY_12345
NEXTAUTH_URL=https://demo2.tradefreedoms.com

EMAIL_USER=tradefreedoms@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

DATABASE_URL=postgresql://trader2:Rahasia25@@localhost:5432/trading2

# Cloudflare R2 Storage (Opsional)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

### 5️⃣ Import Database Schema & Data

```bash
# Import schema / backup database
psql -h localhost -U trader2 -d trading2 -f database.sql
```

### 6️⃣ Build Project Next.js & Jalankan PM2

```bash
# Build produksi Next.js
npm run build

# Buat folder upload lokal (permission 755)
mkdir -p public/uploads/kyc public/uploads/proofs
chmod -R 755 public/uploads

# Jalankan PM2 menggunakan ecosystem.config.js
pm2 start ecosystem.config.js

# Simpan status PM2 agar otomatis berjalan saat VPS restart
pm2 save
pm2 startup
```

File `ecosystem.config.js` di dalam project sudah mengonfigurasi 2 aplikasi:
1. `trade-freedom` (Next.js web app di port 3008)
2. `trade-worker` (Background Worker settlement & price feed)

```javascript
module.exports = {
  apps: [
    {
      name: "trade-freedom",
      script: "node_modules/.bin/next",
      args: "start -p 3008",
      cwd: "/var/www/trade",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
    },
    {
      name: "trade-worker",
      script: "node_modules/.bin/tsx",
      args: "worker/index.ts",
      cwd: "/var/www/trade",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### 7️⃣ Konfigurasi Nginx & SSL Certbot

1. **Buat file konfigurasi Nginx:**
    ```bash
    sudo nano /etc/nginx/sites-available/tradefreedom
    ```

2. **Isikan konfigurasi Nginx berikut:**
    ```nginx
    server {
        listen 80;
        server_name demo2.tradefreedoms.com;

        # Maksimal ukuran upload file (KYC, Deposit Proof)
        client_max_body_size 20M;

        location / {
            proxy_pass http://localhost:3008;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeout Settings
            proxy_connect_timeout 600;
            proxy_send_timeout 600;
            proxy_read_timeout 600;
        }

        # Route Proxy Gambar Upload
        location /uploads/ {
            proxy_pass http://localhost:3008/api/uploads/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

3. **Aktifkan konfigurasi Nginx & Install SSL Certbot:**
    ```bash
    # Enable site
    sudo ln -s /etc/nginx/sites-available/tradefreedom /etc/nginx/sites-enabled/

    # Test sintaks Nginx
    sudo nginx -t

    # Reload Nginx
    sudo systemctl reload nginx

    # Install Certbot untuk SSL gratis Let's Encrypt
    sudo apt install certbot python3-certbot-nginx -y

    # Obtain & Install SSL Certificate
    sudo certbot --nginx -d demo2.tradefreedoms.com
    ```

---

## 5. Konfigurasi Cloudflare R2 Storage

Untuk memastikan seluruh gambar (Foto KTP KYC, Bukti Transfer Deposit, Logo, Banner Hero, Slider Mobile, QR Code Deposit) tidak membebankan penyimpanan lokal VPS dan tidak hilang saat redeploy/rebuild, aplikasi mendukung integrasi langsung dengan **Cloudflare R2 Object Storage**.

### Cara Mengaktifkan Cloudflare R2:

1. **Buat Bucket di Cloudflare R2:**
   * Login ke Cloudflare Dashboard → R2 Object Storage.
   * Klik **Create Bucket** → Namai bucket (misal: `trade-freedom-uploads`).
   * (Opsional) Aktifkan **Custom Domain** atau **R2.dev Subdomain** untuk akses public URL.

2. **Buat API Tokens (Access Keys):**
   * Di R2 Dashboard → Account Data API Tokens → Klik **Create API Token**.
   * Pilih permission **Admin Read & Write**.
   * Salin **Access Key ID**, **Secret Access Key**, dan **Account ID**.

3. **Tambahkan ke File `.env` di VPS:**
   ```env
   R2_ACCOUNT_ID=8f7e6d5c4b3a21...
   R2_ACCESS_KEY_ID=1a2b3c4d5e6f...
   R2_SECRET_ACCESS_KEY=9z8y7x6w5v...
   R2_BUCKET_NAME=trade-freedom-uploads
   R2_PUBLIC_URL=https://pub-xxx.r2.dev # atau domain CDN khusus Anda
   ```

4. **Restart Aplikasi via PM2:**
   ```bash
   pm2 restart trade-freedom
   ```

> 💡 **Sistem Hybrid Dynamic Proxy:**
> Aplikasi menggunakan helper `lib/upload.ts` dan route `/api/uploads/[...path]/route.ts`. 
> Jika R2 dikonfigurasi, file otomatis diunggah dan dibaca dari Cloudflare R2. Jika R2 belum dikonfigurasi, sistem otomatis menggunakan penyimpanan lokal `public/uploads/` tanpa merusak fungsionalitas aplikasi.

---

## 6. Konfigurasi Service & Layanan Tambahan

### ✉️ Email OTP (Gmail App Password)
Pendaftaran pengguna menggunakan OTP 6-digit yang dikirim via email.

1. Buka Akun Google: `https://myaccount.google.com/`
2. Masuk ke **Security** → Aktifkan **2-Step Verification**.
3. Di bagian bawah, pilih **App passwords**.
4. Buat App Password baru dengan nama **Trading Platform**.
5. Salin 16 karakter kode yang diberikan dan masukkan ke `.env`:
   ```env
   EMAIL_USER=emailanda@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### 💬 Live Chat Support (Tawk.to)
Untuk mengaktifkan widget Live Support di pojok kanan bawah & tombol bantuan mobile:

1. Daftar akun di `https://www.tawk.to/`.
2. Dapatkan Property ID & Widget ID dari kode script Tawk.to:
   `https://embed.tawk.to/PROPERTY_ID/WIDGET_ID`
3. Buka file `components/TawkToChat.tsx` dan perbarui ID sesuai akun Tawk.to Anda.

---

## 7. Panduan Backup & Restore Database

### Automatic Backup Script
Di dalam project telah disediakan script `backup-database.sh` dan `restore-database.sh`.

#### Cara Membuat Backup Database:
```bash
cd /var/www/trade
chmod +x backup-database.sh
./backup-database.sh
```
File backup akan otomatis tersimpan di folder `backups/backup-YYYY-MM-DD-HHMMSS.sql`.

#### Cara Restore Database dari File Backup:
```bash
cd /var/www/trade
chmod +x restore-database.sh
./restore-database.sh backups/backup-2026-01-07-070402.sql
```

---

## 8. Panduan Pengujian (Testing)

Project ini dilengkapi dengan **TestSprite Integration** untuk pengujian otomatis ujung-ke-ujung (*End-to-End Testing*) pada backend API dan frontend UI.

### Menjalankan Testing Otomatis dengan TestSprite CLI

```bash
# 1. Jalankan pengujian penuh Backend API (Auth, Wallet, Option, Admin, Spot)
testsprite test create --project <BACKEND_PROJECT_ID> --type backend --name "Full API Audit" --code-file .testsprite/tests/backend_full.py --run --wait

# 2. Jalankan pengujian Frontend UI (Public Pages, Trading, Admin Panel)
testsprite test create --project <FRONTEND_PROJECT_ID> --type frontend --name "Public Pages" --plan-from .testsprite/plans/public_pages.json --run --wait
```

### Perintah Penting PM2 untuk Server Management

| Perintah PM2 | Fungsi |
|---|---|
| `pm2 list` | Melihat daftar status semua aplikasi (app & worker) |
| `pm2 logs trade-freedom` | Melihat log realtime aplikasi Next.js |
| `pm2 logs trade-worker` | Melihat log realtime settlement worker & harga Binance |
| `pm2 restart all` | Merestart seluruh aplikasi dan worker |
| `pm2 stop all` | Memberhentikan seluruh aplikasi |

---
*Dokumentasi ini diperbarui secara berkala sesuai perkembangan codebase Trade Freedom.*
