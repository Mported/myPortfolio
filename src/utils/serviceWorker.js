// ========================
// SERVICE WORKER REGISTRATION
// Manages service worker lifecycle and communication
// ========================

import React from 'react';

let swRegistration = null;
let isServiceWorkerSupported = false;

// Check if service workers are supported
export const isSupported = () => {
  isServiceWorkerSupported = 'serviceWorker' in navigator;
  return isServiceWorkerSupported;
};

// Register the service worker
export const registerServiceWorker = async () => {
  if (!isSupported()) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    // Different paths for development vs production
    const swPath = import.meta.env.DEV ? '/public/sw.js' : '/sw.js';
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/'
    });

    swRegistration = registration;

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New service worker installed, update available');
          
          // Notify the app about the update
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { registration }
          }));
        }
      });
    });

    console.log('Service Worker registered successfully:', registration);
    return registration;
    
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Unregister the service worker
export const unregisterServiceWorker = async () => {
  if (!isSupported() || !swRegistration) {
    return false;
  }

  try {
    const result = await swRegistration.unregister();
    console.log('Service Worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

// Send message to service worker
export const sendMessageToSW = (message) => {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No service worker controller'));
      return;
    }

    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
  });
};

// Cache a specific asset via service worker
export const cacheAsset = async (url) => {
  try {
    await sendMessageToSW({ type: 'CACHE_ASSET', payload: { url } });
    console.log('Asset cached via service worker:', url);
  } catch (error) {
    console.error('Failed to cache asset:', error);
  }
};

// Clear all caches
export const clearCache = async () => {
  try {
    await sendMessageToSW({ type: 'CLEAR_CACHE' });
    console.log('Cache cleared via service worker');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

// Get cache status
export const getCacheStatus = async () => {
  try {
    const status = await sendMessageToSW({ type: 'GET_CACHE_STATUS' });
    return status.payload;
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return null;
  }
};

// Force update the service worker
export const updateServiceWorker = async () => {
  if (!swRegistration) {
    return false;
  }

  try {
    await swRegistration.update();
    console.log('Service Worker update triggered');
    return true;
  } catch (error) {
    console.error('Service Worker update failed:', error);
    return false;
  }
};

// Skip waiting and activate new service worker
export const skipWaiting = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

// React hook for service worker status
export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [cacheStatus, setCacheStatus] = React.useState(null);

  React.useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      setIsRegistered(!!registration);
    });

    // Listen for update events
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdate);

    // Get initial cache status
    getCacheStatus().then(setCacheStatus);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  const refreshCacheStatus = React.useCallback(async () => {
    const status = await getCacheStatus();
    setCacheStatus(status);
  }, []);

  return {
    isRegistered,
    isSupported: isSupported(),
    updateAvailable,
    cacheStatus,
    refreshCacheStatus,
    updateServiceWorker,
    clearCache,
    cacheAsset
  };
};

export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  isSupported,
  sendMessage: sendMessageToSW,
  cacheAsset,
  clearCache,
  getCacheStatus,
  updateServiceWorker,
  skipWaiting
};