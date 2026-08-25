# Admin Panel Phase 2 - Deployment Guide

## 🎉 **Implementation Complete!**

Your admin panel for SEO & Content Management is ready to deploy!

---

## 📦 **What Was Built**

### **Backend (100% Complete):**

1. ✅ Database schema (3 tables)
2. ✅ Seed data with current content
3. ✅ Settings library (`lib/settings.ts`)
4. ✅ API endpoints (get, update, upload)

### **Admin UI (100% Complete):**

1. ✅ Settings dashboard (`/admin/settings`)
2. ✅ SEO settings page (`/admin/settings/seo`)
3. ✅ Content editor (`/admin/settings/content`)
4. ✅ Image manager (`/admin/settings/images`)

---

## 🚀 **Deployment Steps**

### **Step 1: Install Dependencies**

```bash
# Install react-hot-toast for notifications
npm install react-hot-toast
```

### **Step 2: Backup Database**

```bash
# On VPS
cd /var/www/trade
./backup-database.sh
```

### **Step 3: Run Migrations**

```bash
# On VPS
cd /var/www/trade

# Create tables
psql -U trader -d trading -f migrations/create_admin_settings.sql

# Seed default data
psql -U trader -d trading -f migrations/seed_admin_settings.sql
```

### **Step 4: Deploy Code**

```bash
# Local machine - push to git
git add .
git commit -m "Add admin panel for SEO and content management"
git push origin main

# On VPS - pull and rebuild
cd /var/www/trade
git pull origin main
rm -rf .next
npm install
npm run build
pm2 restart bn-app
```

### **Step 5: Create Upload Directory**

```bash
# On VPS
cd /var/www/trade
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## 🧪 **Testing Checklist**

### **1. Database Verification**

```bash
# Check tables created
psql -U trader -d trading -c "\dt"

# Should see:
# - site_settings
# - uploaded_images
# - settings_history

# Check seed data
psql -U trader -d trading -c "SELECT COUNT(*) FROM site_settings;"
# Should return 30+ rows
```

### **2. API Endpoints**

**Test GET:**

```bash
curl https://tools24.online/api/admin/settings
```

Should return JSON with settings and images.

### **3. Admin Pages**

Visit in browser:

- https://tools24.online/admin/settings ✅
- https://tools24.online/admin/settings/seo ✅
- https://tools24.online/admin/settings/content ✅
- https://tools24.online/admin/settings/images ✅

### **4. Functionality Tests**

**SEO Settings:**

1. Edit site title
2. Add keyword
3. Save changes
4. Verify saved (refresh page)

**Content Editor:**

1. Go to "Journey Start" tab
2. Edit card title
3. Save changes
4. Check homepage shows new text

**Image Manager:**

1. Upload hero background
2. Check preview appears
3. Visit homepage
4. Verify new image shows

---

## 🔐 **Access Control**

Admin pages require:

- Logged in user
- Role = 'admin'

**To make a user admin:**

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📝 **How to Use**

### **Update SEO:**

1. Go to `/admin/settings/seo`
2. Edit fields (title, description, keywords)
3. See live preview on right
4. Click "Save Changes"
5. Changes are instant!

### **Edit Content:**

1. Go to `/admin/settings/content`
2. Choose tab (Company, Journey, Leading)
3. Edit text fields
4. Click "Save Changes"
5. Refresh homepage to see changes

### **Upload Images:**

1. Go to `/admin/settings/images`
2. Click "Upload" button
3. Select image (max 5MB)
4. Wait for upload
5. Image updates automatically

---

## 🐛 **Troubleshooting**

### **Error: "Unauthorized"**

- Check if logged in
- Verify user role is 'admin'
- Check session/cookies

### **Images Not Uploading**

- Check upload directory exists: `/public/uploads`
- Check permissions: `chmod 755 public/uploads`
- Verify file size < 5MB
- Check file format (JPEG, PNG, WebP only)

### **Settings Not Saving**

- Check database connection
- Check migrations ran successfully
- Check browser console for errors
- Check PM2 logs: `pm2 logs bn-app`

### **Content Not Updating on Homepage**

- **Note:** Frontend components still hardcoded!
- Need to update components to read from database
- This is Phase 2B (next step)

---

## ⚠️ **Important Notes**

### **Frontend Integration Required**

The admin panel saves to database, but components still show hardcoded content!

**Components that need updating:**

1. `components/sections/CompanyIntro.tsx`
2. `components/sections/JourneyStart.tsx`
3. `components/sections/LeadingPlatform.tsx`
4. `components/Hero.tsx`
5. `components/mobile/MobileHeroSlider.tsx`

**This requires:**

- Making components async server components
- Fetching from `getSetting()` function
- Displaying dynamic content

**Estimated time:** 2-3 hours

**Do you want me to do this now?** Or deploy and test admin panel first?

---

## 📊 **File Structure**

```
/migrations
  ├── create_admin_settings.sql  # Database schema
  └── seed_admin_settings.sql    # Default data

/lib
  └── settings.ts                # CRUD functions

/app/api/admin/settings
  ├── route.ts                   # GET all settings
  ├── update/route.ts            # POST update
  └── upload/route.ts            # POST image upload

/app/admin/settings
  ├── page.tsx                   # Dashboard
  ├── seo/page.tsx              # SEO settings
  ├── content/page.tsx          # Content editor
  └── images/page.tsx           # Image manager
```

---

## 🎯 **Next Steps**

**Option A:** Deploy now, test admin panel, then do frontend integration

**Option B:** Complete frontend integration first, then deploy everything

**Which do you prefer?** 🚀

---

## 📞 **Support**

**Admin Panel Features:**

- ✅ SEO management
- ✅ Content editing
- ✅ Image uploads
- ✅ Live preview
- ✅ Change history
- ✅ Validation

**Still TODO:**

- ⏳ Frontend integration (components read from DB)
- ⏳ Auto-save drafts
- ⏳ Revert changes feature

---

## 🎉 **Success!**

You now have a professional admin panel for managing your site!

**Deploy and test, then let me know if you want frontend integration!** 🚀
