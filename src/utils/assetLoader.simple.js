// ========================
// SIMPLIFIED ASSET LOADER
// Works both online and offline with streamlined approach
// ========================

import React, { useState, useEffect, useCallback } from 'react';

// Import assets for bundling (offline support)
import constructionCalcSS from '../assets/constructionCalcSS.png';
import portfolioSS from '../assets/portfolioSS.png';
import galadeerSS from '../assets/galadeerSS.jpg';
import severenceSS from '../assets/severenceSS.png';
import solitaireSS from '../assets/solitaireSS.jpg';
import lebronSS from '../assets/lebronSS.png';
import avatarImg from '../assets/IMG_3641.jpeg';
import resumePDF from '../assets/miguelComonfortResumePortfolio.pdf';

// Simplified asset configuration
export const ASSETS = {
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
  avatarImg: {
    public: '/assets/IMG_3641.jpeg',
    bundled: avatarImg,
    name: 'Profile Picture'
  },
  resumePDF: {
    public: '/assets/miguelComonfortResumePortfolio.pdf',
    bundled: resumePDF,
    name: 'Resume PDF'
  }
};

// Fallback placeholder for missing images
export const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';

// Simple asset loader that tries public first, then bundled
export class SimpleAssetLoader {
  static cache = new Map();
  static isOnline = navigator.onLine;

  static {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Get the best asset URL
  static getAssetUrl(assetConfig) {
    if (typeof assetConfig === 'string') {
      return assetConfig;
    }

    // If offline, use bundled immediately
    if (!this.isOnline) {
      return assetConfig.bundled;
    }

    // Otherwise return public URL (will fallback to bundled if it fails)
    return assetConfig.public;
  }

  // Test if an asset loads successfully
  static testAsset(url) {
    return new Promise((resolve) => {
      if (url.startsWith('data:') || url.includes('blob:') || url.startsWith('/src/')) {
        // These are bundled assets, assume they work
        resolve(true);
        return;
      }

      const img = new Image();
      const timeout = setTimeout(() => resolve(false), 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  // Load asset with fallback
  static async loadAsset(assetConfig) {
    if (typeof assetConfig === 'string') {
      return assetConfig;
    }

    const cacheKey = assetConfig.name || 'unknown';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let finalUrl;

    try {
      // Try public URL first (if online)
      if (this.isOnline) {
        const publicWorks = await this.testAsset(assetConfig.public);
        if (publicWorks) {
          finalUrl = assetConfig.public;
        } else {
          throw new Error('Public asset failed');
        }
      } else {
        throw new Error('Offline - use bundled');
      }
    } catch (error) {
      // Fallback to bundled
      console.log(`Using bundled asset for ${assetConfig.name}`);
      finalUrl = assetConfig.bundled;
    }

    this.cache.set(cacheKey, finalUrl);
    return finalUrl;
  }
}

// Simple React hook for asset loading
export const useAssetLoader = (assets) => {
  const [loadedAssets, setLoadedAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const loaded = {};
    const loadErrors = {};

    for (const [key, config] of Object.entries(assets)) {
      try {
        loaded[key] = await SimpleAssetLoader.loadAsset(config);
      } catch (error) {
        console.warn(`Failed to load asset ${key}:`, error);
        loadErrors[key] = error;
        loaded[key] = FALLBACK_IMAGE;
      }
    }

    setLoadedAssets(loaded);
    setErrors(loadErrors);
    setLoading(false);
  }, [assets]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const retryLoading = useCallback(() => {
    SimpleAssetLoader.cache.clear();
    loadAssets();
  }, [loadAssets]);

  return { loadedAssets, loading, errors, retryLoading };
};

// Preload all portfolio assets
export const preloadPortfolioAssets = async () => {
  const results = [];
  
  for (const [key, config] of Object.entries(ASSETS)) {
    try {
      const url = await SimpleAssetLoader.loadAsset(config);
      results.push({
        name: config.name,
        success: true,
        url
      });
    } catch (error) {
      results.push({
        name: config.name,
        success: false,
        url: FALLBACK_IMAGE
      });
    }
  }

  console.log(`Asset preloading complete: ${results.filter(r => r.success).length} successful, ${results.filter(r => !r.success).length} failed`);
  return results;
};

export default SimpleAssetLoader;