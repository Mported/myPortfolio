// ========================
// DEPENDENCIES & IMPORTS
// External libraries and local modules
// ========================

// React Core
import React, { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback, forwardRef, Suspense, lazy } from 'react';

// Animation Libraries
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Observer } from "gsap/Observer";

// 3D Graphics
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";


// Styles
import './App.css';
import './Dither.css';

// Helper to build public asset URLs that respect Vite base (works in dev and Pages)
const asset = (p) => {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '/');
      // normalize duplicate slashes (not touching schemes as we only build root-relative paths)
      return (`${base}${p}`).replace(/\/{2,}/g, '/');
};

// Resolve images from the public folder for consistent dev + Pages behavior
// Place files under: public/assets/<name>
const resolveAsset = (name) => asset(`assets/${name}`);

// tiny SVG placeholder as data URL (shows when a public asset is missing)
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

// Lazy-load Dither for performance
const Dither = lazy(() => import('./components/Dither'));





// ========================
// UTILITY COMPONENTS
// Small reusable components
// ========================

// Image component that tries multiple extensions in public/assets until one loads
const SmartImg = ({ src: nameOrUrl, alt = '', className = '', loading = 'lazy', style }) => {
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
  // derive basename from provided string (accept full URL or filename)
  const deriveBase = (s) => {
    if (!s) return '';
    // strip query/hash
    const clean = String(s).split('?')[0].split('#')[0];
    // get last path segment
    const last = clean.substring(clean.lastIndexOf('/') + 1);
    // drop extension if present
    const dot = last.lastIndexOf('.');
    return dot > 0 ? last.substring(0, dot) : last;
  };
  const base = deriveBase(nameOrUrl);
  // try original extension first (if provided), then the rest
  const originalExt = (() => {
    const clean = String(nameOrUrl || '');
    const last = clean.split('?')[0].split('#')[0];
    const dot = last.lastIndexOf('.');
    return dot > 0 ? last.substring(dot + 1).toLowerCase() : null;
  })();
  const orderedExts = originalExt && exts.includes(originalExt)
    ? [originalExt, ...exts.filter(e => e !== originalExt)]
    : exts;

  const [idx, setIdx] = React.useState(0);
  const candidates = React.useMemo(
    () => orderedExts.map(ext => asset(`assets/${base}.${ext}`)),
    [base, JSON.stringify(orderedExts)]
  );
  const onError = React.useCallback(() => {
    setIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
  }, [candidates.length]);
  const current = candidates[idx];
  // Hide if we exhausted all candidates
  if (!base || idx >= candidates.length) return null;
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      onError={onError}
    />
  );
};

