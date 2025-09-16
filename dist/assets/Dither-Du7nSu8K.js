import{r as t,j as g,b as w}from"./react-vendors-JnNavwmH.js";import{C as x,u as y,a as p,V as b,b as M,S as P,M as _,P as S}from"./three-vendors-B3pcu1IJ.js";import"./vendor-CN6QpVaA.js";const E=`
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,C=`
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
`,G=new S(1,1);function R({color1:c=[.05,.05,.12],color2:m=[.3,.45,.6],pixelSize:u=2,ditherIntensity:r=.1,gradientStrength:n=1.5,animated:i=!0,waveSpeed:f=.02}){const h=t.useRef(),{size:s,viewport:l}=y(),e=t.useMemo(()=>({u_resolution:{value:new b},u_color1:{value:new p},u_color2:{value:new p},u_time:{value:0},u_pixelSize:{value:u},u_ditherIntensity:{value:r},u_gradientStrength:{value:n},u_animated:{value:i}}),[u,r,n,i]);t.useEffect(()=>{e.u_resolution.value&&e.u_resolution.value.set(s.width,s.height)},[s.width,s.height,e]),t.useEffect(()=>{e.u_color1.value&&e.u_color2.value&&(e.u_color1.value.setRGB(...c),e.u_color2.value.setRGB(...m))},[c,m,e]),t.useEffect(()=>{e.u_pixelSize.value=u,e.u_ditherIntensity.value=r,e.u_gradientStrength.value=n,e.u_animated.value=i},[u,r,n,i,e]);const d=t.useRef(0);M(({clock:a})=>{if(!e.u_time||!i)return;const v=a.getElapsedTime();v-d.current>=.016&&(e.u_time.value=v*f,d.current=v,Math.floor(v)%5===0&&v-d.current<.1&&console.log("Dither animation running:",{time:e.u_time.value,animated:i,waveSpeed:f}))});const o=t.useMemo(()=>{try{const a=new P({vertexShader:E,fragmentShader:C,uniforms:e,transparent:!1,depthWrite:!1});return a.vertexShader&&a.fragmentShader?a:(console.warn("Shader compilation may have failed, using fallback material"),new _({color:1710638}))}catch(a){return console.error("Failed to create shader material:",a),new _({color:1710638})}},[e]);return t.useEffect(()=>()=>{o&&o.dispose&&o.dispose()},[o]),g.jsx("mesh",{ref:h,scale:[l.width,l.height,1],geometry:G,material:o})}const T=w.memo(R);function D({color1:c=[.05,.05,.12],color2:m=[.3,.45,.6],pixelSize:u=2,ditherIntensity:r=.1,gradientStrength:n=1.5,animated:i=!0,waveSpeed:f=.5,scale:h}){const s=h?8/h:u;t.useEffect(()=>{console.log("Dither component mounted with props:",{color1:c,color2:m,pixelSize:s,ditherIntensity:r,gradientStrength:n,animated:i,waveSpeed:f})},[]);const l=t.useMemo(()=>{const o=navigator.hardwareConcurrency<=4||/Mobile|Android|iPhone|iPad/.test(navigator.userAgent);return{dpr:o?1:Math.min(window.devicePixelRatio,1.5),frameRate:i?"always":"demand",antialias:!o}},[i]),e=t.useMemo(()=>({className:"dither-canvas",style:{position:"absolute",top:0,left:0,right:0,bottom:0,width:"100%",height:"100%",display:"block",pointerEvents:"none"},camera:{position:[0,0,1],fov:45},gl:{antialias:l.antialias,alpha:!0,powerPreference:"low-power",stencil:!1,depth:!1},dpr:l.dpr,frameloop:l.frameRate}),[l]),d=t.useCallback(({gl:o,scene:a})=>{o.setClearColor(0,0),a.matrixAutoUpdate=!1},[]);return g.jsx(x,{...e,onCreated:d,children:g.jsx(T,{color1:c,color2:m,pixelSize:s,ditherIntensity:r,gradientStrength:n,animated:i,waveSpeed:f})})}export{D as default};
