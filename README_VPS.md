# VPS Deployment Guide

This guide explains how to deploy the BN Project to a Virtual Private Server (VPS) running Ubuntu 20.04/22.04.

## 1. Prerequisites

Connect to your VPS via SSH:

```bash
ssh user@your-vps-ip
```

Update your system:

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Dependencies

### Node.js (v18+)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Verify version
```

### PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Nginx (Web Server)

```bash
sudo apt install nginx -y
```

### PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 3. Database Setup

1. Login to Postgres:

```bash
sudo -u postgres psql
```

2. Create Database and User:

```sql
CREATE DATABASE trading;
CREATE USER trader WITH ENCRYPTED PASSWORD 'Rahasia25@';
GRANT ALL PRIVILEGES ON DATABASE trading TO trader;
\q
```

3. Import Schema:
   Upload the `database.sql` file to your server (e.g., via SCP or SFTP), then run:

```bash
psql -U trader -d trading -f database.sql
```

(Enter password when prompted)

## 4. Project Setup

1. Clone or upload your project files to `/var/www/bn`:

```bash
git clone https://github.com/bangaanini/trade.git /var/www/trade
# OR upload files directly
```

2. Install Dependencies:

```bash
cd /var/www/trade
npm install
```

3. Environment Variables:
   Create a `.env` file:

```bash
nano .env
```

Paste your configuration (update DATABASE_URL):

```env
DATABASE_URL=postgresql://bnuser:security_password@localhost:5432/bndb
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://your-domain.com
# Add other variables from your local .env
```

4. Build the Project:

```bash
npm run build
```

## 5. Running with PM2

Start the application:

```bash
pm2 start npm --name "bn-app" -- start
```

Start the background worker (if you have one, references found in package.json):

```bash
pm2 start npm --name "bn-worker" -- run worker
```

Save PM2 list so it restarts on reboot:

```bash
pm2 save
pm2 startup
```

## 6. Firewall Configuration

⚠️ **PENTING:** Buka port yang diperlukan di firewall VPS!

### Check if UFW is active:

```bash
sudo ufw status
```

### Configure firewall:

```bash
# Allow SSH (JANGAN LUPA INI!)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow direct access to port 3000 (for testing)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status numbered
```

**Expected output:**

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
3000/tcp                   ALLOW       Anywhere
```

---

## 7. Nginx Configuration

### Option A: Access via IP Address (Tanpa Domain)

Create config file:

```bash
sudo nano /etc/nginx/sites-available/bn-app
```

Add this configuration (replace `YOUR_VPS_IP` with actual IP):

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP _;

    # Client body size (untuk upload file KYC)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (Next.js)
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### Option B: Access via Domain Name

If you have a domain (e.g., `trading.example.com`):

```nginx
server {
    listen 80;
    server_name trading.example.com www.trading.example.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Nginx config:

```bash
# Remove default config (optional)
sudo rm /etc/nginx/sites-enabled/default

# Enable your config
sudo ln -s /etc/nginx/sites-available/bn-app /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# If test OK, restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

---

## 8. SSL Certificate (HTTPS) - Optional

⚠️ **Only if you have a domain name!**

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 9. Troubleshooting "Situs Tidak Dapat Dijangkau"

### Problem: IP:3000 tidak bisa diakses dari laptop/HP

#### ✅ Solution 1: Check Firewall

```bash
# Check if port 3000 is open
sudo ufw status | grep 3000

# If not listed, open it:
sudo ufw allow 3000/tcp
```

#### ✅ Solution 2: Bind Next.js to 0.0.0.0 (not 127.0.0.1)

**Dev mode:**

```bash
# Stop PM2 if running
pm2 stop all

# Run with explicit host binding
HOST=0.0.0.0 PORT=3000 npm run dev
```

**Or update package.json:**

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0 -p 3000"
  }
}
```

#### ✅ Solution 3: Use Nginx (RECOMMENDED for Production)

**Why?**

- ✅ Don't need to open port 3000
- ✅ Run on standard HTTP port 80
- ✅ Can add SSL easily
- ✅ Better performance

**Steps:**

1. Make sure Next.js is running on localhost:3000
2. Configure Nginx (see section 7 above)
3. Access via `http://YOUR_VPS_IP` (no port needed!)

#### ✅ Solution 4: Check if App is Actually Running

```bash
# Check PM2 status
pm2 status

# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000
# Or:
sudo lsof -i :3000

# Check application logs
pm2 logs bn-app
```

#### ✅ Solution 5: Test Connection from VPS itself

```bash
# Test from VPS
curl http://localhost:3000

# If this works but external access doesn't:
# → Problem is firewall or network config

# If this doesn't work:
# → Problem is with the application
```

---

## 10. Verification Checklist

### ✅ After deployment, verify:

**1. Database:**

```bash
psql -U trader -d trading -c "SELECT COUNT(*) FROM users;"
```

**2. Application is running:**

```bash
pm2 status
# Should show: bn-app (online)
```

**3. Port is listening:**

```bash
sudo netstat -tulpn | grep 3000
# Should show: tcp 0.0.0.0:3000 LISTEN
```

**4. Firewall allows traffic:**

```bash
sudo ufw status | grep -E "80|443|3000"
```

**5. Nginx is running:**

```bash
sudo systemctl status nginx
# Should show: active (running)
```

**6. Test from browser:**

```
http://YOUR_VPS_IP         (via Nginx)
http://YOUR_VPS_IP:3000    (direct access)
```

---

## 11. Common Access Patterns

### Development (with firewall):

```
User → http://VPS_IP:3000 → Next.js Dev Server
     ↑
  Port 3000 must be open in firewall
```

### Production (with Nginx):

```
User → http://VPS_IP:80 → Nginx → http://localhost:3000 → Next.js
     ↑                                                      ↑
  Port 80 open                                    No need to open 3000
```

---

## 12. Quick Start Commands

### Start Everything:

```bash
cd /var/www/bn

# Start app
pm2 start npm --name "bn-app" -- start

# Start worker
pm2 start npm --name "bn-worker" -- run worker

# Start Nginx
sudo systemctl start nginx

# Check status
pm2 status
sudo systemctl status nginx
```

### Stop Everything:

```bash
pm2 stop all
sudo systemctl stop nginx
```

### View Logs:

```bash
# App logs
pm2 logs bn-app

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 13. Production Deployment Checklist

- [ ] Database created and imported
- [ ] `.env` file configured with production values
- [ ] `npm run build` executed successfully
- [ ] PM2 running both app and worker
- [ ] PM2 startup configured (`pm2 startup` + `pm2 save`)
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Nginx installed and configured
- [ ] Nginx config tested (`nginx -t`)
- [ ] Site accessible from external browser
- [ ] SSL certificate installed (if using domain)
- [ ] Email OTP working (Gmail App Password in .env)
- [ ] Tawk.to chat widget working

Your site should now be live! 🎉
