import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ReactBits-inspired optimized dither shaders
const vertex = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = `
precision mediump float;
varying vec2 vUv;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_time;
uniform float u_pixelSize;
uniform float u_ditherIntensity;
uniform float u_gradientStrength;
uniform bool u_animated;

// 8x8 Bayer matrix for higher quality dithering (ReactBits style)
const float bayer8x8[64] = float[64](
	0.0/64.0, 32.0/64.0, 8.0/64.0, 40.0/64.0, 2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
	48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0, 50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
	12.0/64.0, 44.0/64.0, 4.0/64.0, 36.0/64.0, 14.0/64.0, 46.0/64.0, 6.0/64.0, 38.0/64.0,
	60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0, 62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0,
	3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0, 1.0/64.0, 33.0/64.0, 9.0/64.0, 41.0/64.0,
	51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0, 49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
	15.0/64.0, 47.0/64.0, 7.0/64.0, 39.0/64.0, 13.0/64.0, 45.0/64.0, 5.0/64.0, 37.0/64.0,
	63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0, 61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
);

// Improved luminance calculation
float getLuminance(vec3 color) {
	return dot(color, vec3(0.299, 0.587, 0.114));
}

// Modern dithering function with better distribution
vec3 modernDither(vec3 color, vec2 uv) {
	vec2 pixelPos = floor(uv * u_resolution / u_pixelSize);
	int x = int(mod(pixelPos.x, 8.0));
	int y = int(mod(pixelPos.y, 8.0));
	float threshold = bayer8x8[y * 8 + x];

	// Apply dithering with intensity control
	vec3 dithered = color + (threshold - 0.5) * u_ditherIntensity;

	// Quantize to create posterization effect
	return floor(dithered * 16.0 + 0.5) / 16.0;
}

// Enhanced gradient generation with ReactBits-style animation
vec3 createGradient(vec2 uv, float time) {
	vec2 center = vec2(0.5, 0.5);

	if (!u_animated) {
		// Static radial gradient when animation is disabled
		float dist = length(uv - center);
		float gradient = smoothstep(0.0, 1.4, dist * u_gradientStrength);
		return mix(u_color1, u_color2, gradient);
	}

	// Animated version with multiple wave layers for organic movement
	float slowTime = time * 1.0; // Faster base animation for visibility
	float fastTime = time * 2.0; // Faster overlay

	// Create moving center point for organic feel
	vec2 animatedCenter = center + vec2(
		sin(slowTime * 0.7) * 0.15,
		cos(slowTime * 0.5) * 0.12
	);

	float dist = length(uv - animatedCenter);

	// Multiple wave layers for complex, organic animation - enhanced for visibility
	float wave1 = sin(dist * u_gradientStrength * 2.0 + slowTime) * 0.4;
	float wave2 = sin(dist * u_gradientStrength * 3.5 + fastTime * 1.2) * 0.2;
	float wave3 = cos(dist * u_gradientStrength * 1.5 - slowTime * 0.8) * 0.15;

	// Combine waves for smooth, organic movement
	float gradient = 0.5 + wave1 + wave2 + wave3;

	// Add more pronounced breathing effect
	float breath = 0.9 + sin(slowTime * 2.0) * 0.1;
	gradient *= breath;

	// Smooth the gradient for professional look
	gradient = smoothstep(0.0, 1.0, gradient);

	return mix(u_color1, u_color2, gradient);
}

void main() {
	vec2 uv = vUv;

	// Generate base gradient with animation
	vec3 color = createGradient(uv, u_time);

	// Add animated offset to dithering for subtle movement
	vec2 ditherOffset = u_animated ?
		vec2(sin(u_time * 0.2) * 0.5, cos(u_time * 0.15) * 0.5) :
		vec2(0.0);

	// Apply modern dithering with optional offset
	color = modernDither(color, uv + ditherOffset * 0.01);

	// Enhanced grain with animation
	float baseGrain = fract(sin(dot(uv * u_resolution, vec2(12.9898, 78.233))) * 43758.5453);

	if (u_animated) {
		// Add subtle animated grain variation
		float animatedGrain = fract(sin(dot(uv * u_resolution + u_time * 0.1, vec2(4.338, 93.9898))) * 23.4578);
		baseGrain = mix(baseGrain, animatedGrain, 0.3);
	}

	// Apply grain with reduced intensity for performance
	color += (baseGrain - 0.5) * 0.015;

	// Subtle vignette for depth (ReactBits style)
	vec2 center = vec2(0.5);
	float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - center));
	color *= 0.95 + vignette * 0.05;

	gl_FragColor = vec4(color, 1.0);
}
`;

// Memoized geometry and material creation outside component
const PLANE_GEOMETRY = new THREE.PlaneGeometry(1, 1);

