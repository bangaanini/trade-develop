# Trade Freedom - Crypto & Binary Option Trading Platform

Trade Freedom adalah platform perdagangan cryptocurrency modern yang mendukung **Spot Trading**, **Binary Option Trading**, sistem dompet multi-currency, penyetoran deposit USDT dengan verifikasi bukti transfer, penarikan saldo, inter-wallet transfer, swap crypto, verifikasi KYC, serta sistem Admin Panel lengkap dengan kontrol winrate pengguna secara realtime.

---

## 📖 Dokumentasi Utama

Dokumentasi lengkap dan panduan teknis yang menggabungkan seluruh instruksi project dapat dibaca pada file **`DOCUMENTATION.md`**:

👉 **[Buka Dokumentasi Utama (`DOCUMENTATION.md`)](./DOCUMENTATION.md)**

### Isi Dokumentasi Utama (`DOCUMENTATION.md`):
1. **Ringkasan & Arsitektur Project** (Tech Stack, Struktur Folder, Backend Worker)
2. **Peta Halaman & Fitur Aplikasi** (Public Pages, Trading Pages, Wallet & Admin Panel)
3. **Panduan Instalasi & Jalankan di Lokal (Development)**
4. **Panduan Deployment Lengkap ke VPS (Production)** (PostgreSQL, Node.js, PM2, Nginx, SSL Certbot)
5. **Konfigurasi Cloudflare R2 Storage** (Hybrid Object Storage S3 API)
6. **Konfigurasi Service & Layanan Tambahan** (Email OTP Gmail App Password, Live Chat Tawk.to)
7. **Panduan Backup & Restore Database PostgreSQL**
8. **Panduan Pengujian (Testing)** (TestSprite Integration & PM2 Commands)

---

## 🚀 Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Setup .env file
cp .env.example .env # Sesuaikan DB & Secret Key

# 3. Import database schema
psql -U postgres -d trading2 -f database.sql

# 4. Run development web server
npm run dev

# 5. Run trading background worker (di terminal terpisah)
npm run worker
```

Situs web akan berjalan di `http://localhost:3000`.
