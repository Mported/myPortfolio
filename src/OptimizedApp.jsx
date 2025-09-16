// ========================
// OPTIMIZED PORTFOLIO APP
// Lightweight version that maintains visual fidelity
// ========================

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Observer } from "gsap/Observer";

import './App.css';

// Helper to build public asset URLs
const asset = (p) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '/');
  return (`${base}${p}`).replace(/\/{2,}/g, '/');
};

const resolveAsset = (name) => asset(`assets/${name}`);

// Fallback image
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0a0a0a"/>
        <stop offset="100%" stop-color="#1a1a2e"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="#00ff88" font-size="20" font-family="Arial, Helvetica, sans-serif" text-anchor="middle" dominant-baseline="middle">
      Image not found
    </text>
  </svg>`);

// Lazy load heavy components only when needed
const Dither = lazy(() => import('./components/Dither'));

// ========================
// LIGHTWEIGHT BACKGROUND EFFECT
// CSS-based dither effect that looks similar to 3D version
// ========================
const CSSBackground = ({ color1, color2, animated = true }) => {
  const backgroundRef = useRef(null);

  useEffect(() => {
    if (!animated || !backgroundRef.current) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(backgroundRef.current, {
      duration: 4,
      '--gradient-offset': '100%',
      ease: "sine.inOut"
    });

    return () => tl.kill();
  }, [animated]);

  const gradientStyle = {
    '--color1': `rgb(${color1.map(c => Math.round(c * 255)).join(',')})`,
    '--color2': `rgb(${color2.map(c => Math.round(c * 255)).join(',')})`,
    '--gradient-offset': '0%'
  };

  return (
    <div
      ref={backgroundRef}
      className="css-dither-background"
      style={gradientStyle}
    />
  );
};

// ========================
// UTILITY COMPONENTS
// ========================

const SmartImg = ({ src: nameOrUrl, alt = '', className = '', loading = 'lazy', style }) => {
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg'];

  const getBaseName = (str) => {
    if (!str) return '';
    const cleaned = String(str).split('?')[0].split('#')[0];
    const fileName = cleaned.substring(cleaned.lastIndexOf('/') + 1);
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
  };

  const getExtension = () => {
    const cleaned = String(nameOrUrl || '').split('?')[0].split('#')[0];
    const dotIndex = cleaned.lastIndexOf('.');
    return dotIndex > 0 ? cleaned.substring(dotIndex + 1).toLowerCase() : null;
  };

  const baseName = getBaseName(nameOrUrl);
  const currentExt = getExtension();
  const extensions = currentExt && exts.includes(currentExt)
    ? [currentExt, ...exts.filter(ext => ext !== currentExt)]
    : exts;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const candidates = React.useMemo(() =>
    extensions.map(ext => asset(`assets/${baseName}.${ext}`)),
    [baseName, JSON.stringify(extensions)]
  );

  const onError = React.useCallback(() => {
    setCurrentIndex(prev => prev + 1 < candidates.length ? prev + 1 : prev);
  }, [candidates.length]);

  const currentSrc = candidates[currentIndex];

  if (!baseName || currentIndex >= candidates.length) return null;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      onError={onError}
    />
  );
};

const CountUpText = ({ targetNumber, duration = 2000, className = "" }) => {
  const [count, setCount] = React.useState(0);
  const countRef = React.useRef(0);

  React.useEffect(() => {
    const increment = targetNumber / (duration / 16);
    const timer = setInterval(() => {
      countRef.current += increment;
      if (countRef.current >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(countRef.current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetNumber, duration]);

  return (
    <span className={`count-up-text ${className}`}>
      {count.toString().padStart(2, '0')}
    </span>
  );
};

// ========================
// LOADING SCREEN
// ========================
const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState('Initializing...');

  React.useEffect(() => {
    const loadSteps = async () => {
      const steps = [
        { progress: 10, text: 'Loading fonts...' },
        { progress: 25, text: 'Loading images...' },
        { progress: 40, text: 'Loading components...' },
        { progress: 55, text: 'Initializing animations...' },
        { progress: 70, text: 'Loading effects...' },
        { progress: 85, text: 'Preparing interface...' },
        { progress: 95, text: 'Finalizing...' },
        { progress: 100, text: 'Complete!' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        setProgress(step.progress);
        setLoadingText(step.text);
      }

      setIsComplete(true);
      setTimeout(() => {
        onLoadingComplete();
      }, 1000);
    };

    loadSteps();
  }, [onLoadingComplete]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div className="dither-background">
        <Suspense fallback={null}>
          <CSSBackground
            color1={[0, 1, 0.53]}
            color2={[0.03, 0.23, 1]}
            animated={true}
          />
        </Suspense>
      </div>

      <div className="loading-content">
        <motion.div
          className="loading-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1>Welcome User</h1>
          <p>{loadingText}</p>
        </motion.div>

        <motion.div
          className="loading-counter"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <CountUpText
            targetNumber={Math.floor(progress)}
            duration={300}
            className="gradient-counter"
          />
          <span className="percent-sign">%</span>
        </motion.div>

        <motion.div
          className="loading-bar"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <motion.div
            className="loading-progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// TARGET CURSOR
// ========================
const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);

  const cornerConfig = useMemo(() => ({
    borderWidth: 3,
    cornerSize: 12,
    parallaxStrength: 0.00005
  }), []);

  const updateCursorPosition = useCallback((x, y) => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: "power3.out"
      });
    }
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    let currentTarget = null;
    let currentTargetMove = null;
    let currentLeaveHandler = null;
    let isAnimating = false;
    let resumeTimeout = null;

    const cleanupTarget = (target) => {
      if (currentTargetMove) target.removeEventListener('mousemove', currentTargetMove);
      if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
      currentTargetMove = null;
      currentLeaveHandler = null;
    };

    // Initialize cursor position and spin
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const startSpinning = () => {
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursor, {
        rotation: '+=360',
        duration: spinDuration,
        ease: 'none'
      });
    };

    startSpinning();

    const handleMouseMove = (e) => updateCursorPosition(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleMouseMove);

    const checkCursorPosition = () => {
      if (!currentTarget || !cursorRef.current) return;
      const x = gsap.getProperty(cursorRef.current, 'x');
      const y = gsap.getProperty(cursorRef.current, 'y');
      const elementAtPoint = document.elementFromPoint(x, y);

      if (elementAtPoint && (elementAtPoint === currentTarget || elementAtPoint.closest(targetSelector) === currentTarget)) {
        return;
      }

      if (currentLeaveHandler) {
        currentLeaveHandler();
      }
    };

    window.addEventListener('scroll', checkCursorPosition, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = () => {
      if (dotRef.current) {
        gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
        gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
      }
    };

    const handleMouseUp = () => {
      if (dotRef.current) {
        gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
        gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const handleMouseOver = (e) => {
      const target = e.target;
      const matches = [];
      let element = target;

      while (element && element !== document.body) {
        if (element.matches(targetSelector)) {
          matches.push(element);
        }
        element = element.parentElement;
      }

      const matchedTarget = matches[0] || null;

      if (!matchedTarget || !cursorRef.current || !cornersRef.current || currentTarget === matchedTarget) {
        return;
      }

      if (currentTarget) {
        cleanupTarget(currentTarget);
      }

      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      currentTarget = matchedTarget;
      gsap.killTweensOf(cursorRef.current, 'rotation');
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      const updateCorners = (clientX, clientY) => {
        const targetRect = matchedTarget.getBoundingClientRect();
        const cursorRect = cursorRef.current.getBoundingClientRect();
        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tl, tr, br, bl] = Array.from(cornersRef.current);
        const { borderWidth, cornerSize, parallaxStrength } = cornerConfig;

        let topLeft = { x: targetRect.left - cursorCenterX - borderWidth, y: targetRect.top - cursorCenterY - borderWidth };
        let topRight = { x: targetRect.right - cursorCenterX + borderWidth - cornerSize, y: targetRect.top - cursorCenterY - borderWidth };
        let bottomRight = { x: targetRect.right - cursorCenterX + borderWidth - cornerSize, y: targetRect.bottom - cursorCenterY + borderWidth - cornerSize };
        let bottomLeft = { x: targetRect.left - cursorCenterX - borderWidth, y: targetRect.bottom - cursorCenterY + borderWidth - cornerSize };

        if (clientX !== undefined && clientY !== undefined) {
          const targetCenterX = targetRect.left + targetRect.width / 2;
          const targetCenterY = targetRect.top + targetRect.height / 2;
          const offsetX = (clientX - targetCenterX) * parallaxStrength;
          const offsetY = (clientY - targetCenterY) * parallaxStrength;

          topLeft.x += offsetX; topLeft.y += offsetY;
          topRight.x += offsetX; topRight.y += offsetY;
          bottomRight.x += offsetX; bottomRight.y += offsetY;
          bottomLeft.x += offsetX; bottomLeft.y += offsetY;
        }

        const tl_gsap = gsap.timeline();
        const corners = [tl, tr, br, bl];
        const positions = [topLeft, topRight, bottomRight, bottomLeft];

        corners.forEach((corner, index) => {
          tl_gsap.to(corner, {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.2,
            ease: 'power2.out'
          }, 0);
        });
      };

      isAnimating = true;
      updateCorners();
      setTimeout(() => { isAnimating = false; }, 1);

      let rafId = null;
      const handleTargetMove = (e) => {
        if (!rafId && !isAnimating) {
          rafId = requestAnimationFrame(() => {
            const event = e;
            updateCorners(event.clientX, event.clientY);
            rafId = null;
          });
        }
      };

      const handleTargetLeave = () => {
        currentTarget = null;
        isAnimating = false;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners);

          const { cornerSize } = cornerConfig;
          const defaultPositions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];

          const tl_leave = gsap.timeline();
          corners.forEach((corner, index) => {
            tl_leave.to(corner, {
              x: defaultPositions[index].x,
              y: defaultPositions[index].y,
              duration: 0.3,
              ease: 'power3.out'
            }, 0);
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!currentTarget && cursorRef.current && spinTl.current) {
            const currentRotation = gsap.getProperty(cursorRef.current, 'rotation') % 360;
            spinTl.current.kill();
            spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
              rotation: '+=360',
              duration: spinDuration,
              ease: 'none'
            });

            gsap.to(cursorRef.current, {
              rotation: currentRotation + 360,
              duration: spinDuration * (1 - currentRotation / 360),
              ease: 'none',
              onComplete: () => {
                spinTl.current?.restart();
              }
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(matchedTarget);
      };

      currentTargetMove = handleTargetMove;
      currentLeaveHandler = handleTargetLeave;

      matchedTarget.addEventListener('mousemove', handleTargetMove);
      matchedTarget.addEventListener('mouseleave', handleTargetLeave);
    };

    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', checkCursorPosition);

      if (currentTarget) {
        cleanupTarget(currentTarget);
      }

      console.log('Cleaning up TargetCursor');
      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, spinDuration, updateCursorPosition, cornerConfig, hideDefaultCursor]);

  useEffect(() => {
    if (!cursorRef.current || !spinTl.current || spinTl.current.isActive()) return;

    spinTl.current.kill();
    spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
      rotation: '+=360',
      duration: spinDuration,
      ease: 'none'
    });
  }, [spinDuration]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

// ========================
// PROFILE CARD COMPONENT
// ========================
const DEFAULT_BEHIND_GRADIENT = "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(150,100%,70%,var(--card-opacity)) 4%,hsla(150,80%,65%,calc(var(--card-opacity)*0.75)) 10%,hsla(150,60%,50%,calc(var(--card-opacity)*0.5)) 50%,hsla(150,40%,30%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ff88c4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00ff88ff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#00ff88ff 0%,#00c1ffff 40%,#00c1ffff 60%,#00ff88ff 100%)";

const DEFAULT_INNER_GRADIENT = "linear-gradient(145deg,#004d2c8c 0%,#00ff8844 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const round = (value, decimals = 3) => parseFloat(value.toFixed(decimals));
const scale = (value, oldMin, oldMax, newMin, newMax) => round(newMin + (newMax - newMin) * (value - oldMin) / (oldMax - oldMin));
const easeOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ProfileCardComponent = ({
  avatarUrl = "<Placeholder for avatar URL>",
  iconUrl = "<Placeholder for icon URL>",
  grainUrl = "<Placeholder for grain URL>",
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = "",
  title = "",
  handle = "",
  status = "",
  contactText = "",
  showUserInfo = true,
  onContactClick
}) => {
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  const tiltLogic = useMemo(() => {
    if (!enableTilt) return null;

    let animationId = null;

    const updateCardTransform = (x, y, container, card) => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const xPercent = clamp((100 / containerWidth) * x);
      const yPercent = clamp((100 / containerHeight) * y);

      const xFromCenter = xPercent - 50;
      const yFromCenter = yPercent - 50;

      const vars = {
        "--pointer-x": `${xPercent}%`,
        "--pointer-y": `${yPercent}%`,
        "--background-x": `${scale(xPercent, 0, 100, 35, 65)}%`,
        "--background-y": `${scale(yPercent, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(yFromCenter, xFromCenter) / 50, 0, 1)}`,
        "--pointer-from-top": `${yPercent / 100}`,
        "--pointer-from-left": `${xPercent / 100}`,
        "--rotate-x": `${round(-(xFromCenter / 5))}deg`,
        "--rotate-y": `${round(yFromCenter / 4)}deg`,
      };

      Object.entries(vars).forEach(([key, value]) => {
        card.style.setProperty(key, value);
      });
    };

    return {
      updateCardTransform,
      createSmoothAnimation: (duration, fromX, fromY, container, card) => {
        const startTime = performance.now();
        const containerCenterX = container.clientWidth / 2;
        const containerCenterY = container.clientHeight / 2;

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = clamp(elapsed / duration);
          const easedProgress = easeOutCubic(progress);

          const currentX = scale(easedProgress, 0, 1, fromX, containerCenterX);
          const currentY = scale(easedProgress, 0, 1, fromY, containerCenterY);

          updateCardTransform(currentX, currentY, container, card);

          if (progress < 1) {
            animationId = requestAnimationFrame(animate);
          }
        };

        animationId = requestAnimationFrame(animate);
      },
      cancelAnimation: () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    };
  }, [enableTilt]);

  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card || !tiltLogic) return;

    const rect = container.getBoundingClientRect();
    tiltLogic.updateCardTransform(
      e.clientX - rect.left,
      e.clientY - rect.top,
      container,
      card
    );
  }, [tiltLogic]);

  const handleMouseEnter = useCallback(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card || !tiltLogic) return;

    tiltLogic.cancelAnimation();
    card.classList.add('active');
    container.classList.add('active');
  }, [tiltLogic]);

  const handleMouseLeave = useCallback((e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card || !tiltLogic) return;

    tiltLogic.createSmoothAnimation(
      ANIMATION_CONFIG.SMOOTH_DURATION,
      e.offsetX,
      e.offsetY,
      container,
      card
    );

    card.classList.remove('active');
    container.classList.remove('active');
  }, [tiltLogic]);

  const handleDeviceOrientation = useCallback((e) => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card || !tiltLogic) return;

    const { beta, gamma } = e;
    if (!beta || !gamma) return;

    tiltLogic.updateCardTransform(
      container.clientHeight / 2 + gamma * mobileTiltSensitivity,
      container.clientWidth / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
      container,
      card
    );
  }, [tiltLogic, mobileTiltSensitivity]);

  useEffect(() => {
    if (!enableTilt || !tiltLogic) return;

    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const mouseMoveHandler = handleMouseMove;
    const mouseEnterHandler = handleMouseEnter;
    const mouseLeaveHandler = handleMouseLeave;
    const orientationHandler = handleDeviceOrientation;

    const handlePermissionRequest = () => {
      if (!enableMobileTilt || location.protocol !== 'https:') return;

      if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        window.DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', orientationHandler);
            }
          })
          .catch(error => console.error(error));
      } else {
        window.addEventListener('deviceorientation', orientationHandler);
      }
    };

    container.addEventListener('pointerenter', mouseEnterHandler);
    container.addEventListener('pointermove', mouseMoveHandler);
    container.addEventListener('pointerleave', mouseLeaveHandler);
    container.addEventListener('click', handlePermissionRequest);

    const initialX = card.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    tiltLogic.updateCardTransform(initialX, initialY, container, card);
    tiltLogic.createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, initialX, initialY, container, card);

    return () => {
      container.removeEventListener('pointerenter', mouseEnterHandler);
      container.removeEventListener('pointermove', mouseMoveHandler);
      container.removeEventListener('pointerleave', mouseLeaveHandler);
      container.removeEventListener('click', handlePermissionRequest);
      window.removeEventListener('deviceorientation', orientationHandler);
      tiltLogic.cancelAnimation();
    };
  }, [enableTilt, enableMobileTilt, tiltLogic, handleMouseMove, handleMouseEnter, handleMouseLeave, handleDeviceOrientation]);

  const cardStyles = useMemo(() => ({
    "--icon": iconUrl && iconUrl !== 'none' ? `url("${iconUrl}")` : 'none',
    "--grain": grainUrl && grainUrl !== 'none' ? `url("${grainUrl}")` : 'none',
    "--behind-gradient": showBehindGradient ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT) : 'none',
    "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
  }), [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]);

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div ref={cardRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyles}>
      <section ref={containerRef} className="pc-card">
        <div className="pc-inside">
          <div className="pc-shine"></div>
          <div className="pc-glare"></div>
          <div className="pc-content pc-avatar-content">
            <SmartImg
              className="avatar"
              src={avatarUrl}
              alt={`${name || 'User'} avatar`}
              loading="lazy"
            />
            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <SmartImg
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name || 'User'} mini avatar`}
                      loading="lazy"
                      className=""
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={handleContactClick}
                  style={{ pointerEvents: 'auto' }}
                  type="button"
                  aria-label={`Contact ${name || 'user'}`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>
          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);

