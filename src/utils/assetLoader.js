// ========================
// HYBRID ASSET LOADER UTILITY
// Works both online and offline with multiple fallback strategies
// ========================

import React from 'react';

// Import assets for bundling (offline support)
import constructionCalcSS from '../assets/constructionCalcSS.png';
import portfolioSS from '../assets/portfolioSS.png';
import galadeerSS from '../assets/galadeerSS.jpg';
import severenceSS from '../assets/severenceSS.png';
import solitaireSS from '../assets/solitaireSS.jpg';
import lebronSS from '../assets/lebronSS.png';
import avatarImg from '../assets/IMG_3641.jpeg';
import resumePDF from '../assets/miguelComonfortResumePortfolio.pdf';

// Asset configuration with multiple fallback strategies
export const ASSETS = {
  // Project Screenshots - with public and bundled fallbacks
  constructionCalcSS: {
    public: '/assets/constructionCalcSS.png',
    bundled: constructionCalcSS,
    name: 'Construction Calculator'
  },
  portfolioSS: {
    public: '/assets/portfolioSS.png',
    bundled: portfolioSS,
    name: 'Portfolio'
  },
  galadeerSS: {
    public: '/assets/galadeerSS.jpg',
    bundled: galadeerSS,
    name: 'Galadeer'
  },
  severenceSS: {
    public: '/assets/severenceSS.png',
    bundled: severenceSS,
    name: 'Severance Manager'
  },
  solitaireSS: {
    public: '/assets/solitaireSS.jpg',
    bundled: solitaireSS,
    name: 'Solitaire Game'
  },
  lebronSS: {
    public: '/assets/lebronSS.png',
    bundled: lebronSS,
    name: 'LeBron Stats'
  },
  
  // Profile Images
  avatarImg: {
    public: '/assets/IMG_3641.jpeg',
    bundled: avatarImg,
    name: 'Profile Picture'
  },
  
  // Documents
  resumePDF: {
    public: '/assets/miguelComonfortResumePortfolio.pdf',
    bundled: resumePDF,
    name: 'Resume PDF'
  }
};

// Fallback placeholder for missing images
export const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';

// Enhanced asset loading utility with online/offline support
export class AssetLoader {
  static cache = new Map();
  static failedAssets = new Set();
  static isOnline = navigator.onLine;
  static offlineMode = false;

