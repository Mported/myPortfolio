// ========================
// SERVICE WORKER
// Advanced caching for online/offline asset management
// ========================

const CACHE_NAME = 'mported-portfolio-v1';
const ASSET_CACHE_NAME = 'mported-assets-v1';

// Assets to cache for offline use
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/assets/constructionCalcSS.png',
  '/assets/portfolioSS.png',
  '/assets/galadeerSS.jpg',
  '/assets/severenceSS.png',
  '/assets/solitaireSS.jpg',
  '/assets/lebronSS.png',
  '/assets/IMG_3641.jpeg',
  '/assets/miguelComonfortResumePortfolio.pdf'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache the app shell
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(['/']);
      }),
      
      // Cache assets with error handling
      caches.open(ASSET_CACHE_NAME).then(cache => {
        return Promise.allSettled(
          CRITICAL_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              console.warn(`Failed to cache asset: ${asset}`, err);
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSET_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle asset requests
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(handleAssetRequest(request));
    return;
  }

  // Handle app requests
  if (request.method === 'GET') {
    event.respondWith(handleAppRequest(request));
  }
});

// Asset request handler - Cache First strategy with network fallback
async function handleAssetRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Serving asset from cache:', request.url);
      return cachedResponse;
    }

    // If not in cache, fetch from network
    console.log('Fetching asset from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the new asset
      const cache = await caches.open(ASSET_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Asset request failed:', request.url, error);
    
    // Return a fallback image for failed image requests
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="#999" text-anchor="middle" dy=".3em">Image Unavailable</text></svg>',
        {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }
    
    throw error;
  }
}

// App request handler - Network First with cache fallback
async function handleAppRequest(request) {
  try {
    // Try network first for app requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If requesting the root and nothing in cache, return a basic HTML page
    if (request.url.endsWith('/') || request.url.includes('index.html')) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Portfolio - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
            .offline { background: #fff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're Offline</h1>
            <p>The portfolio is temporarily unavailable. Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }
    
    throw error;
  }
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'retry-asset-requests') {
    event.waitUntil(retryFailedAssets());
  }
});

// Retry failed asset requests when back online
async function retryFailedAssets() {
  console.log('Retrying failed asset requests...');
  
  try {
    const cache = await caches.open(ASSET_CACHE_NAME);
    const cachedRequests = await cache.keys();
    
    // Check if we can fetch any missing critical assets
    for (const asset of CRITICAL_ASSETS) {
      const request = new Request(asset);
      const cached = await cache.match(request);
      
      if (!cached) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
            console.log('Successfully cached missing asset:', asset);
          }
        } catch (err) {
          console.warn('Still unable to fetch asset:', asset);
        }
      }
    }
  } catch (error) {
    console.error('Error during asset retry:', error);
  }
}

// Message handling from the main app
self.addEventListener('message', event => {
  const { type, payload } = event.data;

  switch (type) {
    case 'CACHE_ASSET':
      cacheAsset(payload.url);
      break;
    case 'CLEAR_CACHE':
      clearCache();
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      });
      break;
  }
});

// Cache a specific asset
async function cacheAsset(url) {
  try {
    const cache = await caches.open(ASSET_CACHE_NAME);
    await cache.add(url);
    console.log('Successfully cached asset:', url);
  } catch (error) {
    console.error('Failed to cache asset:', url, error);
  }
}

// Clear all caches
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('All caches cleared');
}

// Get cache status
async function getCacheStatus() {
  const assetCache = await caches.open(ASSET_CACHE_NAME);
  const cachedAssets = await assetCache.keys();
  
  return {
    totalAssets: CRITICAL_ASSETS.length,
    cachedAssets: cachedAssets.length,
    assets: cachedAssets.map(req => req.url),
    isOnline: navigator.onLine
  };
}