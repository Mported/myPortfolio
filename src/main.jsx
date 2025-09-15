import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

function showStartupWarning(err) {
  const host = document.getElementById('no-js-warning') || document.body;
  const box = document.createElement('div');
  box.style.cssText = 'margin:8px;padding:12px;border:1px solid #333;border-radius:8px;background:#1b1b1b;color:#f0f0f0;font-family:system-ui,sans-serif;';
  box.textContent = 'This page could not start because a browser extension is locking down JavaScript (SES/lockdown). Please disable it for this site and reload.';
  host.appendChild(box);
  console.error('App bootstrap failed:', err);
}

try {
  const rootEl = document.getElementById('root');
  const canCreate = !!(ReactDOM && typeof ReactDOM.createRoot === 'function');
  if (!rootEl || !canCreate) throw new Error('ReactDOM.createRoot unavailable');
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  const warn = document.getElementById('no-js-warning');
  if (warn) warn.style.display = 'none';
} catch (err) {
  showStartupWarning(err);
}