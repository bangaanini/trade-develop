# SEO Management Guide

## 📝 How to Update SEO Settings

Your site now has comprehensive SEO configured through the `/config/site.ts` file.

---

## 🎯 Quick Updates

### Change Site Title/Description

**File:** `/config/site.ts`

```typescript
export const siteConfig = {
  name: "Tools24", // Change this
  title: "Tools24 - Professional Crypto Trading Platform", // And this
  description: "Trade Bitcoin, Ethereum...", // And this
  ...
}
```

### Update Keywords

```typescript
keywords: [
  "crypto trading",
  "bitcoin trading",
  // Add more keywords here
],
```

### Change Contact Email

```typescript
contact: {
  email: "support@tools24.online", // Change this
  supportUrl: "/support",
},
```

### Update Social Media Links

```typescript
social: {
  twitter: "@tools24trading", // Your Twitter
  facebook: "https://facebook.com/yourpage", // Your Facebook
  instagram: "https://instagram.com/yourpage", // Your Instagram
  telegram: "https://t.me/yourchannel", // Your Telegram
},
```

---

## 🌐 Testing Your SEO

### 1. View Source

**Browser:** Right-click → View Page Source

**Look for:**

```html
<title>Tools24 - Professional Crypto Trading Platform</title>
<meta name="description" content="..." />
<meta property="og:title" content="..." />
```

### 2. Google Search Console

1. Go to: https://search.google.com/search-console
2. Add property: `tools24.online`
3. Verify ownership
4. Submit sitemap: `https://tools24.online/sitemap.xml`

### 3. Facebook Debugger

- URL: https://developers.facebook.com/tools/debug/
- Enter: `https://tools24.online`
- Click "Scrape Again"
- Verify Open Graph preview

### 4. Twitter Card Validator

- URL: https://cards-dev.twitter.com/validator
- Enter your URL
- Verify card preview

### 5. Schema Markup Validator

- URL: https://validator.schema.org/
- Enter your URL
- Check for structured data

---

## 🖼️ Updating Images

### Logo

**File:** `/public/logo.png`

- Replace this file
- Recommended size: 512x512px
- Format: PNG with transparency

### Favicon

**Files:**

```
/public/favicon.ico
/public/favicon/favicon-16x16.png
/public/favicon/favicon-32x32.png
/public/favicon/apple-touch-icon.png
```

**Tool:** Use https://realfavicongenerator.net/

1. Upload your logo
2. Download generated package
3. Replace files in `/public/favicon/`

### Open Graph Image

**File:** `/public/og-image.png`

- Size: 1200x630px
- Format: PNG or JPG
- This shows when sharing on social media

---

## 📊 Current SEO Features

### ✅ Implemented

- **Meta Tags:** Title, description, keywords on every page
- **Open Graph:** Facebook/LinkedIn preview
- **Twitter Cards:** Twitter share preview
- **Favicons:** All sizes for different devices
- **Sitemap:** Auto-generated at `/sitemap.xml`
- **Robots.txt:** Search engine instructions at `/robots.txt`
- **JSON-LD:** Structured data for Google rich results
- **Canonical URLs:** Prevent duplicate content
- **Mobile Optimized:** Responsive viewport
- **Semantic HTML:** Proper heading structure

### 📈 SEO Checklist

- [x] Unique title per page
- [x] Meta descriptions (150-160 chars)
- [x] Keywords
- [x] Open Graph tags
- [x] Twitter cards
- [x] Favicons
- [x] Sitemap.xml
- [x] Robots.txt
- [x] JSON-LD structured data
- [x] Canonical URLs
- [x] Mobile responsive
- [x] Fast loading (via Next.js)
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster
- [ ] Get backlinks
- [ ] Regular content updates

---

## 🔄 Future: Admin Panel (Phase 2)

Currently, you edit SEO via `/config/site.ts` file.

**In Phase 2, you'll have:**

- Web UI to edit settings
- Logo upload via browser
- Real-time preview
- Database storage

**To upgrade later:** Just let me know, and I'll build the admin panel!

---

## 💡 SEO Best Practices

### Content

1. **H1 Tag:** One per page (currently: page titles)
2. **Alt Text:** All images have descriptions
3. **Internal Links:** Link between related pages
4. **Fresh Content:** Update regularly

### Technical

1. **Page Speed:** Keep under 3 seconds
2. **Mobile First:** Always test on mobile
3. **HTTPS:** Already enabled via Cloudflare
4. **Clean URLs:** No parameters in URL

### Keywords

1. **Primary:** 1-2 main keywords per page
2. **Secondary:** 3-5 related keywords
3. **Long-tail:** Natural phrases people search
4. **Competition:** Check what competitors use

---

## 📱 Monitoring

### Track These Metrics:

- **Google Search Console:** Impressions, clicks, position
- **Google Analytics:** Traffic sources, bounce rate
- **Page Speed Insights:** Loading time
- **Search Rankings:** Track keyword positions

### Recommended Tools:

- Google Search Console (Free)
- Google Analytics (Free)
- Bing Webmaster Tools (Free)
- Ahrefs or SEMrush (Paid, advanced)

---

## 🆘 Common Issues

### Site Not Appearing in Google

- **Wait:** 2-4 weeks for new sites
- **Submit:** Sitemap to Search Console
- **Check:** `site:tools24.online` in Google

### Wrong Title/Description Showing

- **Clear Cache:** Google cache can be old
- **Request:** Re-index in Search Console
- **Wait:** Can take days to update

### Social Share Wrong Image

- **Clear:** Use Facebook/Twitter debugger
- **Scrape Again:** Force refresh
- **Check:** Image URL is accessible

---

## 📞 Need Help?

**Quick Changes:** Edit `/config/site.ts` directly
**Complex Changes:** Ask me to help implement
**Admin Panel:** Let me know when ready for Phase 2!

---

## 🎉 You're All Set!

Your site now has professional SEO that will:

- ✅ Rank better in Google
- ✅ Look good when shared on social
- ✅ Show rich previews
- ✅ Be easily discoverable

**Next Steps:**

1. Submit sitemap to Google Search Console
2. Share on social media to test
3. Monitor rankings weekly
4. Keep content fresh!

Good luck! 🚀
