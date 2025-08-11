# WordPress Deployment Issues - Complete Fix Guide

## 🚨 Issues You're Experiencing:
- `NS_ERROR_CORRUPTED_CONTENT` - Files corrupted/blocked
- `text/html` MIME type instead of `application/javascript`
- 404 errors for CSS and JS files
- Module loading blocked by WordPress

## 🔧 Solution Methods (Try in Order)

### Method 1: .htaccess Fix (Recommended)

1. **Upload the `.htaccess` file** (included in your build) to your WordPress root directory
2. **Merge with existing .htaccess** if you have one:

```apache
# WordPress Portfolio - Asset Serving Configuration

# Set correct MIME types for JavaScript and CSS files
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
    AddType application/json .json
    AddType model/gltf+json .gltf
    AddType image/svg+xml .svg
</IfModule>

# Allow access to asset files (bypass WordPress routing)
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Allow direct access to static assets (ADD BEFORE WORDPRESS RULES)
    RewriteRule ^assets/.*\.(js|css|json|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|gltf|glb)$ - [L]
    RewriteRule ^(vite\.svg|favicon\.ico|.*\.gltf|.*\.glb)$ - [L]
    
    # WordPress default rules (keep existing)
    RewriteBase /
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>

# Prevent WordPress from processing asset requests
<Files "*.js">
    SetHandler default-handler
</Files>

<Files "*.css">
    SetHandler default-handler
</Files>
```

### Method 2: WordPress Plugin Fix

Create a plugin file `portfolio-assets.php`:

```php
<?php
/*
Plugin Name: Portfolio Assets Handler
Description: Fixes MIME types and routing for portfolio assets
*/

// Fix MIME types
add_filter('upload_mimes', 'portfolio_mime_types');
function portfolio_mime_types($mimes) {
    $mimes['js'] = 'application/javascript';
    $mimes['mjs'] = 'application/javascript'; 
    $mimes['gltf'] = 'model/gltf+json';
    return $mimes;
}

// Bypass WordPress for asset files
add_action('init', 'portfolio_bypass_assets', 1);
function portfolio_bypass_assets() {
    $request_uri = $_SERVER['REQUEST_URI'];
    
    if (strpos($request_uri, '/assets/') !== false || 
        strpos($request_uri, 'vite.svg') !== false) {
        return; // Let server handle directly
    }
}
?>
```

### Method 3: Alternative Upload Structure

Instead of uploading to root, try this structure:

```
/wp-content/themes/your-theme/portfolio/
├── index.html
├── assets/
│   ├── index-5m6DrlOP.js
│   ├── vendor-nYdvTP35.js
│   ├── three-CQw5cbHv.js
│   ├── animations-kADMsoyH.js
│   └── index-ByZ-NFtH.css
└── vite.svg
```

Then create a custom page template that includes these assets.

### Method 4: Server Configuration

Add to your hosting control panel or contact support to add:

```apache
# In Apache virtual host or main config
<Directory "/path/to/your/site">
    <Files "*.js">
        ForceType application/javascript
    </Files>
    
    <Files "*.css">
        ForceType text/css
    </Files>
</Directory>
```

For **Nginx**:
```nginx
location ~* \.(js|mjs)$ {
    add_header Content-Type application/javascript;
}

location ~* \.css$ {
    add_header Content-Type text/css;
}
```

## 🔍 Debugging Steps

### 1. Test File Access Directly
Try accessing: `https://mported.dev/assets/vendor-nYdvTP35.js`

**If 404:** Files not uploaded or wrong location
**If "text/html":** MIME type issue
**If corrupted:** Upload issue or compression problem

### 2. Check File Upload
- Verify ALL files in `dist/` folder are uploaded
- Check file permissions: 644 for files, 755 for directories
- Ensure binary upload mode (not ASCII)

### 3. WordPress Plugins Conflicts
- Temporarily deactivate security plugins
- Deactivate caching plugins during testing
- Check if any plugin is blocking JS files

## 🚀 Quick Fix Commands

### Re-upload with correct permissions:
```bash
# After uploading files
chmod 755 assets/
chmod 644 assets/*
chmod 644 index.html
chmod 644 vite.svg
chmod 644 *.gltf
```

### Test MIME types:
```bash
curl -I https://mported.dev/assets/vendor-nYdvTP35.js
# Should show: Content-Type: application/javascript
```

## ⚡ Emergency Fallback - Single File Version

If all else fails, I can create a single-file build that embeds everything:

```bash
npm run build:single
```

This creates one large HTML file with all CSS/JS inline - guaranteed to work but larger file size.

## 📞 Need Help?

1. **Check your hosting provider** - Some shared hosts block certain file types
2. **Contact support** - Ask them to enable proper MIME types for .js and .css files
3. **Try a different hosting** - Consider Netlify, Vercel, or GitHub Pages for static hosting

## ✅ Success Checklist

- [ ] `.htaccess` file uploaded and configured
- [ ] All asset files uploaded to `/assets/` folder
- [ ] File permissions set correctly (644/755)
- [ ] No 404 errors in browser console
- [ ] JS files served with `application/javascript` MIME type
- [ ] CSS files served with `text/css` MIME type
- [ ] WordPress not intercepting asset requests

Your portfolio should load without errors once these issues are resolved!