// ========================
// DITHER FALLBACK COMPONENT
// CSS-based fallback when WebGL is unavailable
// ========================

import React from 'react';

const DitherFallback = ({ color1 = [0, 1, 0.53], color2 = [0.03, 0.23, 1] }) => {
  // Convert color arrays to CSS colors
  const cssColor1 = `rgb(${Math.round(color1[0] * 255)}, ${Math.round(color1[1] * 255)}, ${Math.round(color1[2] * 255)})`;
  const cssColor2 = `rgb(${Math.round(color2[0] * 255)}, ${Math.round(color2[1] * 255)}, ${Math.round(color2[2] * 255)})`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${cssColor1} 0%, ${cssColor2} 100%)`,
        opacity: 0.8,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      {/* Optional animated particles for visual interest */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 40% 60%, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 300px 300px, 150px 150px',
          animation: 'float 20s ease-in-out infinite alternate',
        }}
      />
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(20px) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default DitherFallback;