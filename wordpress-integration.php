<?php
/*
WordPress Portfolio Integration
Place this in your active theme's functions.php or create a custom plugin
*/

// Disable WordPress from interfering with asset files
add_action('init', 'portfolio_asset_handler');
function portfolio_asset_handler() {
    // Check if request is for portfolio assets
    $request_uri = sanitize_text_field($_SERVER['REQUEST_URI']);
    
    if (preg_match('/\/(assets\/|vite\.svg|.*\.gltf)/', $request_uri)) {
        // Let server handle these files directly
        return;
    }
}

// Add proper MIME types for portfolio assets
add_filter('upload_mimes', 'portfolio_mime_types');
function portfolio_mime_types($mimes) {
    $mimes['gltf'] = 'model/gltf+json';
    $mimes['glb'] = 'model/gltf-binary';
    $mimes['js'] = 'application/javascript';
    $mimes['mjs'] = 'application/javascript';
    return $mimes;
}

// Enqueue portfolio assets properly (Alternative method)
add_action('wp_enqueue_scripts', 'portfolio_assets');
function portfolio_assets() {
    // Only load on specific page/homepage
    if (is_front_page() || is_page('portfolio')) {
        wp_enqueue_style('portfolio-css', get_site_url() . '/assets/index-ByZ-NFtH.css', array(), '1.0.0');
        wp_enqueue_script('portfolio-vendor', get_site_url() . '/assets/vendor-nYdvTP35.js', array(), '1.0.0', true);
        wp_enqueue_script('portfolio-three', get_site_url() . '/assets/three-CQw5cbHv.js', array(), '1.0.0', true);
        wp_enqueue_script('portfolio-animations', get_site_url() . '/assets/animations-kADMsoyH.js', array(), '1.0.0', true);
        wp_enqueue_script('portfolio-main', get_site_url() . '/assets/index-5m6DrlOP.js', array('portfolio-vendor', 'portfolio-three', 'portfolio-animations'), '1.0.0', true);
    }
}

// Custom page template for portfolio
add_action('template_redirect', 'portfolio_template_redirect');
function portfolio_template_redirect() {
    if (is_front_page()) {
        // Include the portfolio HTML content
        $template_path = get_template_directory() . '/portfolio-template.php';
        if (file_exists($template_path) && strpos(realpath($template_path), realpath(get_template_directory())) === 0) {
            include $template_path;
        } else {
            wp_die('Portfolio template not found or invalid path.');
        }
        exit;
    }
}
?>