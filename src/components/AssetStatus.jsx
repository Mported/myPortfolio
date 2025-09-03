// ========================
// ASSET STATUS COMPONENT
// Shows loading and error states for assets
// ========================

import React, { useState } from 'react';

const AssetStatus = ({ 
  assetsLoading, 
  assetsLoaded, 
  assetErrors, 
  retryLoading,
  loadedAssets 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const totalAssets = Object.keys(loadedAssets).length;
  const errorCount = Object.keys(assetErrors).length;
  const loadedCount = totalAssets - errorCount;

  // Don't show anything if all is well
  if (!assetsLoading && assetsLoaded && errorCount === 0) {
    return null;
  }

  // Show loading state
  if (assetsLoading && !assetsLoaded) {
    return (
      <div className="asset-status loading">
        <div className="asset-status-content">
          <div className="loading-spinner" />
          <p>Loading portfolio assets...</p>
        </div>
      </div>
    );
  }

  // Show error state if there are errors
  if (errorCount > 0) {
    return (
      <div className="asset-status error">
        <div className="asset-status-content">
          <div className="status-summary">
            <span className="status-icon">⚠️</span>
            <div>
              <h3>Asset Loading Issues</h3>
              <p>
                {loadedCount} of {totalAssets} assets loaded successfully
                {errorCount > 0 && ` (${errorCount} failed)`}
              </p>
            </div>
          </div>
          
          <div className="status-actions">
            <button onClick={retryLoading} className="retry-btn">
              🔄 Retry
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              className="details-btn"
            >
              {showDetails ? '▲' : '▼'} Details
            </button>
          </div>

          {showDetails && (
            <div className="error-details">
              <h4>Failed Assets:</h4>
              <ul>
                {Object.entries(assetErrors).map(([key, error]) => (
                  <li key={key}>
                    <code>{key}</code>: {error.message || 'Unknown error'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <style jsx>{`
          .asset-status {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            font-family: 'Space Grotesk', sans-serif;
          }

          .asset-status.loading {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
          }

          .asset-status.error {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
          }

          .asset-status-content {
            padding: 16px;
            color: #fff;
          }

          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(0, 255, 136, 0.3);
            border-top: 2px solid #00ff88;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .status-summary {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }

          .status-icon {
            font-size: 24px;
            line-height: 1;
          }

          .status-summary h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .status-summary p {
            margin: 0;
            font-size: 14px;
            opacity: 0.8;
          }

          .status-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
          }

          .retry-btn, .details-btn {
            padding: 6px 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .retry-btn:hover, .details-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
          }

          .error-details {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 12px;
          }

          .error-details h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .error-details ul {
            margin: 0;
            padding-left: 16px;
            font-size: 12px;
          }

          .error-details li {
            margin-bottom: 4px;
            opacity: 0.8;
          }

          .error-details code {
            color: #00ff88;
            font-family: 'JetBrains Mono', monospace;
          }

          @media (max-width: 480px) {
            .asset-status {
              top: 10px;
              right: 10px;
              left: 10px;
              max-width: none;
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default AssetStatus;