function DitherPlane({
	color1 = [0.05, 0.05, 0.12],
	color2 = [0.3, 0.45, 0.6],
	pixelSize = 2.0,
	ditherIntensity = 0.1,
	gradientStrength = 1.5,
	animated = true,
	waveSpeed = 0.02
}) {
	const mesh = useRef();
	const { size, viewport } = useThree();

	// Memoize uniforms with stable references
	const uniforms = useMemo(() => ({
		u_resolution: { value: new THREE.Vector2() },
		u_color1: { value: new THREE.Color() },
		u_color2: { value: new THREE.Color() },
		u_time: { value: 0 },
		u_pixelSize: { value: pixelSize },
		u_ditherIntensity: { value: ditherIntensity },
		u_gradientStrength: { value: gradientStrength },
		u_animated: { value: animated }
	}), [pixelSize, ditherIntensity, gradientStrength, animated]);

	// Update resolution (optimized for performance)
	useEffect(() => {
		if (uniforms.u_resolution.value) {
			uniforms.u_resolution.value.set(size.width, size.height);
		}
	}, [size.width, size.height, uniforms]);

	// Update colors when they change
	useEffect(() => {
		if (uniforms.u_color1.value && uniforms.u_color2.value) {
			uniforms.u_color1.value.setRGB(...color1);
			uniforms.u_color2.value.setRGB(...color2);
		}
	}, [color1, color2, uniforms]);

	// Update other uniforms when props change
	useEffect(() => {
		uniforms.u_pixelSize.value = pixelSize;
		uniforms.u_ditherIntensity.value = ditherIntensity;
		uniforms.u_gradientStrength.value = gradientStrength;
		uniforms.u_animated.value = animated;
	}, [pixelSize, ditherIntensity, gradientStrength, animated, uniforms]);

	// Performance-optimized animation frame with adaptive quality
	const lastFrameTime = useRef(0);
	useFrame(({ clock }) => {
		if (!uniforms.u_time || !animated) return;

		const currentTime = clock.getElapsedTime();

		// Throttle to 60fps for smoother animation (every ~16ms)
		if (currentTime - lastFrameTime.current >= 0.016) {
			uniforms.u_time.value = currentTime * waveSpeed;
			lastFrameTime.current = currentTime;
			// Debug logging
			if (Math.floor(currentTime) % 5 === 0 && currentTime - lastFrameTime.current < 0.1) {
				console.log('Dither animation running:', {
					time: uniforms.u_time.value,
					animated,
					waveSpeed
				});
			}
		}
	});

	// Memoize material to prevent recreation
	const material = useMemo(() => {
		try {
			const shaderMaterial = new THREE.ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				uniforms,
				transparent: false, // Change to opaque for better performance
				depthWrite: false // Performance optimization for transparent materials
			});

			// Check for shader compilation errors
			if (shaderMaterial.vertexShader && shaderMaterial.fragmentShader) {
				return shaderMaterial;
			} else {
				console.warn('Shader compilation may have failed, using fallback material');
				return new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
			}
		} catch (err) {
			console.error('Failed to create shader material:', err);
			return new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
		}
	}, [uniforms]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (material && material.dispose) {
				material.dispose();
			}
		};
	}, [material]);

	return (
		<mesh ref={mesh} scale={[viewport.width, viewport.height, 1]} geometry={PLANE_GEOMETRY} material={material} />
	);
}

// Memoized dither component for performance
const MemoizedDitherPlane = React.memo(DitherPlane);

export default function Dither({
	color1 = [0.05, 0.05, 0.12],
	color2 = [0.3, 0.45, 0.6],
	pixelSize = 2.0,
	ditherIntensity = 0.1,
	gradientStrength = 1.5,
	animated = true,
	waveSpeed = 0.5,
	// Legacy prop support for backward compatibility
	scale
}) {
	// Convert legacy scale prop to pixelSize if provided
	const actualPixelSize = scale ? 8.0 / scale : pixelSize;

	// Debug: Log component mount and props
	useEffect(() => {
		console.log('Dither component mounted with props:', {
			color1,
			color2,
			pixelSize: actualPixelSize,
			ditherIntensity,
			gradientStrength,
			animated,
			waveSpeed
		});
	}, []);

	// Adaptive quality settings based on device capabilities
	const qualitySettings = useMemo(() => {
		const isLowPower = navigator.hardwareConcurrency <= 4 ||
		                   /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

		return {
			dpr: isLowPower ? 1 : Math.min(window.devicePixelRatio, 1.5),
			frameRate: animated ? 'always' : 'demand', // Force always when animated
			antialias: !isLowPower
		};
	}, [animated]);

	// Memoize canvas props with adaptive quality
	const canvasProps = useMemo(() => ({
		className: "dither-canvas",
		style: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: '100%',
			height: '100%',
			display: 'block',
			pointerEvents: 'none' // Performance optimization
		},
		camera: { position: [0, 0, 1], fov: 45 }, // Reduced FOV for performance
		gl: {
			antialias: qualitySettings.antialias,
			alpha: true,
			powerPreference: 'low-power',
			stencil: false, // Disable stencil buffer for performance
			depth: false    // Disable depth buffer for performance
		},
		dpr: qualitySettings.dpr,
		frameloop: qualitySettings.frameRate
	}), [qualitySettings]);

	const onCreated = useCallback(({ gl, scene }) => {
		gl.setClearColor(0x000000, 0);
		gl.physicallyCorrectLights = false; // Disable for performance
		scene.matrixAutoUpdate = false; // Static scene optimization
	}, []);

	return (
		<Canvas {...canvasProps} onCreated={onCreated}>
			<MemoizedDitherPlane
				color1={color1}
				color2={color2}
				pixelSize={actualPixelSize}
				ditherIntensity={ditherIntensity}
				gradientStrength={gradientStrength}
				animated={animated}
				waveSpeed={waveSpeed}
			/>
		</Canvas>
	);
}