// CountUp Animation Component
const CountUpText = ({ targetNumber, duration = 2000, className = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const increment = targetNumber / (duration / 16); // 60fps
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
// LOADING SCREEN COMPONENT
// Initial loading screen with progress animation
// ========================

const LoadingScreen = ({ onLoadingComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    // Simulate realistic asset loading
    const loadAssets = async () => {
      const loadingSteps = [
        { progress: 10, text: "Loading fonts..." },
        { progress: 25, text: "Loading images..." },
        { progress: 40, text: "Loading 3D assets..." },
        { progress: 55, text: "Initializing animations..." },
        { progress: 70, text: "Loading shaders..." },
        { progress: 85, text: "Preparing components..." },
        { progress: 95, text: "Finalizing..." },
        { progress: 100, text: "Complete!" }
      ];
      
      for (const step of loadingSteps) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        setLoadingProgress(step.progress);
        setLoadingText(step.text);
      }
      
      setIsComplete(true);
      setTimeout(() => {
        onLoadingComplete();
      }, 1000);
    };

    loadAssets();
  }, [onLoadingComplete]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Dither Background */}
      <div className="dither-background">
        <Suspense fallback={null}>
          <Dither
            color1={[0, 1, 0.53]}
            color2={[0.03, 0.23, 1]}
            pixelSize={2.5}
            ditherIntensity={0.12}
            gradientStrength={1.8}
            animated={true}
            waveSpeed={0.4}
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
            targetNumber={Math.floor(loadingProgress)} 
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
            animate={{ scaleX: loadingProgress / 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};


/* ======================== */
    /* Target Cursor Component */
/* ======================== */


// ========================
// CURSOR COMPONENT
// Custom animated cursor system
// ========================

const TargetCursor = ({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const spinTl = useRef(null);
  const dotRef = useRef(null);
  const constants = useMemo(
    () => ({
      borderWidth: 3,
      cornerSize: 12,
      parallaxStrength: 0.00005,
    }),
    []
  );

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.1,
      ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    if (!cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll(".target-cursor-corner");

    let activeTarget = null;
    let currentTargetMove = null;
    let currentLeaveHandler = null;
    let isAnimatingToTarget = false;
    let resumeTimeout = null;

    const cleanupTarget = (target) => {
      if (currentTargetMove) {
        target.removeEventListener("mousemove", currentTargetMove);
      }
      if (currentLeaveHandler) {
        target.removeEventListener("mouseleave", currentLeaveHandler);
      }
      currentTargetMove = null;
      currentLeaveHandler = null;
    };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const createSpinTimeline = () => {
      if (spinTl.current) {
        spinTl.current.kill();
      }
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursor, { rotation: "+=360", duration: spinDuration, ease: "none" });
    };

    createSpinTimeline();

    const moveHandler = (e) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      
      const mouseX = gsap.getProperty(cursorRef.current, "x");
      const mouseY = gsap.getProperty(cursorRef.current, "y");
      
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget = elementUnderMouse && (
        elementUnderMouse === activeTarget || 
        elementUnderMouse.closest(targetSelector) === activeTarget
      );
      
      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });

    //---------------------------------------------------------------
    // This code for onclick animation

    window.addEventListener("mousemove", moveHandler);
    const mouseDownHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };

    // Animate it back to its original size
    const mouseUpHandler = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    //----------------------------------------------------------------
    const enterHandler = (e) => {
      const directTarget = e.target;

      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }

      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;

      if (activeTarget === target) return;

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;

      gsap.killTweensOf(cursorRef.current, "rotation");
      spinTl.current?.pause();

      gsap.set(cursorRef.current, { rotation: 0 });

      const updateCorners = (mouseX, mouseY) => {
        const rect = target.getBoundingClientRect();
        const cursorRect = cursorRef.current.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = Array.from(cornersRef.current);

        const { borderWidth, cornerSize, parallaxStrength } = constants;

        let tlOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.top - cursorCenterY - borderWidth,
        };
        let trOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.top - cursorCenterY - borderWidth,
        };
        let brOffset = {
          x: rect.right - cursorCenterX + borderWidth - cornerSize,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
        };
        let blOffset = {
          x: rect.left - cursorCenterX - borderWidth,
          y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
        };

        if (mouseX !== undefined && mouseY !== undefined) {
          const targetCenterX = rect.left + rect.width / 2;
          const targetCenterY = rect.top + rect.height / 2;
          const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
          const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;

          tlOffset.x += mouseOffsetX;
          tlOffset.y += mouseOffsetY;
          trOffset.x += mouseOffsetX;
          trOffset.y += mouseOffsetY;
          brOffset.x += mouseOffsetX;
          brOffset.y += mouseOffsetY;
          blOffset.x += mouseOffsetX;
          blOffset.y += mouseOffsetY;
        }

        const tl = gsap.timeline();
        const corners = [tlc, trc, brc, blc];
        const offsets = [tlOffset, trOffset, brOffset, blOffset];

        corners.forEach((corner, index) => {
          tl.to(
            corner,
            {
              x: offsets[index].x,
              y: offsets[index].y,
              duration: 0.2,
              ease: "power2.out",
            },
            0
          );
        });
      };

      isAnimatingToTarget = true;
      updateCorners();

      setTimeout(() => {
        isAnimatingToTarget = false;
      }, 1);

      let moveThrottle = null;
      const targetMove = (ev) => {
        if (moveThrottle || isAnimatingToTarget) return;
        moveThrottle = requestAnimationFrame(() => {
          const mouseEvent = ev;
          updateCorners(mouseEvent.clientX, mouseEvent.clientY);
          moveThrottle = null;
        });
      };

      const leaveHandler = () => {
        activeTarget = null;
        isAnimatingToTarget = false;

        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners);

          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
          ];

          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: "power3.out",
              },
              0
            );
          });
        }

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current && spinTl.current) {
            const currentRotation = gsap.getProperty(
              cursorRef.current,
              "rotation"
            );
            const normalizedRotation = currentRotation % 360;

            spinTl.current.kill();
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current, { rotation: "+=360", duration: spinDuration, ease: "none" });

            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: "none",
              onComplete: () => {
                spinTl.current?.restart();
              },
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentTargetMove = targetMove;
      currentLeaveHandler = leaveHandler;

      target.addEventListener("mousemove", targetMove);
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler);
      window.removeEventListener("scroll", scrollHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      console.log("Cleaning up TargetCursor");

      spinTl.current?.kill();
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor]);

  useEffect(() => {
    if (!cursorRef.current || !spinTl.current) return;

    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap
        .timeline({ repeat: -1 })
        .to(cursorRef.current, { rotation: "+=360", duration: spinDuration, ease: "none" });
    }
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



/* ======================== */
    /* Profile Card Component */
/* ======================== */

// ========================
// PROFILE CARD CONSTANTS
// Configuration and styling constants
// ========================

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(150,100%,70%,var(--card-opacity)) 4%,hsla(150,80%,65%,calc(var(--card-opacity)*0.75)) 10%,hsla(150,60%,50%,calc(var(--card-opacity)*0.5)) 50%,hsla(150,40%,30%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ff88c4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00ff88ff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#00ff88ff 0%,#00c1ffff 40%,#00c1ffff 60%,#00ff88ff 100%)";

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#004d2c8c 0%,#00ff8844 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

const round = (value, precision = 3) =>
  parseFloat(value.toFixed(precision));

const adjust = (
  value,
  fromMin,
  fromMax,
  toMin,
  toMax
) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// ========================
// PROFILE CARD COMPONENT
// Interactive holographic profile card
// ========================

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
  onContactClick,
}) => {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;

    let rafId = null;

    const updateCardTransform = (
      offsetX,
      offsetY,
      card,
      wrap
    ) => {
      const width = card.clientWidth;
      const height = card.clientHeight;

      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };

      Object.entries(properties).forEach(([property, value]) => {
        wrap.style.setProperty(property, value);
      });
    };

    const createSmoothAnimation = (
      duration,
      startX,
      startY,
      card,
      wrap
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const animationLoop = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjust(easedProgress, 0, 1, startX, targetX);
        const currentY = adjust(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, card, wrap);

        if (progress < 1) {
          rafId = requestAnimationFrame(animationLoop);
        }
      };

      rafId = requestAnimationFrame(animationLoop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
    };
  }, [enableTilt]);

  const handlePointerMove = useCallback(
    (event) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      const rect = card.getBoundingClientRect();
      animationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        card,
        wrap
      );
    },
    [animationHandlers]
  );

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap || !animationHandlers) return;

    animationHandlers.cancelAnimation();
    wrap.classList.add("active");
    card.classList.add("active");
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (event) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        card,
        wrap
      );
      wrap.classList.remove("active");
      card.classList.remove("active");
    },
    [animationHandlers]
  );

  const handleDeviceOrientation = useCallback(
    (event) => {
      const card = cardRef.current;
      const wrap = wrapRef.current;

      if (!card || !wrap || !animationHandlers) return;

      const { beta, gamma } = event;
      if (!beta || !gamma) return;

      animationHandlers.updateCardTransform(
        card.clientHeight / 2 + gamma * mobileTiltSensitivity,
        card.clientWidth / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        card,
        wrap
      );
    },
    [animationHandlers, mobileTiltSensitivity]
  );

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;

    const card = cardRef.current;
    const wrap = wrapRef.current;

    if (!card || !wrap) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnter;
    const pointerLeaveHandler = handlePointerLeave;
    const deviceOrientationHandler = handleDeviceOrientation;

    const handleClick = () => {
      if (!enableMobileTilt || location.protocol !== 'https:') return;
      if (
        typeof window.DeviceOrientationEvent !== "undefined" &&
        typeof window.DeviceOrientationEvent.requestPermission === "function"
      ) {
        window.DeviceOrientationEvent
          .requestPermission()
          .then(state => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', deviceOrientationHandler);
            }
          })
          .catch(err => console.error(err));
      } else {
        window.addEventListener('deviceorientation', deviceOrientationHandler);
      }
    };

    card.addEventListener("pointerenter", pointerEnterHandler);
    card.addEventListener("pointermove", pointerMoveHandler);
    card.addEventListener("pointerleave", pointerLeaveHandler);
    card.addEventListener("click", handleClick);

    const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      card,
      wrap
    );

    return () => {
      card.removeEventListener("pointerenter", pointerEnterHandler);
      card.removeEventListener("pointermove", pointerMoveHandler);
      card.removeEventListener("pointerleave", pointerLeaveHandler);
      card.removeEventListener("click", handleClick);
      window.removeEventListener('deviceorientation', deviceOrientationHandler);
      animationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    enableMobileTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleDeviceOrientation,
  ]);

  const cardStyle = useMemo(
    () =>
    ({
      "--icon": iconUrl && iconUrl !== "none" ? `url("${iconUrl}")` : "none",
      "--grain": grainUrl && grainUrl !== "none" ? `url("${grainUrl}")` : "none",
      "--behind-gradient": showBehindGradient
        ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
        : "none",
      "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
    }),
    [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]
  );

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      <section ref={cardRef} className="pc-card">
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content pc-avatar-content">
            <SmartImg
              className="avatar"
              src={avatarUrl}
              alt={`${name || "User"} avatar`}
              loading="lazy"
            />
            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <SmartImg
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name || "User"} mini avatar`}
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
                  style={{ pointerEvents: "auto" }}
                  type="button"
                  aria-label={`Contact ${name || "user"}`}
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
// MAIN APP COMPONENT
// Portfolio application orchestrator
// ========================

const myPortfolio = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [backgroundColors, setBackgroundColors] = useState({ color1: [0.05, 0.05, 0.1], color2: [0.15, 0.2, 0.3] });

  // Helper function to convert hex to RGB array
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
  };

  // Create background colors from section color
  const createBackgroundColors = (sectionColor) => {
    const rgb = hexToRgb(sectionColor);
    // Create darker versions for background
    const color1 = rgb.map(c => c * 0.15); // Very dark base
    const color2 = rgb.map(c => c * 0.35); // Slightly lighter accent
    return { color1, color2 };
  };

  // === Layout/anim helpers ===
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [scaleLeftFit, setScaleLeftFit] = useState(1);
  const [scaleRightFit, setScaleRightFit] = useState(1);
  const [offsetLeftX, setOffsetLeftX] = useState(0);
  const [offsetRightX, setOffsetRightX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wheelLock = useRef(false);

  // Center text full color effect

  const centerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const sections = [
    { id: 0, title: "WELCOME",    subtitle: "MIGUEL A. COMONFORT",  description: "Game Developer & Front End Engineer", color: "#00ff88" },
    { id: 1, title: "ABOUT",      subtitle: "WHO I AM",   description: "My name is Miguel A. Comonfort and I'm from the Bay Area. I am a recent graduate from UCSC with a Bacherlors of Science in Computer Science Game Design. My focus is Game Design and Front end Development. When im not suffering debugging my code I have a mixture of interest including playing games like League, Skateboarding, playing tennis, and playing the Alto Saxaphone.", color: "#ff6b6b" },
    { id: 2, title: "SKILLS",     subtitle: "Skills",  description: "Unity • Unreal Engine • React • C# • JavaScript • Lua • C++ • Blender • Photoshop", color: "#4ecdc4" },
    { id: 3, title: "MY WORK",    subtitle: "",    description: "", color: "#f9ca24" },
    { id: 4, title: "RESUME", subtitle: "", description: "", color: "#6c5ce7" },
    { id: 5, title: "CONNECT",    subtitle: "", description: "", color: "#a29bfe" }
  ];

  // Contact items for infinite scroll
  const contactItems = [
    {
      content: "📧 Email Me!",
      link: "mailto:erqmac@gmail.com",
      type: "email"
    },
    {
      content: "🔗 My LinkedIn",
      link: "https://linkedin.com/in/miguelcomonfort",
      type: "external"
    },
    {
      content: "🐙 My GitHub",
      link: "https://github.com/Mported",
      type: "external"
    },
    {
      content: "💼 Available for freelance work",
      link: "mailto:erqmac@gmail.com?subject=Freelance Project Inquiry",
      type: "email"
    },
    {
      content: "🚀 Wanna Collaborate?",
      link: "mailto:erqmac@gmail.com?subject=Project Collaboration",
      type: "email"
    },
    {
      content: "📱 My Instagram!",
      link: "https://instagram.com/miguelseaa",
      type: "external"
    },
    {
      content: "💬 My Discord!",
      link: "https://discord.com/invite/fuh.",
      type: "external"
    }
  ];



  // Hexagonal orbital positioning with much closer spacing
  const orbitRadius = Math.round(vw * 0.15); // orbit band spacing
  const hexDepth = 150; // depth for closer sections
  const hexAngle = 40; // angle for subtler 3D effect

  const goToSection = (dirOrIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const total = sections.length;

    if (dirOrIndex === 'left')  setCurrentSectionIndex(p => (p - 1 + total) % total);
    else if (dirOrIndex === 'right') setCurrentSectionIndex(p => (p + 1) % total);
    else if (typeof dirOrIndex === 'number') setCurrentSectionIndex(((dirOrIndex % total) + total) % total);

    setScaleLeftFit(1);
    setScaleRightFit(1);

    setTimeout(() => setIsTransitioning(false), 650);
  };

  // Wheel + arrows
  useEffect(() => {
    const onWheel = (e) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      if (e.deltaY > 0) goToSection('right'); else if (e.deltaY < 0) goToSection('left');
      setTimeout(() => (wheelLock.current = false), 500);
    };
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goToSection('left');
      if (e.key === 'ArrowRight') goToSection('right');
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [isTransitioning]);

  // Update background colors when section changes with animation
  useEffect(() => {
    const currentSection = sections[currentSectionIndex];
    const newColors = createBackgroundColors(currentSection.color);
    setBackgroundColors(newColors);
  }, [currentSectionIndex]);

  // Resize
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate visible sections for hexagonal orbit (show 3 main positions)
  const total = sections.length;
  const centerIndex = currentSectionIndex;
  
  // Get adjacent sections for hexagonal positioning
  const getVisibleSections = () => {
    const visibleSections = [];
    
    // Always show center
    visibleSections.push({
      section: sections[centerIndex],
      pos: 'center',
      index: centerIndex
    });
    
    // Show left and right sections
    const leftIndex = (currentSectionIndex - 1 + total) % total;
    const rightIndex = (currentSectionIndex + 1) % total;
    
    visibleSections.push({
      section: sections[leftIndex],
      pos: 'left',
      index: leftIndex
    });
    
    visibleSections.push({
      section: sections[rightIndex],
      pos: 'right', 
      index: rightIndex
    });
    
    return visibleSections;
  };
  
  const visibleSections = getVisibleSections();

  // Fit/overlap solver
  useLayoutEffect(() => {
    const margin = 28;

    const fitOne = (el) => {
      if (!el) return 1;
      const rect = el.getBoundingClientRect();
      const { left, right, width } = rect;
      const vw = window.innerWidth;

      const overshootLeft  = Math.max(0, margin - left);
      const overshootRight = Math.max(0, right - (vw - margin));
      const overshoot = Math.max(overshootLeft, overshootRight);

      if (overshoot <= 0) return 1;
      const needed = (width - overshoot) / width;
      return Math.max(0.62, Math.min(1, needed));
    };

    requestAnimationFrame(() => {
      const leftFit = fitOne(leftRef.current);
      const rightFit = fitOne(rightRef.current);
      if (Math.abs(leftFit - scaleLeftFit) > 0.02) setScaleLeftFit(leftFit);
      if (Math.abs(rightFit - scaleRightFit) > 0.02) setScaleRightFit(rightFit);

      const L = leftRef.current?.getBoundingClientRect();
      const C = centerRef.current?.getBoundingClientRect();
      const R = rightRef.current?.getBoundingClientRect();

      let pushLeft = 0;
      let pushRight = 0;

      const overlapX = (a, b) => {
        if (!a || !b) return 0;
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        return Math.max(0, right - left);
      };

      const desiredGap = margin;

      const lc = overlapX(L, C);
      if (lc > 0) pushLeft -= Math.ceil((lc + desiredGap) / 2);

      const cr = overlapX(C, R);
      if (cr > 0) pushRight += Math.ceil((cr + desiredGap) / 2);

      const lr = overlapX(L, R);
      if (lr > 0) {
        const half = Math.ceil((lr + desiredGap) / 2);
        pushLeft -= half; pushRight += half;
      }

      const maxPush = Math.round(window.innerWidth * 0.1);
      pushLeft = Math.max(-maxPush, Math.min(0, pushLeft));
      pushRight = Math.min(maxPush, Math.max(0, pushRight));

      setOffsetLeftX(pushLeft);
      setOffsetRightX(pushRight);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, vw, scaleLeftFit, scaleRightFit]);

  // Hexagonal pose helper with calculated positions
  const pose = (pos, sectionIndex, currentIndex) => {
    const totalSections = sections.length;
    
    if (pos === 'center') {
      return { 
        x: 0, 
        y: 0,
        z: 0, 
        ry: 0, 
        sc: 1.0, 
        op: 1.0, 
        zi: 30 
      };
    }
    
    // Calculate hexagonal positions
    // For hexagon, we want 6 positions around a circle (60° apart)
    const angleStep = (Math.PI * 2) / totalSections; // 360° / 6 sections = 60° each
    const relativeIndex = sectionIndex - currentIndex;
    const angle = relativeIndex * angleStep;
    
    // Calculate hexagonal coordinates
    const hexX = Math.cos(angle) * orbitRadius;
    const hexY = Math.sin(angle) * orbitRadius * 0.6; // Flatten Y for more horizontal spread
    
    // Make left and right sections have same Z depth, reduced for closer visibility
    const hexZ = pos === 'left' || pos === 'right' ? hexDepth * 0.6 : Math.abs(Math.sin(angle)) * hexDepth;
    
    // Make both left and right face the opposite direction (positive angle)
    const rotation = pos === 'left' ? hexAngle : pos === 'right' ? hexAngle : 0;
    
    return { 
      x: hexX, 
      y: hexY,
      z: hexZ, 
      ry: rotation, 
      sc: 0.88, 
      op: 0.92, 
      zi: 15 
    };
  };


  // Per-title letters with full color for center text
  const InteractiveText = ({ text, onClick, className, isSelected, color, isCenter }) => {
    return (
      <div
        className={`${className} ${isCenter ? 'cursor-target' : ''}`}
        onClick={(e)=>{e.stopPropagation(); onClick && onClick();}}
        style={{ 
          cursor:'pointer', 
          pointerEvents:'auto', 
          color: isCenter ? color : 'transparent', // Full color for center, transparent for sides
          WebkitTextStroke: isCenter ? '' : `2px ${color}`, // No stroke for center, stroke for sides
          textStroke: isCenter ? '' : `2px ${color}` 
        }}
      >
        <span className="block">
          <span className="inline-flex word last">
            {text.split('').map((ch, i) => (
              <span
                key={`${i}-${ch}`}
                className="flex interactive-char"
                style={{
                  display: ch === ' ' ? 'inline' : 'inline-flex',
                  alignItems:'center', justifyContent:'center'
                }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </span>
        </span>
      </div>
    );
  };

  const renderItem = (section, pos, index) => {
    const p = pose(pos, index, currentSectionIndex);
    const fitScale = pos === 'left' ? scaleLeftFit : pos === 'right' ? scaleRightFit : 1;
    const finalScale = p.sc * fitScale;
    const extraX = pos === 'left' ? offsetLeftX : pos === 'right' ? offsetRightX : 0;

    // click-to-rotate for center only
    const isCenter = pos === 'center' && index === currentSectionIndex;

    // Hexagonal transform with Y positioning
    const baseAnim = { 
      x: p.x + extraX, 
      y: p.y, // Use calculated Y position for hexagonal layout
      z: p.z, 
      rotateY: p.ry, 
      scale: finalScale, 
      opacity: p.op 
    };

    return (
      <div key={section.id} className="orbital-item">
        <motion.div
          className={`orbital-text orbital-${pos} cursor-target`}
          initial={false}
          animate={baseAnim}
          transition={{ type:"spring", stiffness:90, damping:20 }}
          ref={ pos === 'left' ? leftRef : pos === 'right' ? rightRef : centerRef }
          onClick={(e) => {
            e.stopPropagation();
            if (pos === 'left')  goToSection('left');
            if (pos === 'right') goToSection('right');
          }}
          style={{ 
            zIndex: p.zi, 
            transformPerspective: 2000, 
            backfaceVisibility:'hidden',
            pointerEvents: 'auto', // Ensure mouse events work
            cursor: 'pointer'
          }}
        >
          {/* No spin animation - direct text rendering */}
          <InteractiveText
            text={section.title}
            onClick={() => {
              if (pos === 'left') goToSection('left');
              if (pos === 'right') goToSection('right');
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

  const center = sections[centerIndex];

  // Handle loading completion
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
      {/* Dither Background */}
      <div className="dither-background">
        <Dither
          color1={backgroundColors.color1}
          color2={backgroundColors.color2}
          pixelSize={isTransitioning ? 1.8 : 2.2}
          ditherIntensity={isTransitioning ? 0.16 : 0.1}
          gradientStrength={isTransitioning ? 2.2 : 1.6}
          animated={true}
          waveSpeed={isTransitioning ? 0.6 : 0.35}
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

      {/* Hexagonal orbit sections */}
      <div className="orbital-sections">
        {visibleSections.map(({ section, pos, index }) => 
          renderItem(section, pos, index)
        )}
      </div>

      {/* SpotlightCard - Only on RESUME Section */}
      {currentSectionIndex === 4 && (
        <motion.div
          className="spotlight-card-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: '5%',
            top: '15%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            width: '55vw',
            height: '70vh',
          }}
        >
          <SpotlightCard 
            className="resume-spotlight-card"
            spotlightColor="rgba(108, 92, 231, 0.3)"
          >
            <div className="resume-content">
              <div className="resume-header">
                <h3>My Resume</h3>
                <p>Click to download PDF</p>
              </div>
              <div className="resume-preview">
                <iframe
                  src={asset('assets/miguelComonfortResumePortfolio.pdf')}
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    borderRadius: '12px',
                    background: '#fff'
                  }}
                  title="Resume Preview"
                />
              </div>
              <div className="resume-actions">
                <a
                  href={asset('assets/miguelComonfortResumePortfolio.pdf')}
                  download="miguelComonfortResumePortfolio.pdf"
                  className="download-btn cursor-target"
                >
                  Download Resume
                </a>
                <a
                  href={asset('assets/miguelComonfortResumePortfolio.pdf')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-btn cursor-target"
                >
                  View Full Screen
                </a>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      )}

      {/* Bento Grid - Only on MY WORK Section */}
      {currentSectionIndex === 3 && (
        <motion.div
          className="bento-grid-container"
          initial={{ opacity: 0, scale: 0.9, x: -50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: '5%',
            top: '10%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            width: '55vw',
            height: '85vh',
            maxHeight: '85vh',
            overflowY: 'hidden'
          }}
        >
          <MagicBento 
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
          />
        </motion.div>
      )}

      {/* InfiniteScroll - Only on CONNECT Section */}
      {currentSectionIndex === 5 && (
        <InfiniteScroll
          width="100%"
          maxHeight="100%"
          items={contactItems}
          itemMinHeight={150}
          isTilted={true}
          tiltDirection="left"
          autoplay={true}
          autoplaySpeed={0.5}
          autoplayDirection="left"
          pauseOnHover={false}
          orientation="vertical"
          style={{
            position: 'fixed',
            left: '0%',
            top: '0%',
            transform: 'translateY(0%)',
            zIndex: 10,
            height: '100vh',
            width: '90vw'
          }}
        />
      )}

      {/* Details - Hidden on MY WORK and RESUME sections, but visible on CONNECT */}
      {currentSectionIndex !== 3 && currentSectionIndex !== 4 && (
        <div className="section-details" style={{
          left: currentSectionIndex === 0 ? '50%' : currentSectionIndex === 1 || currentSectionIndex === 2 ? '35%' : '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <motion.div
            key={center.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="details-content"
          >
            <h2 className="section-subtitle" style={{ color: center.color }}>{center.subtitle}</h2>
            <p className="section-description">{center.description}</p>
          </motion.div>
        </div>
      )}

      {/* UI bits */}
      <div className="navigation-hint">
        <div className="nav-arrows">
          <span className="arrow-left">←</span>
          <span className="nav-text">CLICK • SCROLL • ⌨︎ ARROWS</span>
          <span className="arrow-right">→</span>
        </div>
      </div>

      <div className="section-indicator">
        <span className="current-section">{String(currentSectionIndex + 1).padStart(2, '0')}</span>
        <span className="section-divider">/</span>
        <span className="total-sections">{String(sections.length).padStart(2, '0')}</span>
      </div>


      <div className="corner-info top-left">
        <div className="info-label">SECTION</div>
        <div className="info-value">{center.title}</div>
      </div>
    </div>
  );

};

/* ======================== */
/* Dither Background effect */
/* ======================== */

// ========================
// SHADER DEFINITIONS
// WebGL shaders for visual effects
// ========================

// Dither Effect Vertex Shader
const ditherVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ditherFragmentShader = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_speed;
uniform float u_scale;
uniform vec2 u_mouse;
uniform float u_mouseRadius;
uniform bool u_enableMouse;

varying vec2 vUv;

// Bayer matrix for dithering
float bayer4x4[16] = float[16](
  0.0/16.0, 8.0/16.0, 2.0/16.0, 10.0/16.0,
  12.0/16.0, 4.0/16.0, 14.0/16.0, 6.0/16.0,
  3.0/16.0, 11.0/16.0, 1.0/16.0, 9.0/16.0,
  15.0/16.0, 7.0/16.0, 13.0/16.0, 5.0/16.0
);

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec3 dither(vec3 color, vec2 uv) {
  vec2 pixelCoord = floor(uv * u_resolution);
  int x = int(mod(pixelCoord.x, 4.0));
  int y = int(mod(pixelCoord.y, 4.0));
  float threshold = bayer4x4[y * 4 + x];
  
  vec3 dithered = color;
  dithered += (threshold - 0.5) * 0.1;
  
  return floor(dithered * 4.0 + 0.5) / 4.0;
}

void main() {
  vec2 st = vUv;
  
  // Create more complex animated pattern with multiple layers
  float n1 = noise(st * u_scale + u_time * u_speed);
  float n2 = noise(st * u_scale * 1.5 - u_time * u_speed * 0.7);
  float n3 = noise(st * u_scale * 0.5 + u_time * u_speed * 0.3);
  
  // Combine noise layers for richer patterns
  float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  
  // Add time-based color shifting
  float timeShift = sin(u_time * 0.5) * 0.1;
  pattern += timeShift;
  
  // Mouse interaction with improved falloff
  if (u_enableMouse) {
    vec2 mouseUv = u_mouse / u_resolution;
    float dist = distance(st, mouseUv);
    float influence = 1.0 - smoothstep(0.0, u_mouseRadius, dist);
    influence = pow(influence, 2.0); // Smoother falloff
    pattern += influence * 0.4;
  }
  
  // Smooth pattern clamping
  pattern = smoothstep(0.0, 1.0, pattern);
  
  // Mix colors based on pattern
  vec3 color = mix(u_color1, u_color2, pattern);
  
  // Apply enhanced dithering
  color = dither(color, st);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

// ========================
// DITHER EFFECT COMPONENTS
// Advanced visual effects using shaders
// ========================

// Old SimpleDither removed - now using optimized Dither component from components/Dither.jsx


/* ======================== */
    /* About Section */
/* ======================== */




/* ======================== */
    /* Skills Section */
/* ======================== */


/* ======================== */
    /* My Work Section */
/* ======================== */

// ========================
// BENTO GRID CONSTANTS
// Configuration for the project showcase
// ========================

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const MOBILE_BREAKPOINT = 768;

// Project Data Configuration
const cardData = [
  {
    color: "#060010",
    title: "Client Request",
    description: "HTML site to help construction workers estimate cost around the Bay Area.",
    label: "Construction Calculator",
  image: resolveAsset('constructionCalcSS.png'),
    link: "https://mported.github.io/BayAreaConstructionCostCalculator/"
  },
  {
    color: "#060010",
    title: "React Portfolio",
    description: "Interactive portfolio website",
    label: "Web Dev",
  image: resolveAsset('portfolioSS.png'),
    link: "https://mported.dev/"
  },
  {
    color: "#060010",
    title: "GalaDeer",
    description: "Playing Card Programmed in Lua",
    label: "Inspired by Marvel Snap",
  image: resolveAsset('galadeerSS.jpg'),
    link: "https://github.com/Mported/Project3---GalaDeer"
  },
  {
    color: "#060010",
    title: "Severence : Get to the OTC!",
    description: "A game inspired by the show \"Severance\"",
    label: "JavaScript Game utilizing the Phaser Index",
  image: resolveAsset('severenceSS.png'),
    link: "https://mported.github.io/MakeAFakeFinal/"
  },
  {
    color: "#060010",
    title: "Solitaire",
    description: "Recreating one of my favorite games",
    label: "Programmed in Lua",
  image: resolveAsset('solitaireSS.jpg'),
    link: "https://github.com/Mported/solitaireGame"
  },
  {
    color: "#060010",
    title: "LEBRON WATCH OUT",
    description: "Funny Lebron Game",
    label: "Phaser Index Work",
  image: resolveAsset('lebronSS.png'),
    link: "https://mported.github.io/endlessRunner/"
  },
];

// ========================
// BENTO GRID UTILITIES
// Helper functions for particle and spotlight effects
// ========================

// Particle Creation Utility
const createParticleElement = (
  x,
  y,
  color = DEFAULT_GLOW_COLOR
) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card,
  mouseX,
  mouseY,
  glow,
  radius
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

// ========================
// BENTO GRID COMPONENTS
// Interactive project showcase cards
// ========================

// Individual Project Card with Particles
const ParticleCard = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onClick = null,
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e) => {
      // Handle external onClick first
      if (onClick) {
        onClick(e);
      }

      // Then handle ripple effect
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    onClick,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

// Global Spotlight Effect
const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll(".card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          card.style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll(".card").forEach((card) => {
        card.style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// Main Bento Grid Container
const BentoCardGrid = ({
  children,
  gridRef
}) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

// ========================
// HOOKS & UTILITIES
// Custom hooks and utility functions
// ========================

// Mobile Detection Hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Magic Bento Grid Main Component
const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const baseClassName = `card ${textAutoHide ? "card--text-autohide" : ""} ${enableBorderGlow ? "card--border-glow" : ""}`;
          const cardProps = {
            className: baseClassName,
            style: {
              backgroundColor: card.color,
              "--glow-color": glowColor,
            }
          };

          if (enableStars) {
            return (
              <ParticleCard
                key={index}
                {...cardProps}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
                onClick={() => card.link && window.open(card.link, '_blank')}
                style={{
                  ...cardProps.style,
                  cursor: card.link ? 'pointer' : 'default'
                }}
              >
                {card.image && (
                  <div className="card__image">
                    <SmartImg src={card.image} alt={card.title} loading="lazy" />
                  </div>
                )}
                <div className="card__header">
                  <div className="card__label">{card.label}</div>
                </div>
                <div className="card__content">
                  <h2 className="card__title">{card.title}</h2>
                  <p className="card__description">{card.description}</p>
                </div>
              </ParticleCard>
            );
          }

          return (
            <div
              key={index}
              {...cardProps}
              style={{
                ...cardProps.style,
                cursor: card.link ? 'pointer' : 'default'
              }}
              ref={(el) => {
                if (!el) return;

                const handleMouseMove = (e) => {
                  if (shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    gsap.to(el, {
                      rotateX,
                      rotateY,
                      duration: 0.1,
                      ease: "power2.out",
                      transformPerspective: 1000,
                    });
                  }

                  if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.05;
                    const magnetY = (y - centerY) * 0.05;
                    gsap.to(el, {
                      x: magnetX,
                      y: magnetY,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }
                };

                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return;

                  if (enableTilt) {
                    gsap.to(el, {
                      rotateX: 0,
                      rotateY: 0,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }

                  if (enableMagnetism) {
                    gsap.to(el, {
                      x: 0,
                      y: 0,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }
                };

                const handleClick = (e) => {
                  // Handle link redirect first
                  if (card.link) {
                    window.open(card.link, '_blank');
                  }

                  // Then handle ripple effect
                  if (!clickEffect || shouldDisableAnimations) return;

                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                  );

                  const ripple = document.createElement("div");
                  ripple.style.cssText = `
                    position: absolute;
                    width: ${maxDistance * 2}px;
                    height: ${maxDistance * 2}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                    left: ${x - maxDistance}px;
                    top: ${y - maxDistance}px;
                    pointer-events: none;
                    z-index: 1000;
                  `;

                  el.appendChild(ripple);

                  gsap.fromTo(
                    ripple,
                    {
                      scale: 0,
                      opacity: 1,
                    },
                    {
                      scale: 1,
                      opacity: 0,
                      duration: 0.8,
                      ease: "power2.out",
                      onComplete: () => ripple.remove(),
                    }
                  );
                };

                el.addEventListener("mousemove", handleMouseMove);
                el.addEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("click", handleClick);
              }}
            >
              {card.image && (
                <div className="card__image">
                  <SmartImg src={card.image} alt={card.title} loading="lazy" />
                </div>
              )}
              <div className="card__header">
                <div className="card__label">{card.label}</div>
              </div>
              <div className="card__content">
                <h2 className="card__title">{card.title}</h2>
                <p className="card__description">{card.description}</p>
              </div>
            </div>
          );
        })}
      </BentoCardGrid>
    </>
  );
};


/* ======================== */
    /* Resume Section */
/* ======================== */

// ========================
// SPOTLIGHT COMPONENTS
// Interactive spotlight effect cards
// ========================

// Spotlight Card Component
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }) => {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  );
};

/* ======================== */
    /* Contact Section */
/* ======================== */

gsap.registerPlugin(Observer);

// ========================
// INFINITE SCROLL COMPONENT
// Smooth scrolling contact section
// ========================

function InfiniteScroll({
  width = "30rem",
  maxHeight = "100%",
  negativeMargin = "-0.5em",
  items = [],
  itemMinHeight = 150,
  isTilted = false,
  tiltDirection = "left",
  autoplay = false,
  autoplaySpeed = 0.5,
  autoplayDirection = "down",
  pauseOnHover = false,
  orientation = "vertical",
  style = {},
}) {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);

  const getTiltTransform = () => {
    if (!isTilted) return "none";
    return tiltDirection === "left"
      ? "rotateX(20deg) rotateZ(-20deg) skewX(20deg)"
      : "rotateX(20deg) rotateZ(20deg) skewX(-20deg)";
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (items.length === 0) return;

    const divItems = gsap.utils.toArray(container.children);
    if (!divItems.length) return;

    const firstItem = divItems[0];
    const itemStyle = getComputedStyle(firstItem);
    
    let itemSize, totalSize, wrapFn;
    const isHorizontal = orientation === "horizontal";
    
    if (isHorizontal) {
      const itemWidth = firstItem.offsetWidth;
      const itemMarginLeft = parseFloat(itemStyle.marginLeft) || 0;
      const totalItemWidth = itemWidth + itemMarginLeft;
      totalSize = (itemWidth * items.length) + (itemMarginLeft * (items.length - 1));
      wrapFn = gsap.utils.wrap(-totalSize, totalSize);
      
      divItems.forEach((child, i) => {
        const x = i * totalItemWidth;
        gsap.set(child, { x });
      });
    } else {
      const itemHeight = firstItem.offsetHeight;
      const itemMarginTop = parseFloat(itemStyle.marginTop) || 0;
      const totalItemHeight = itemHeight + itemMarginTop;
      totalSize = (itemHeight * items.length) + (itemMarginTop * (items.length - 1));
      wrapFn = gsap.utils.wrap(-totalSize, totalSize);
      
      divItems.forEach((child, i) => {
        const y = i * totalItemHeight;
        gsap.set(child, { y });
      });
    }

    const observer = Observer.create({
      target: container,
      type: "wheel,touch,pointer",
      preventDefault: true,
      onPress: ({ target }) => {
        target.style.cursor = "grabbing";
      },
      onRelease: ({ target }) => {
        target.style.cursor = "grab";
      },
      onChange: ({ deltaY, deltaX, isDragging, event }) => {
        const delta = isHorizontal ? deltaX : deltaY;
        const d = event.type === "wheel" ? -delta : delta;
        const distance = isDragging ? d * 5 : d * 10;
        const axis = isHorizontal ? "x" : "y";
        
        divItems.forEach((child) => {
          gsap.to(child, {
            duration: 0.5,
            ease: "expo.out",
            [axis]: `+=${distance}`,
            modifiers: {
              [axis]: gsap.utils.unitize(wrapFn)
            }
          });
        });
      }
    });

    let rafId;
    if (autoplay) {
      let directionFactor;
      if (isHorizontal) {
        directionFactor = autoplayDirection === "right" ? 1 : -1;
      } else {
        directionFactor = autoplayDirection === "down" ? 1 : -1;
      }
      const speedPerFrame = autoplaySpeed * directionFactor;
      const axis = isHorizontal ? "x" : "y";

      const tick = () => {
        divItems.forEach((child) => {
          gsap.set(child, {
            [axis]: `+=${speedPerFrame}`,
            modifiers: {
              [axis]: gsap.utils.unitize(wrapFn)
            }
          });
        });
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      if (pauseOnHover) {
        const stopTicker = () => rafId && cancelAnimationFrame(rafId);
        const startTicker = () => (rafId = requestAnimationFrame(tick));

        container.addEventListener("mouseenter", stopTicker);
        container.addEventListener("mouseleave", startTicker);

        return () => {
          observer.kill();
          stopTicker();
          container.removeEventListener("mouseenter", stopTicker);
          container.removeEventListener("mouseleave", startTicker);
        };
      } else {
        return () => {
          observer.kill();
          rafId && cancelAnimationFrame(rafId);
        };
      }
    }

    return () => {
      observer.kill();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    items,
    autoplay,
    autoplaySpeed,
    autoplayDirection,
    pauseOnHover,
    isTilted,
    tiltDirection,
    negativeMargin,
    orientation
  ]);

  return (
    <>
      <style>
        {`
        .infinite-scroll-wrapper {
          max-height: ${maxHeight};
          ${orientation === "horizontal" ? "overflow-x: hidden; overflow-y: visible;" : ""}
        }

        .infinite-scroll-container {
          width: ${width};
          ${orientation === "horizontal" ? "flex-direction: row; width: 100%; height: auto;" : "flex-direction: column;"}
        }

        .infinite-scroll-item {
          ${orientation === "horizontal" ? `width: 250px; height: 250px; margin-right: ${negativeMargin}; margin-top: 0; flex-shrink: 0;` : `height: ${itemMinHeight}px; margin-top: ${negativeMargin};`}
        }
        `}
      </style>

      <div className={`infinite-scroll-wrapper ${orientation === "horizontal" ? "horizontal" : ""}`} ref={wrapperRef} style={style}>
        <div
          className="infinite-scroll-container"
          ref={containerRef}
          style={{
            transform: getTiltTransform(),
          }}
        >
          {items.map((item, i) => (
            <div
              className='infinite-scroll-item cursor-target'
              key={i}
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
                cursor: item.link ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (item.link) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (item.link) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.opacity = '1';
                }
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========================
// EXPORT
// Main application export
// ========================

export default myPortfolio;