  static {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.offlineMode = false;
      console.log('Back online - will try public assets first');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineMode = true;
      console.log('Offline mode - using bundled assets');
    });
  }

  // Get the best asset URL based on online/offline status
  static getAssetUrl(assetConfig) {
    if (typeof assetConfig === 'string') {
      return assetConfig; // Legacy support
    }

    // If offline or public asset previously failed, use bundled
    if (this.offlineMode || this.failedAssets.has(assetConfig.public)) {
      return assetConfig.bundled;
    }

    // Otherwise try public first (better for caching)
    return assetConfig.public;
  }

  // Preload an asset with fallback strategy
  static async preloadAsset(assetConfig) {
    const cacheKey = typeof assetConfig === 'string' ? assetConfig : assetConfig.public;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let finalUrl;

    try {
      // Try the best URL first
      const primaryUrl = this.getAssetUrl(assetConfig);
      finalUrl = await this.loadAssetWithTimeout(primaryUrl, 5000);
      
    } catch (error) {
      // If primary fails and we have a bundled fallback
      if (typeof assetConfig === 'object' && assetConfig.bundled) {
        console.warn(`Primary asset failed for ${assetConfig.name}, using bundled fallback`);
        
        // Mark public URL as failed
        if (assetConfig.public) {
          this.failedAssets.add(assetConfig.public);
        }
        
        try {
          finalUrl = await this.loadAssetWithTimeout(assetConfig.bundled, 3000);
        } catch (bundledError) {
          console.error(`Both primary and bundled assets failed for ${assetConfig.name}`);
          finalUrl = FALLBACK_IMAGE;
        }
      } else {
        console.warn(`Asset failed to load: ${cacheKey}`);
        finalUrl = FALLBACK_IMAGE;
      }
    }

    this.cache.set(cacheKey, finalUrl);
    return finalUrl;
  }

  // Load asset with timeout
  static loadAssetWithTimeout(src, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => {
        reject(new Error(`Timeout loading asset: ${src}`));
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timer);
        resolve(src);
      };
      
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Failed to load asset: ${src}`));
      };
      
      img.src = src;
    });
  }

  // Preload multiple images
  static async preloadImages(srcArray) {
    const results = await Promise.allSettled(
      srcArray.map(src => this.preloadImage(src))
    );
    
    return results.map((result, index) => ({
      src: srcArray[index],
      loaded: result.status === 'fulfilled',
      finalSrc: result.status === 'fulfilled' ? result.value : FALLBACK_IMAGE
    }));
  }

  // Get optimized image with WebP fallback
  static getOptimizedImage(src) {
    // Check WebP support
    const supportsWebP = this.supportsWebP();
    
    if (supportsWebP && src.endsWith('.jpg') || src.endsWith('.png')) {
      const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
      // Return original if WebP version doesn't exist
      return this.imageExists(webpSrc).then(exists => 
        exists ? webpSrc : src
      );
    }
    
    return Promise.resolve(src);
  }

  // Check WebP support
  static supportsWebP() {
    if (typeof this._webpSupport !== 'undefined') {
      return this._webpSupport;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return this._webpSupport;
  }

  // Check if image exists
  static imageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  // Progressive image loading with blur-up effect
  static createProgressiveImage(src, placeholder = null) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // Low-quality placeholder
    if (placeholder) {
      const placeholderImg = document.createElement('img');
      placeholderImg.src = placeholder;
      placeholderImg.style.filter = 'blur(5px)';
      placeholderImg.style.transform = 'scale(1.1)';
      placeholderImg.style.transition = 'opacity 0.3s ease';
      container.appendChild(placeholderImg);
    }
    
    // High-quality image
    this.preloadImage(src).then((finalSrc) => {
      const img = document.createElement('img');
      img.src = finalSrc;
      img.style.position = placeholder ? 'absolute' : 'static';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      img.onload = () => {
        img.style.opacity = '1';
        if (placeholder && container.firstChild) {
          setTimeout(() => {
            container.firstChild.style.opacity = '0';
          }, 50);
        }
      };
      
      container.appendChild(img);
    });
    
    return container;
  }
}

// React hook for hybrid asset loading
export const useAssetLoader = (assets) => {
  const [loadedAssets, setLoadedAssets] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState({});
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      const assetEntries = Object.entries(assets);
      
      const results = await Promise.allSettled(
        assetEntries.map(([key, config]) => 
          AssetLoader.preloadAsset(config).then(finalSrc => ({ key, finalSrc }))
        )
      );
      
      const loaded = {};
      const loadErrors = {};
      
      results.forEach((result, index) => {
        const [key] = assetEntries[index];
        
        if (result.status === 'fulfilled') {
          loaded[key] = result.value.finalSrc;
        } else {
          loadErrors[key] = result.reason;
          loaded[key] = FALLBACK_IMAGE;
        }
      });
      
      setLoadedAssets(loaded);
      setErrors(loadErrors);
      setLoading(false);
    };

    loadAssets();
  }, [assets, retryCount]);

  // Retry function for failed assets
  const retryLoading = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
    AssetLoader.cache.clear(); // Clear cache for retry
  }, []);

  return { loadedAssets, loading, errors, retryLoading };
};

// Preload all portfolio assets with hybrid loading
export const preloadPortfolioAssets = async () => {
  const assetConfigs = Object.values(ASSETS);
  
  const results = await Promise.allSettled(
    assetConfigs.map(config => AssetLoader.preloadAsset(config))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Asset preloading complete: ${successful} successful, ${failed} failed`);
  
  return results.map((result, index) => ({
    name: assetConfigs[index].name || 'Unknown',
    success: result.status === 'fulfilled',
    url: result.status === 'fulfilled' ? result.value : FALLBACK_IMAGE
  }));
};

// Simple getter functions for backward compatibility
export const getAssetUrl = (assetKey) => {
  const config = ASSETS[assetKey];
  return AssetLoader.getAssetUrl(config);
};

// Export individual assets for easy access
export const getConstructionCalcSS = () => getAssetUrl('constructionCalcSS');
export const getPortfolioSS = () => getAssetUrl('portfolioSS');
export const getGaladeerSS = () => getAssetUrl('galadeerSS');
export const getSeverenceSS = () => getAssetUrl('severenceSS');
export const getSolitaireSS = () => getAssetUrl('solitaireSS');
export const getLebronSS = () => getAssetUrl('lebronSS');
export const getAvatarImg = () => getAssetUrl('avatarImg');
export const getResumePDF = () => getAssetUrl('resumePDF');

export default AssetLoader;