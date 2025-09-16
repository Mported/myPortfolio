import React, { useState } from 'react';
import './App.css';

// Simple version to test basic functionality
function SimpleApp() {
  const [message, setMessage] = useState('Simple App Loading...');

  React.useEffect(() => {
    // Test basic JavaScript execution
    setTimeout(() => {
      setMessage('Simple App Loaded Successfully!');
    }, 1000);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #000 0%, #1a1a2e 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ff88' }}>
        Miguel Comonfort
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.8 }}>
        Game Developer & Frontend Engineer
      </h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        {message}
      </p>
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setMessage('Button clicked!')}
          style={{
            background: '#00ff88',
            color: 'black',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Button
        </button>
        <a
          href="https://github.com/Mported"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'transparent',
            color: '#00ff88',
            border: '2px solid #00ff88',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

export default SimpleApp;