// ========================
// MAIN PORTFOLIO APPLICATION
// ========================
const OptimizedPortfolio = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [backgroundColors, setBackgroundColors] = useState({
    color1: [0.05, 0.05, 0.1],
    color2: [0.15, 0.2, 0.3]
  });

  // Helper function to convert hex to RGB array
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
  };

  // Generate background colors based on section color
  const generateBackgroundColors = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    const color1 = rgb.map(c => c * 0.15);
    const color2 = rgb.map(c => c * 0.35);
    return { color1, color2 };
  };

  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [leftScale, setLeftScale] = useState(1);
  const [rightScale, setRightScale] = useState(1);
  const [leftOffset, setLeftOffset] = useState(0);
  const [rightOffset, setRightOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const scrollCooldownRef = useRef(false);
  const centerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Section definitions
  const sections = [
    {
      id: 0,
      title: "WELCOME",
      subtitle: "MIGUEL A. COMONFORT",
      description: "Game Developer & Front End Engineer",
      color: "#00ff88"
    },
    {
      id: 1,
      title: "ABOUT",
      subtitle: "WHO I AM",
      description: "My name is Miguel A. Comonfort and I'm from the Bay Area. I am a recent graduate from UCSC with a Bacherlors of Science in Computer Science Game Design. My focus is Game Design and Front end Development. When im not suffering debugging my code I have a mixture of interest including playing games like League, Skateboarding, playing tennis, and playing the Alto Saxaphone.",
      color: "#ff6b6b"
    },
    {
      id: 2,
      title: "SKILLS",
      subtitle: "Skills",
      description: "Unity • Unreal Engine • React • C# • JavaScript • Lua • C++ • Blender • Photoshop",
      color: "#4ecdc4"
    },
    {
      id: 3,
      title: "MY WORK",
      subtitle: "",
      description: "",
      color: "#f9ca24"
    },
    {
      id: 4,
      title: "RESUME",
      subtitle: "",
      description: "",
      color: "#6c5ce7"
    },
    {
      id: 5,
      title: "CONNECT",
      subtitle: "",
      description: "",
      color: "#a29bfe"
    }
  ];

  // Contact items for section 5
  const contactItems = [
    { content: "📧 Email Me!", link: "mailto:erqmac@gmail.com", type: "email" },
    { content: "🔗 My LinkedIn", link: "https://linkedin.com/in/miguelcomonfort", type: "external" },
    { content: "🐙 My GitHub", link: "https://github.com/Mported", type: "external" },
    { content: "💼 Available for freelance work", link: "mailto:erqmac@gmail.com?subject=Freelance Project Inquiry", type: "email" },
    { content: "🚀 Wanna Collaborate?", link: "mailto:erqmac@gmail.com?subject=Project Collaboration", type: "email" },
    { content: "📱 My Instagram!", link: "https://instagram.com/miguelseaa", type: "external" },
    { content: "💬 My Discord!", link: "https://discord.com/invite/fuh.", type: "external" }
  ];

  // Orbital radius and positioning
  const orbitalRadius = Math.round(viewportWidth * 0.15);
  const targetDistance = 150;
  const rotationAngle = 40;

  // Navigation function
  const navigateToSection = (direction) => {
    if (transitioning) return;

    setTransitioning(true);
    const totalSections = sections.length;

    if (direction === 'left') {
      setCurrentSectionIndex(prev => (prev - 1 + totalSections) % totalSections);
    } else if (direction === 'right') {
      setCurrentSectionIndex(prev => (prev + 1) % totalSections);
    } else if (typeof direction === 'number') {
      setCurrentSectionIndex((direction % totalSections + totalSections) % totalSections);
    }

    setLeftScale(1);
    setRightScale(1);

    setTimeout(() => setTransitioning(false), 650);
  };

  // Scroll and keyboard handlers
  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollCooldownRef.current) return;

      scrollCooldownRef.current = true;
      if (e.deltaY > 0) {
        navigateToSection('right');
      } else if (e.deltaY < 0) {
        navigateToSection('left');
      }

      setTimeout(() => scrollCooldownRef.current = false, 500);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        navigateToSection('left');
      } else if (e.key === 'ArrowRight') {
        navigateToSection('right');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [transitioning]);

  // Update background colors when section changes
  useEffect(() => {
    const currentSection = sections[currentSectionIndex];
    const newColors = generateBackgroundColors(currentSection.color);
    setBackgroundColors(newColors);
  }, [currentSectionIndex]);

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate positions and scaling
  const totalSections = sections.length;
  const currentIndex = currentSectionIndex;

  const getVisibleSections = () => {
    const visibleSections = [];
    visibleSections.push({ section: sections[currentIndex], pos: 'center', index: currentIndex });

    const leftIndex = (currentSectionIndex - 1 + totalSections) % totalSections;
    const rightIndex = (currentSectionIndex + 1) % totalSections;

    visibleSections.push({ section: sections[leftIndex], pos: 'left', index: leftIndex });
    visibleSections.push({ section: sections[rightIndex], pos: 'right', index: rightIndex });

    return visibleSections;
  };

  // Calculate dynamic scaling and positioning
  useLayoutEffect(() => {
    const calculateScale = (elementRef) => {
      if (!elementRef) return 1;
      const rect = elementRef.getBoundingClientRect();
      const { left, right, width } = rect;
      const windowWidth = window.innerWidth;

      const leftClip = Math.max(0, 28 - left);
      const rightClip = Math.max(0, right - (windowWidth - 28));
      const totalClip = Math.max(leftClip, rightClip);

      if (totalClip <= 0) return 1;

      const visibleRatio = (width - totalClip) / width;
      return Math.max(0.62, Math.min(1, visibleRatio));
    };

    requestAnimationFrame(() => {
      const newLeftScale = calculateScale(leftRef.current);
      const newRightScale = calculateScale(rightRef.current);

      if (Math.abs(newLeftScale - leftScale) > 0.02) {
        setLeftScale(newLeftScale);
      }
      if (Math.abs(newRightScale - rightScale) > 0.02) {
        setRightScale(newRightScale);
      }

      // Calculate collision detection and offsets
      const leftRect = leftRef.current?.getBoundingClientRect();
      const centerRect = centerRef.current?.getBoundingClientRect();
      const rightRect = rightRef.current?.getBoundingClientRect();

      let newLeftOffset = 0;
      let newRightOffset = 0;

      const calculateOverlap = (rect1, rect2) => {
        if (!rect1 || !rect2) return 0;
        const left = Math.max(rect1.left, rect2.left);
        const right = Math.min(rect1.right, rect2.right);
        return Math.max(0, right - left);
      };

      const buffer = 28;

      // Left-Center collision
      const leftCenterOverlap = calculateOverlap(leftRect, centerRect);
      if (leftCenterOverlap > 0) {
        newLeftOffset -= Math.ceil((leftCenterOverlap + buffer) / 2);
      }

      // Center-Right collision
      const centerRightOverlap = calculateOverlap(centerRect, rightRect);
      if (centerRightOverlap > 0) {
        newRightOffset += Math.ceil((centerRightOverlap + buffer) / 2);
      }

      // Left-Right collision
      const leftRightOverlap = calculateOverlap(leftRect, rightRect);
      if (leftRightOverlap > 0) {
        const offsetAmount = Math.ceil((leftRightOverlap + buffer) / 2);
        newLeftOffset -= offsetAmount;
        newRightOffset += offsetAmount;
      }

      // Clamp offsets
      const maxOffset = Math.round(window.innerWidth * 0.1);
      newLeftOffset = Math.max(-maxOffset, Math.min(0, newLeftOffset));
      newRightOffset = Math.min(maxOffset, Math.max(0, newRightOffset));

      setLeftOffset(newLeftOffset);
      setRightOffset(newRightOffset);
    });
  }, [currentSectionIndex, viewportWidth, leftScale, rightScale]);

  // Position calculation function
  const calculatePosition = (position, sectionIndex, currentIndex) => {
    const totalSections = sections.length;

    if (position === 'center') {
      return { x: 0, y: 0, z: 0, ry: 0, sc: 1, op: 1, zi: 30 };
    }

    const angle = ((sectionIndex - currentIndex) * (Math.PI * 2)) / totalSections;
    const x = Math.cos(angle) * orbitalRadius;
    const y = Math.sin(angle) * orbitalRadius * 0.6;
    const z = position === 'left' || position === 'right'
      ? targetDistance * 0.6
      : Math.abs(Math.sin(angle)) * targetDistance;

    return {
      x,
      y,
      z,
      ry: position === 'left' || position === 'right' ? rotationAngle : 0,
      sc: 0.88,
      op: 0.92,
      zi: 15
    };
  };

  // Interactive text component
  const InteractiveText = ({ text, onClick, className, isSelected, color, isCenter }) => (
    <div
      className={`${className} ${isCenter ? 'cursor-target' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
      style={{
        cursor: 'pointer',
        pointerEvents: 'auto',
        color: isCenter ? color : 'transparent',
        WebkitTextStroke: isCenter ? '' : `2px ${color}`,
        textStroke: isCenter ? '' : `2px ${color}`
      }}
    >
      <span className="block">
        <span className="inline-flex word last">
          {text.split('').map((char, index) => (
            <span
              key={`${index}-${char}`}
              className="flex interactive-char"
              style={{
                display: char === ' ' ? 'inline' : 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </span>
    </div>
  );

  // Render orbital section
  const renderOrbitalSection = (section, position, index) => {
    const positionData = calculatePosition(position, index, currentSectionIndex);
    const scale = position === 'left' ? leftScale : position === 'right' ? rightScale : 1;
    const finalScale = positionData.sc * scale;
    const offset = position === 'left' ? leftOffset : position === 'right' ? rightOffset : 0;
    const isCenter = position === 'center' && index === currentSectionIndex;

    const motionProps = {
      x: positionData.x + offset,
      y: positionData.y,
      z: positionData.z,
      rotateY: positionData.ry,
      scale: finalScale,
      opacity: positionData.op
    };

    return (
      <div key={section.id} className="orbital-item">
        <motion.div
          className={`orbital-text orbital-${position} cursor-target`}
          initial={false}
          animate={motionProps}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 20
          }}
          ref={position === 'left' ? leftRef : position === 'right' ? rightRef : centerRef}
          onClick={(e) => {
            e.stopPropagation();
            if (position === 'left') {
              navigateToSection('left');
            } else if (position === 'right') {
              navigateToSection('right');
            }
          }}
          style={{
            zIndex: positionData.zi,
            transformPerspective: 2000,
            backfaceVisibility: 'hidden',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          <InteractiveText
            text={section.title}
            onClick={() => {
              if (position === 'left') {
                navigateToSection('left');
              } else if (position === 'right') {
                navigateToSection('right');
              }
            }}
            className="section-title-text"
            isSelected={index === currentSectionIndex}
            color={section.color}
            isCenter={isCenter}
          />
        </motion.div>
      </div>
    );
  };

  const visibleSections = getVisibleSections();
  const currentSection = sections[currentIndex];

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <AnimatePresence>
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      </AnimatePresence>
    );
  }

  return (
    <div className="meebits-orbital-container">
      {/* Background Effect */}
      <div className="dither-background">
        <CSSBackground
          color1={backgroundColors.color1}
          color2={backgroundColors.color2}
          animated={true}
        />
      </div>

      {/* Target Cursor */}
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={2}
        hideDefaultCursor={true}
      />

      {/* Profile Card - Only on Welcome Section */}
      {currentSectionIndex === 0 && (
        <motion.div
          className="profile-card-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: '5%',
            top: '15%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <ProfileCard
            avatarUrl={resolveAsset('IMG_3641.jpeg')}
            miniAvatarUrl={resolveAsset('IMG_3641.jpeg')}
            name="Miguel Comonfort"
            title="Game Developer & Frontend Engineer"
            handle="miguelseaa"
            status="Available for projects"
            contactText="Contact"
            onContactClick={() => window.open('https://instagram.com/miguelseaa', '_blank')}
          />
        </motion.div>
      )}

      {/* Orbital Sections */}
      <div className="orbital-sections">
        {visibleSections.map(({ section, pos, index }) =>
          renderOrbitalSection(section, pos, index)
        )}
      </div>

      {/* Simple Contact List for Section 5 */}
      {currentSectionIndex === 5 && (
        <motion.div
          className="contact-list-container"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: '10%',
            top: '20%',
            zIndex: 10,
            maxHeight: '60vh',
            overflowY: 'auto'
          }}
        >
          {contactItems.map((item, index) => (
            <motion.div
              key={index}
              className="contact-item cursor-target"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => {
                if (item.link) {
                  if (item.type === 'email') {
                    window.location.href = item.link;
                  } else {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                  }
                }
              }}
              style={{
                padding: '1rem',
                margin: '0.5rem 0',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: item.link ? 'pointer' : 'default',
                color: 'white',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              {item.content}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Section Details */}
      {currentSectionIndex !== 3 && currentSectionIndex !== 4 && (
        <div
          className="section-details"
          style={{
            left: currentSectionIndex === 0 ? '50%' : currentSectionIndex === 1 || currentSectionIndex === 2 ? '35%' : '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <motion.div
            key={currentSection.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="details-content"
          >
            <h2 className="section-subtitle" style={{ color: currentSection.color }}>
              {currentSection.subtitle}
            </h2>
            <p className="section-description">{currentSection.description}</p>
          </motion.div>
        </div>
      )}

      {/* Navigation Hint */}
      <div className="navigation-hint">
        <div className="nav-arrows">
          <span className="arrow-left">←</span>
          <span className="nav-text">CLICK • SCROLL • ⌨︎ ARROWS</span>
          <span className="arrow-right">→</span>
        </div>
      </div>

      {/* Section Indicator */}
      <div className="section-indicator">
        <span className="current-section">{String(currentSectionIndex + 1).padStart(2, '0')}</span>
        <span className="section-divider">/</span>
        <span className="total-sections">{String(sections.length).padStart(2, '0')}</span>
      </div>

      {/* Corner Info */}
      <div className="corner-info top-left">
        <div className="info-label">SECTION</div>
        <div className="info-value">{currentSection.title}</div>
      </div>
    </div>
  );
};

export default OptimizedPortfolio;