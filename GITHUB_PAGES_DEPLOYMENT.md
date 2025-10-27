# GitHub Pages Deployment Guide

## ✅ Configuration Complete

All necessary changes have been made to deploy DojoNet to GitHub Pages with proper SPA routing support.

## 🔧 Changes Made

### 1. **vite.config.js**
- Set `base: '/DojoNet-Prototype-MAX/'` for proper asset paths on GitHub Pages

### 2. **src/main.jsx**
- Added `basename` prop to `BrowserRouter` (uses `/DojoNet-Prototype-MAX` in production)
- Added SPA redirect handling to restore deep-linked URLs

### 3. **index.html**
- Added redirect handler script for SPA routing

### 4. **public/404.html**
- Created 404 fallback page to handle direct deep-link navigation
- Redirects all 404s back to index.html with path preservation

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Configure GitHub Pages deployment with SPA routing support"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: **https://github.com/Epetaway/DojoNet-Prototype-MAX**
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Wait for the workflow to complete (check the **Actions** tab)

### Step 3: Verify Deployment

Once the workflow succeeds, visit:
**https://epetaway.github.io/DojoNet-Prototype-MAX/**

## 🧪 Testing Deep Links

After deployment, test these URLs to ensure routing works:
- https://epetaway.github.io/DojoNet-Prototype-MAX/
- https://epetaway.github.io/DojoNet-Prototype-MAX/explore
- https://epetaway.github.io/DojoNet-Prototype-MAX/events
- https://epetaway.github.io/DojoNet-Prototype-MAX/dashboard

All should load correctly without showing a blank "Skip to content" page.

## 📋 How It Works

1. **404.html**: When GitHub Pages receives a request for a route like `/explore`, it shows the 404 page
2. **404.html script**: Converts the path to a query parameter (`/?/explore`) and redirects to index.html
3. **index.html script**: Reads the query parameter and restores the original path
4. **React Router**: Takes over and renders the correct component based on the `basename` setting

## 🔄 Alternative: Hash Router (No 404 Needed)

If you prefer URLs like `/#/explore` instead of `/explore`, you can switch to HashRouter:

```jsx
// In src/main.jsx, replace BrowserRouter with HashRouter:
import { HashRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </HashRouter>
)
```

**Pros**: No 404.html needed, simpler setup  
**Cons**: URLs have `#` in them, not as clean for SEO

## 🛠️ Local Development

The configuration automatically detects the environment:
- **Development** (`npm run dev`): Uses empty basename, works at `http://localhost:5173/`
- **Production** (GitHub Pages): Uses `/DojoNet-Prototype-MAX` basename

## ✨ Next Steps

1. Run the git commands above
2. Verify the GitHub Actions workflow completes successfully
3. Visit your deployed site
4. Test navigation and deep links

Your DojoNet app will be live on GitHub Pages with full SPA routing support! 🎉
