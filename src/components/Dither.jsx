import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// WebGL Context Monitoring Utility (local copy for the Dither module)
const WebGLMonitor = {
  contexts: new Set(),
  isMonitoring: false,

  addContext(canvas) {
    if (!this.contexts.has(canvas)) {
      this.contexts.add(canvas);
      this.startMonitoring();
    }
  },

  removeContext(canvas) {
    this.contexts.delete(canvas);
    if (this.contexts.size === 0) {
      this.stopMonitoring();
    }
  },

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    const handleGlobalContextLoss = () => {
      console.warn('Global WebGL context loss detected');
      this.contexts.forEach(canvas => {
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (ctx && ctx.isContextLost && ctx.isContextLost()) {
            console.log('Attempting to recover context for canvas:', canvas);
          }
        }
      });
    };

    window.addEventListener('webglcontextlost', handleGlobalContextLoss, true);
    this.handleGlobalContextLoss = handleGlobalContextLoss;
  },

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.handleGlobalContextLoss) {
      window.removeEventListener('webglcontextlost', this.handleGlobalContextLoss, true);
      this.handleGlobalContextLoss = null;
    }
  }
};

// Shader code
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
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_scale; // controls tile density

varying vec2 vUv;

float bayer4x4[16] = float[16](
  0.0/16.0, 8.0/16.0, 2.0/16.0, 10.0/16.0,
  12.0/16.0, 4.0/16.0, 14.0/16.0, 6.0/16.0,
  3.0/16.0, 11.0/16.0, 1.0/16.0, 9.0/16.0,
  15.0/16.0, 7.0/16.0, 13.0/16.0, 5.0/16.0
);

// Stable, deterministic pseudo-random based on integer coords
float stableRandom(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
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

  // Use a stable tile-based pattern so the dither/pattern does NOT animate.
  // u_scale controls how many pixels map per pattern cell.
  float scale = max(1.0, u_scale);
  vec2 cell = floor(st * u_resolution * scale);

  // Bayer threshold gives a pleasing fixed halftone-ish pattern.
  int cx = int(mod(cell.x, 4.0));
  int cy = int(mod(cell.y, 4.0));
  float b = bayer4x4[cy * 4 + cx];

  // Optionally add a tiny stable random offset per cell for subtle variation
  float rnd = stableRandom(cell);
  float pattern = clamp(b + (rnd - 0.5) * 0.02, 0.0, 1.0);

  vec3 color = mix(u_color1, u_color2, pattern);
  color = dither(color, st);

  gl_FragColor = vec4(color, 1.0);
}
`;

function SimpleDither({
  waveSpeed = 0.02,
  waveScale = 8.0,
  color1 = [0.1, 0.1, 0.2],
  color2 = [0.3, 0.4, 0.5],
  enableMouseInteraction = true,
  mouseRadius = 0.2,
}) {
  const mesh = useRef();
  const { viewport, size, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    WebGLMonitor.addContext(canvas);
    
    let contextLost = false;
    let recoveryTimeout;

    const handleContextLost = (event) => {
      event.preventDefault();
      contextLost = true;
      console.warn('WebGL context lost, pausing rendering...');

      if (gl.render) {
        gl.setAnimationLoop(null);
      }

      if (recoveryTimeout) {
        clearTimeout(recoveryTimeout);
      }

      recoveryTimeout = setTimeout(() => {
        if (contextLost) {
          console.log('Attempting WebGL context recovery...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1000);
    };

  const handleContextRestored = () => {
      contextLost = false;
      console.log('WebGL context restored, resuming rendering...');

      if (recoveryTimeout) {
        clearTimeout(recoveryTimeout);
        recoveryTimeout = undefined;
      }

      gl.setPixelRatio(window.devicePixelRatio);
      gl.setSize(size.width, size.height);
      gl.setClearColor(0x000000, 0);

  if (mesh.current) mesh.current.material.needsUpdate = true;
    };

  canvas.addEventListener('webglcontextlost', handleContextLost, false);
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
  WebGLMonitor.removeContext(canvas);
      if (recoveryTimeout) {
        clearTimeout(recoveryTimeout);
      }
    };
  }, [gl, size]);

  useEffect(() => {
    return () => {
      if (mesh.current) {
        if (mesh.current.geometry) mesh.current.geometry.dispose();
        if (mesh.current.material) mesh.current.material.dispose();
      }
    };
  }, []);

  const uniforms = useMemo(() => ({
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_color1: { value: new THREE.Color(...color1) },
    u_color2: { value: new THREE.Color(...color2) },
    u_scale: { value: waveScale },
  }), [color1, color2, waveScale, size.width, size.height]);

  useFrame(() => {
    if (mesh.current) {
      uniforms.u_resolution.value.set(size.width, size.height);
    }
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={ditherVertexShader}
          fragmentShader={ditherFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export default function Dither({
  waveSpeed = 0.02,
  waveScale = 8.0,
  color1 = [0.1, 0.1, 0.2],
  color2 = [0.3, 0.4, 0.5],
  enableMouseInteraction = true,
  mouseRadius = 0.2,
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: true
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.setClearColor(0x000000, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }}
      onError={(error) => console.error('WebGL Error:', error)}
    >
      <SimpleDither
        waveSpeed={waveSpeed}
        waveScale={waveScale}
        color1={color1}
        color2={color2}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
      />
    </Canvas>
  );
}
