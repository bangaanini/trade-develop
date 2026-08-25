# Database Backup & Migration Guide

## ✅ Backup Berhasil Dibuat!

Backup database lengkap sudah tersimpan di folder `backups/`

---

## 📋 Cara Deploy ke VPS

### 1. **Upload Backup ke VPS**

```bash
# Ganti dengan IP VPS Anda
scp backups/backup-*.sql root@YOUR_VPS_IP:/root/bn/backups/
```

**Alternative - Compress dulu untuk upload lebih cepat:**

```bash
# Compress backup
gzip backups/backup-*.sql

# Upload (lebih kecil)
scp backups/backup-*.sql.gz root@YOUR_VPS_IP:/root/bn/backups/

# Di VPS, decompress:
gunzip backups/backup-*.sql.gz
```

---

### 2. **Setup Database di VPS**

```bash
# Login ke VPS
ssh root@YOUR_VPS_IP

# Install PostgreSQL (jika belum)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user dan database
sudo -u postgres psql

# Dalam psql CLI:
CREATE USER trader2 WITH PASSWORD 'Rahasia25@';
CREATE DATABASE trading2 OWNER trader2;
GRANT ALL PRIVILEGES ON DATABASE trading2 TO trader2;
\q
```

---

### 3. **Create .env di VPS**

```bash
cd /root/bn  # atau folder project Anda

# Create .env
nano .env
```

**Isi .env di VPS:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=trader2
DB_PASSWORD=Rahasia25@
DB_NAME=trading2

# Tambahkan juga config lainnya
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-domain.com
```

---

### 4. **Restore Database di VPS**

```bash
cd /root/bn

# Jalankan restore script
chmod +x restore-database.sh
./restore-database.sh backups/backup-2026-01-07-070402.sql

# Atau manual:
PGPASSWORD="Rahasia25@" psql -h localhost -U trader2 -d trading2 -f backups/backup-2026-01-07-070402.sql
```

**Output jika berhasil:**

```
✓ Database restored successfully!
```

---

### 5. **Verify Data**

```bash
# Check tables
psql -h localhost -U trader -d trading -c "\dt"

# Check user count
psql -h localhost -U trader -d trading -c "SELECT COUNT(*) FROM users;"

# Check wallet data
psql -h localhost -U trader -d trading -c "SELECT * FROM wallets LIMIT 5;"
```

---

### 6. **Install Dependencies & Build**

```bash
cd /root/bn

# Install Node.js (jika belum)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Build production
npm run build
```

---

### 7. **Start Application dengan PM2**

```bash
# Install PM2
npm install -g pm2

# Start Web App
PORT=3008 pm2 start npm --name "demo2" -- start
PORT=3008 pm2 start npm --name "worker2" -- run worker

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
# Copy-paste command yang muncul, lalu run

# Check status
pm2 status
pm2 logs
```

---

### 8. **Apply Copy/Paste Migrations**

Jika ada update schema database (seperti penambahan kolom `visible_password`), Anda bisa menjalankannya langsung di VPS tanpa perlu restore ulang database.

**Cara Menjalankan Migration di VPS:**

1.  **Copy isi file migration** dari local (`migrations/add_visible_password.sql`).
2.  **Login ke VPS:**
    ```bash
    ssh root@YOUR_VPS_IP
    ```
3.  **Masuk ke PSQL CLI:**
    ```bash
    # Ganti 'trading' dengan nama database Anda jika berbeda
    psql -h localhost -U trader -d trading
    ```
4.  **Paste query migration:**
    ```sql
    ALTER TABLE users ADD COLUMN IF NOT EXISTS visible_password VARCHAR(255);
    ```
5.  **Exit:**
    ```sql
    \q
    ```

---

## 🔒 Security Checklist

- [ ] Gunakan password database yang kuat
- [ ] Setup firewall (ufw)
- [ ] Setup Nginx reverse proxy
- [ ] Setup SSL certificate (Let's Encrypt)
- [ ] Non-root user untuk aplikasi
- [ ] Regular backup schedule

---

## 📊 Monitoring di VPS

```bash
# CPU & RAM usage
htop

# Worker logs
pm2 logs worker --lines 50

# Web app logs
pm2 logs next-app --lines 50

# Database connections
psql -h localhost -U trader -d trading -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## ❓ Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
sudo -u postgres psql -l | grep trading

# Check user permissions
sudo -u postgres psql -c "\du"
```

### Worker Not Starting

```bash
# Check logs
pm2 logs worker

# Check Binance WebSocket connection
# Should see: "✅ Binance WS connected"

# Restart worker
pm2 restart worker
```

### Web App 502 Error

```bash
# Check app is running
pm2 list

# Check logs
pm2 logs next-app

# Restart app
pm2 restart next-app
```

---

## ✅ Deployment Checklist

- [ ] PostgreSQL installed & running
- [ ] Database created (trading)
- [ ] User created (trader)
- [ ] Backup restored successfully
- [ ] .env configured
- [ ] Dependencies installed (npm install)
- [ ] Production build (npm run build)
- [ ] Web app started (PM2)
- [ ] Worker started (PM2)
- [ ] PM2 saved & startup configured
- [ ] All data verified (users, wallets, etc)
- [ ] WebSocket connected to Binance
- [ ] Settlement worker running (10s interval)

---

**Selamat! Database Anda siap untuk production!** 🚀
