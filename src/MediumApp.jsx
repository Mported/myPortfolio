import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Medium complexity app with basic animations but no 3D or heavy assets
function MediumApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      id: 0,
      title: "WELCOME",
      subtitle: "MIGUEL A. COMONFORT",
      description: "Game Developer & Frontend Engineer",
      color: "#00ff88"
    },
    {
      id: 1,
      title: "ABOUT",
      subtitle: "WHO I AM",
      description: "I'm from the Bay Area and a recent UCSC graduate with a BS in Computer Science Game Design.",
      color: "#ff6b6b"
    },
    {
      id: 2,
      title: "SKILLS",
      subtitle: "TECHNOLOGIES",
      description: "Unity • React • C# • JavaScript • Blender • Photoshop",
      color: "#4ecdc4"
    },
    {
      id: 3,
      title: "CONTACT",
      subtitle: "GET IN TOUCH",
      description: "Ready to collaborate on your next project!",
      color: "#a29bfe"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentSection((prev) => (prev + 1) % sections.length);
    } else {
      setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #000 0%, #1a1a2e 100%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ color: '#00ff88', fontSize: '3rem', marginBottom: '1rem' }}>
            Loading...
          </h1>
          <p>Preparing your experience</p>
        </motion.div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #000 0%, #1a1a2e 100%)',
      color: 'white',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background animation */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${currentSectionData.color}22 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Navigation */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 100
      }}>
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: currentSection === index ? section.color : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.h1
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                color: currentSectionData.color,
                fontWeight: 'bold'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {currentSectionData.title}
            </motion.h1>

            <motion.h2
              style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                opacity: 0.8
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {currentSectionData.subtitle}
            </motion.h2>

            <motion.p
              style={{
                fontSize: '1.2rem',
                maxWidth: '600px',
                lineHeight: 1.6
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {currentSectionData.description}
            </motion.p>

            {currentSection === 3 && (
              <motion.div
                style={{
                  marginTop: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <a
                  href="mailto:erqmac@gmail.com"
                  style={{
                    background: currentSectionData.color,
                    color: 'black',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Email Me
                </a>
                <a
                  href="https://github.com/Mported"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'transparent',
                    color: currentSectionData.color,
                    border: `2px solid ${currentSectionData.color}`,
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  GitHub
                </a>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => handleNavigation('prev')}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99
        }}
      >
        ←
      </button>

      <button
        onClick={() => handleNavigation('next')}
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99
        }}
      >
        →
      </button>

      {/* Section indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1.2rem',
        zIndex: 100
      }}>
        {String(currentSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
      </div>
    </div>
  );
}

export default MediumApp;