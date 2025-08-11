# WordPress Deployment Guide for mported.dev

## ✅ Package.json is Ready!

Your package.json and build configuration have been optimized for deployment to your WordPress site.

## 🚀 Build Commands

### Production Build
```bash
npm run deploy:build
```
This command:
- Cleans the dist folder (Windows compatible)
- Builds optimized production assets
- Creates chunked bundles for better performance

**✅ Windows Compatible:** All commands now work on Windows CMD/PowerShell

### Other Available Commands
```bash
npm run dev          # Development server
npm run build        # Standard build
npm run build:prod   # Production build only
npm run preview      # Preview production build locally
npm run clean        # Clean dist folder
npm run serve        # Serve build on port 3000
```

## 📁 Deployment Files

After running `npm run deploy:build`, upload these files from the `dist/` folder:

### Required Files:
- `index.html` - Main HTML file
- `assets/` folder - Contains all CSS, JS, and other assets
- `vite.svg` - Vite favicon
- `winged kuriboh.gltf` - 3D model asset

## 🔧 WordPress Deployment Steps

### Option 1: Replace WordPress Theme (Recommended)
1. Run `npm run deploy:build`
2. Upload ALL contents of the `dist/` folder to your WordPress root directory
3. The `index.html` will serve as your main page

### Option 2: Custom Page Template
1. Create a custom WordPress page template
2. Include the built CSS and JS files in your template
3. Paste the content from `index.html` into your template

### Option 3: Plugin Method
1. Use a plugin like "Insert Headers and Footers"
2. Add the CSS and JS file links to your WordPress head
3. Create a page and paste the HTML content

## 🌐 Domain Configuration

Your site is configured for: **https://mported.dev/**

- Homepage URL: ✅ Set correctly
- Base path: ✅ Configured for root deployment
- Asset paths: ✅ Relative paths for WordPress compatibility

## ⚡ Performance Optimizations

Your build includes:
- **Chunked bundles** for better loading
  - `vendor.js` - React core (141KB)
  - `three.js` - 3D graphics (779KB)
  - `animations.js` - Animation libraries (185KB)
- **Disabled source maps** for smaller files
- **Optimized CSS** with Tailwind
- **Compressed assets** with gzip

## 🔍 Testing Before Deployment

1. **Local preview:**
   ```bash
   npm run serve
   ```
   Visit: http://localhost:3000

2. **Check all features:**
   - Loading screen ✅
   - Profile card interactions ✅
   - Section navigation ✅
   - Bento grid (My Work) ✅
   - Resume PDF viewer ✅
   - Infinite scroll (Connect) ✅
   - Contact button → Instagram ✅

## 📋 File Structure for Upload

```
mported.dev/
├── index.html                    # Main page
├── vite.svg                      # Favicon
├── winged kuriboh.gltf          # 3D asset
└── assets/
    ├── index-ByZ-NFtH.css       # Main styles
    ├── index-5m6DrlOP.js        # Main app logic
    ├── vendor-nYdvTP35.js       # React libraries
    ├── three-CQw5cbHv.js        # 3D graphics
    └── animations-kADMsoyH.js   # Animations
```

## 🐛 Troubleshooting

### If assets don't load:
- Check file permissions (644 for files, 755 for folders)
- Verify HTTPS is working on your domain
- Check browser console for 404 errors

### If 3D models don't appear:
- Ensure `winged kuriboh.gltf` is uploaded
- Check MIME type support for .gltf files

### Performance Issues:
- Enable gzip compression on your server
- Consider using a CDN for the large Three.js bundle

## ✅ Ready to Deploy!

Your portfolio is now ready for production deployment to https://mported.dev/