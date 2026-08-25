# Testing Theme Switching

## Steps to Test:

### 1. **Hard Refresh Browser**

```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

### 2. **Clear Browser Cache**

Or open in **Incognito/Private Window**

### 3. **Check HTML Class**

Open DevTools Console and run:

```javascript
document.documentElement.classList.contains("dark");
```

Should return `true` in dark mode, `false` in light mode.

### 4. **Toggle Theme**

Click theme switcher and see if `dark` class is added/removed from `<html>` tag.

### 5. **Verify CSS Variables**

In DevTools, inspect any section element and check **Computed** tab:

- `background-color` should change when toggling theme
- Check if it's using the CSS variable `var(--background)`

## If Still Not Working:

### Check if server is running latest code:

```bash
# Kill old dev server
pkill -f "next dev"

# Start fresh
npm run dev
```

### Verify Tailwind is reading theme:

```bash
# Check if Tailwind config exists
ls -la tailwind.config.*

# If not, Next.js 15 uses @tailwindcss in CSS directly
# Your setup is correct in globals.css
```

## Expected Behavior:

✅ **Light Mode:**

- Background: `#fafafa` (light gray)
- Text: `#1e2329` (dark)
- Cards: `#ffffff` (white)

✅ **Dark Mode:**

- Background: `#181a20` (dark)
- Text: `#eaecef` (light)
- Cards: `#1e2329` (darker gray)

## If Problem Persists:

The issue might be:

1. **Browser cache** - Try different browser
2. **Next.js cache** - Delete `.next` folder and rebuild
3. **Component not re-rendering** - Check if Providers component is wrapping everything

## Quick Fix Commands:

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run dev

# Or force production build
npm run build
npm start
```
