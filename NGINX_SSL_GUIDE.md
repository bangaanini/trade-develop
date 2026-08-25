# Nginx & SSL Configuration Guide

Complete guide untuk setup Nginx reverse proxy dan SSL certificate dengan Let's Encrypt untuk Next.js application.

---

## 📋 Prerequisites

- Ubuntu/Debian VPS
- Domain sudah pointing ke IP server
- Next.js app running di port 3000 (atau port lain)
- Root atau sudo access

---

## 1️⃣ Install Nginx

```bash
# Update package list
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Check Nginx status
sudo systemctl status nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## 2️⃣ Configure Firewall

```bash
# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'

# Or allow specific ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

---

## 3️⃣ Create Nginx Configuration

### **Option A: HTTP Only (Testing)**

Create config file:

```bash
sudo nano /etc/nginx/sites-available/tradingapp
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

        # Increase timeouts for slow connections
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Optional: Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Optional: Image optimization
    location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### **Option B: HTTPS with SSL (Production)**

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate paths (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Main proxy configuration
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

        # Increase timeouts
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }

    # Fonts
    location ~* \.(woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

---

## 4️⃣ Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tradingapp /etc/nginx/sites-enabled/

# Remove default config (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 5️⃣ Install SSL Certificate (Let's Encrypt)

### **Install Certbot**

```bash
# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

### **Obtain SSL Certificate**

```bash
# Get certificate (interactive)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Or non-interactive
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email your@email.com
```

**Follow prompts:**

1. Enter email for urgent renewal notices
2. Agree to Terms of Service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### **Auto-renewal**

Certbot automatically creates a cron job. Verify:

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew
```

---

## 6️⃣ Optimized Production Configuration

**Complete production-ready config:**

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Main Server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # SSL Optimization
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Upload limits
    client_max_body_size 10M;
    client_body_buffer_size 128k;

    # Logging
    access_log /var/log/nginx/tradingapp-access.log;
    error_log /var/log/nginx/tradingapp-error.log;

    # Main application
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

        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login endpoint rate limiting (stricter)
    location ~* /api/auth/(login|register) {
        limit_req zone=login_limit burst=3 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files - aggressive caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public assets
    location /uploads {
        alias /var/www/trade/public/uploads;
        add_header Cache-Control "public, max-age=86400";
    }

    # Media files
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|mp4|webm)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=604800";
    }

    # Fonts
    location ~* \.(woff|woff2|ttf|eot|otf)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin "*";
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_min_length 1000;
}
```

---

## 7️⃣ Useful Commands

### **Nginx Management**

```bash
# Start Nginx
sudo systemctl start nginx

# Stop Nginx
sudo systemctl stop nginx

# Restart Nginx
sudo systemctl restart nginx

# Reload config (no downtime)
sudo systemctl reload nginx

# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **SSL Management**

```bash
# Renew certificates
sudo certbot renew

# List certificates
sudo certbot certificates

# Revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/your-domain.com/cert.pem

# Delete certificate
sudo certbot delete --cert-name your-domain.com
```

---

## 8️⃣ Troubleshooting

### **502 Bad Gateway**

**Causes:**

- Next.js app not running
- Wrong port in proxy_pass
- Firewall blocking localhost:3000

**Fix:**

```bash
# Check if app is running
pm2 status

# Check if port 3000 is listening
sudo netstat -tulpn | grep :3000

# Restart app
pm2 restart bn-app

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### **SSL Certificate Errors**

**Certificate not found:**

```bash
# Re-run Certbot
sudo certbot --nginx -d your-domain.com

# Check certificate location
sudo ls -la /etc/letsencrypt/live/
```

**Certificate expired:**

```bash
# Renew manually
sudo certbot renew

# Check auto-renewal
sudo systemctl status certbot.timer
```

### **Nginx won't start**

```bash
# Test config
sudo nginx -t

# Check error
sudo journalctl -u nginx -n 50

# Check if port 80/443 is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 9️⃣ Performance Optimization

### **Enable HTTP/2**

Already enabled with `listen 443 ssl http2;`

### **Increase Worker Processes**

Edit `/etc/nginx/nginx.conf`:

```nginx
worker_processes auto;
worker_connections 1024;
```

### **Enable Caching**

```nginx
# Add to http block in nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

# Add to server block
location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503;
    # ... rest of proxy config
}
```

---

## 🔟 Security Best Practices

### **1. Hide Nginx Version**

Edit `/etc/nginx/nginx.conf`:

```nginx
http {
    server_tokens off;
}
```

### **2. DDoS Protection**

```nginx
# Limit connections per IP
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    limit_conn conn_limit 10;
}
```

### **3. Block Bad Bots**

```nginx
# Block user agents
if ($http_user_agent ~* (bot|crawler|spider|scraper)) {
    return 403;
}
```

### **4. IP Whitelisting (Admin)**

```nginx
location /admin {
    allow 123.456.789.0/24;  # Your IP range
    deny all;

    proxy_pass http://localhost:3000;
}
```

---

## 📝 Quick Setup Checklist

- [ ] Install Nginx
- [ ] Configure firewall (ports 80, 443)
- [ ] Create Nginx config file
- [ ] Enable site configuration
- [ ] Test Nginx config
- [ ] Reload Nginx
- [ ] Install Certbot
- [ ] Obtain SSL certificate
- [ ] Verify auto-renewal
- [ ] Test HTTPS access
- [ ] Monitor logs
- [ ] Set up monitoring/alerts

---

## 🚀 Complete Setup Script

```bash
#!/bin/bash

# Variables
DOMAIN="your-domain.com"
APP_PORT="3000"

# Install Nginx
sudo apt update
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Configure firewall
sudo ufw allow 'Nginx Full'

# Create Nginx config
sudo tee /etc/nginx/sites-available/tradingapp > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/tradingapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

echo "✅ Nginx and SSL setup complete!"
echo "🌐 Visit: https://$DOMAIN"
```

---

## 📞 Support

**Logs Location:**

- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`
- Certbot: `/var/log/letsencrypt/letsencrypt.log`

**Config Location:**

- Nginx: `/etc/nginx/sites-available/`
- SSL: `/etc/letsencrypt/live/your-domain.com/`

---

**Setup complete!** Your Next.js app should now be accessible via HTTPS with automatic SSL renewal! 🎉
