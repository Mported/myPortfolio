import React from 'react';

function DebugApp() {
  return (
    <div style={{
      color: 'white',
      background: 'red',
      padding: '20px',
      fontSize: '24px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      width: '100%',
      height: '100%'
    }}>
      <h1>DEBUG: React App is Working!</h1>
      <p>If you can see this, React is mounting correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default DebugApp;