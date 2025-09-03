// ========================
// ASSET LOADER UTILITY
// Robust asset loading with fallbacks and optimization
// ========================

// Asset configuration with fallbacks
export const ASSETS = {
  // Project Screenshots
  constructionCalcSS: '/assets/constructionCalcSS.png',
  portfolioSS: '/assets/portfolioSS.png',
  galadeerSS: '/assets/galadeerSS.jpg',
  severenceSS: '/assets/severenceSS.png',
  solitaireSS: '/assets/solitaireSS.jpg',
  lebronSS: '/assets/lebronSS.png',
  
  // Profile Images
  avatarImg: '/assets/IMG_3641.jpeg',
  
  // Documents
  resumePDF: '/assets/miguelComonfortResumePortfolio.pdf'
};

// Fallback placeholder for missing images
export const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';

// Asset loading utility with error handling
export class AssetLoader {
  static cache = new Map();
  static observers = new Map();

  // Preload an image with promise-based loading
  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve(this.cache.get(src));
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, src);
        resolve(src);
      };
      
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        this.cache.set(src, FALLBACK_IMAGE);
        resolve(FALLBACK_IMAGE);
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

// React hook for asset loading
export const useAssetLoader = (assets) => {
  const [loadedAssets, setLoadedAssets] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      const assetEntries = Object.entries(assets);
      
      const results = await Promise.allSettled(
        assetEntries.map(([key, src]) => 
          AssetLoader.preloadImage(src).then(finalSrc => ({ key, finalSrc }))
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
  }, [assets]);

  return { loadedAssets, loading, errors };
};

// Preload all portfolio assets
export const preloadPortfolioAssets = () => {
  const assetUrls = Object.values(ASSETS);
  return AssetLoader.preloadImages(assetUrls);
};

export default AssetLoader;