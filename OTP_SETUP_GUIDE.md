# OTP Email Registration - Setup Guide

## ✅ Implementation Complete!

All files have been created for Email OTP registration system.

---

## 📧 Email Configuration (Required)

Add these variables to your `.env` file:

```env
# Email Configuration for OTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### **How to Get Gmail App Password:**

1. Go to Google Account: https://myaccount.google.com/
2. Click "Security" → "2-Step Verification" (enable if not enabled)
3. Scroll down → "App passwords"
4. Select app: "Mail" | Device: "Other" → Name it "Trading Platform"
5. Copy the 16-character password
6. Paste it in `.env` as `EMAIL_PASSWORD`

> ⚠️ **Important:** Use App Password, NOT your regular Gmail password!

---

## 🗄️ Database Setup

Run the migration to create `email_verifications` table:

```bash
# Option 1: Using psql
psql postgresql://trader:YOUR_PASSWORD@localhost:5432/trading -f migrations/create_email_verifications.sql

# Option 2: Using your existing database connection
psql -h localhost -U trader -d trading -f migrations/create_email_verifications.sql
```

**Or manually:**

```sql
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
```

---

## 🚀 Testing the OTP Flow

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Open register page:**

   ```
   http://localhost:3000/register
   ```

3. **Test registration:**
   - Enter your email and password (min 6 characters)
   - Click "Send OTP to Email"
   - Check your email inbox for OTP code
   - Enter the 6-digit OTP
   - Click "Verify & Register"
   - Should redirect to login page!

---

## 🔧 Files Created

### **Database:**

- ✅ `migrations/create_email_verifications.sql` - OTP table migration

### **Backend:**

- ✅ `lib/email.ts` - Email service (Nodemailer)
- ✅ `app/api/auth/register/send-otp/route.ts` - Send OTP API
- ✅ `app/api/auth/register/verify-otp/route.ts` - Verify OTP API

### **Frontend:**

- ✅ `app/register/page.tsx` - Updated 2-step registration UI

---

## 🎨 Features Implemented

✅ **2-Step Verification Flow**

- Step 1: Email & Password → Send OTP
- Step 2: Enter OTP → Verify & Create Account

✅ **Security Features**

- OTP expires in 5 minutes
- Max 3 verification attempts per OTP
- Rate limiting: Max 3 OTP requests per hour per email
- Password hashing with bcrypt
- Email validation
- Duplicate user check

✅ **User Experience**

- Loading states with spinners
- Countdown timer (5:00 → 0:00)
- Resend OTP button (after countdown)
- Error messages with attempt counter
- Responsive design
- Enter key support

✅ **Email Templates**

- Professional OTP email with HTML styling
- Welcome email after successful registration

---

## 🧪 Test Cases

### **1. Valid Registration:**

- ✅ Email: `test@gmail.com`, Password: `123456`
- ✅ Receive OTP in email
- ✅ Enter correct OTP → Success

### **2. Invalid OTP:**

- ❌ Enter wrong OTP → Show error + remaining attempts
- ✅ After 3 wrong attempts → Must request new OTP

### **3. Expired OTP:**

- ⏱️ Wait 5+ minutes without entering OTP
- ❌ Try to verify → "OTP expired" error
- ✅ Click "Resend OTP" → New OTP sent

### **4. Duplicate Email:**

- ❌ Try to register with existing email → Error message

### **5. Rate Limiting:**

- ❌ Request OTP 4+ times in 1 hour → "Too many requests" error

---

## 📝 Environment Variables Checklist

Make sure your `.env` has:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=trader
DB_PASSWORD=xxxxxxxx
DB_NAME=trading

# Email (NEW - Required for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### **1. "Failed to send email" error:**

- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Verify it's **App Password**, not regular password
- Check Gmail 2-Step Verification is enabled
- Check console logs for specific error

### **2. OTP not received:**

- Check spam/junk folder
- Verify email address is correct
- Check console logs for email sending errors
- Try different email provider (not just Gmail)

### **3. Database error:**

- Run migration: `psql ... -f migrations/create_email_verifications.sql`
- Check table exists: `\dt email_verifications`
- Check database connection in `.env`

### **4. "OTP expired" immediately:**

- Check server timezone/time
- Check if `expires_at` column has correct value
- Verify `created_at` is not in the future

---

## 🎉 Success!

OTP Email Registration is now fully functional!

**Next Steps:**

1. Add your Gmail credentials to `.env`
2. Run database migration
3. Restart dev server
4. Test registration flow
5. Deploy to VPS when ready!

---

**For VPS Deployment:**

- Use same `.env` configuration
- Run migration on VPS database
- Ensure email credentials work from VPS
- Consider using SMTP service for production (Sendinblue, Mailgun, etc.)
