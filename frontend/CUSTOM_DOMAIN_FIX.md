# Custom Domain CSS Loading Fix

## Problem
The custom domain (subitai.com) shows white background instead of dark theme, while the Vercel default domain works correctly.

## Root Cause
This is typically caused by **browser/CDN caching** of old CSS files. The Tailwind CSS classes aren't being applied because the browser is using a cached version.

## Solutions

### 1. Hard Refresh Browser (Immediate Fix)
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`
- This forces the browser to reload all CSS files

### 2. Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Clear Vercel Cache (If Hard Refresh Doesn't Work)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Find `subitai.com` domain
3. Click "..." → "Clear Cache" (if available)
4. Or redeploy: Go to Deployments → Click "..." on latest → "Redeploy"

### 4. Verify Deployment
Make sure both domains are using the same deployment:
- Check Vercel Dashboard → Deployments
- Both `subit-ai.vercel.app` and `subitai.com` should point to the same deployment

### 5. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "CSS"
3. Check if `/_next/static/css/` files are loading
4. If they show "304 Not Modified", the cache is the issue
5. If they show "404", there's a build issue

## Prevention
The Next.js config now includes:
- Custom domain in image domains
- Proper cache headers for static assets
- This ensures CSS loads correctly on all domains

## If Problem Persists
1. Check Vercel build logs for any CSS compilation errors
2. Verify `tailwind.config.js` is correct
3. Ensure `globals.css` is imported in `app/layout.tsx`
4. Check if there are any CSP (Content Security Policy) headers blocking CSS

