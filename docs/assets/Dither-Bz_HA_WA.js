import{j as l,r as d}from"./react-vendors-BUVZlxMq.js";import{C,u as L,a as g,V as y,b as _,D as M}from"./three-vendors-Caeb1fgr.js";import"./vendor-fwKkMc2x.js";const b={contexts:new Set,isMonitoring:!1,addContext(t){this.contexts.has(t)||(this.contexts.add(t),this.startMonitoring())},removeContext(t){this.contexts.delete(t),this.contexts.size===0&&this.stopMonitoring()},startMonitoring(){if(this.isMonitoring)return;this.isMonitoring=!0;const t=()=>{console.warn("Global WebGL context loss detected"),this.contexts.forEach(o=>{if(o&&o.getContext){const n=o.getContext("webgl")||o.getContext("experimental-webgl");n&&n.isContextLost&&n.isContextLost()&&console.log("Attempting to recover context for canvas:",o)}})};window.addEventListener("webglcontextlost",t,!0),this.handleGlobalContextLoss=t},stopMonitoring(){this.isMonitoring&&(this.isMonitoring=!1,this.handleGlobalContextLoss&&(window.removeEventListener("webglcontextlost",this.handleGlobalContextLoss,!0),this.handleGlobalContextLoss=null))}},E=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,G=`
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
`;function R({waveSpeed:t=.02,waveScale:o=8,color1:n=[.1,.1,.2],color2:c=[.3,.4,.5],enableMouseInteraction:h=!0,mouseRadius:f=.2}){const e=d.useRef(),{viewport:x,size:r,gl:s}=L();d.useEffect(()=>{const a=s.domElement;b.addContext(a);let u=!1,i;const v=w=>{w.preventDefault(),u=!0,console.warn("WebGL context lost, pausing rendering..."),s.render&&s.setAnimationLoop(null),i&&clearTimeout(i),i=setTimeout(()=>{u&&(console.log("Attempting WebGL context recovery..."),setTimeout(()=>{window.location.reload()},1e3))},1e3)},p=()=>{u=!1,console.log("WebGL context restored, resuming rendering..."),i&&(clearTimeout(i),i=void 0),s.setPixelRatio(window.devicePixelRatio),s.setSize(r.width,r.height),s.setClearColor(0,0),e.current&&(e.current.material.needsUpdate=!0)};return a.addEventListener("webglcontextlost",v,!1),a.addEventListener("webglcontextrestored",p,!1),()=>{a.removeEventListener("webglcontextlost",v),a.removeEventListener("webglcontextrestored",p),b.removeContext(a),i&&clearTimeout(i)}},[s,r]),d.useEffect(()=>()=>{e.current&&(e.current.geometry&&e.current.geometry.dispose(),e.current.material&&e.current.material.dispose())},[]);const m=d.useMemo(()=>({u_resolution:{value:new y(r.width,r.height)},u_color1:{value:new g(...n)},u_color2:{value:new g(...c)},u_scale:{value:o}}),[n,c,o,r.width,r.height]);return _(()=>{e.current&&m.u_resolution.value.set(r.width,r.height)}),l.jsx(l.Fragment,{children:l.jsxs("mesh",{ref:e,scale:[x.width,x.height,1],children:[l.jsx("planeGeometry",{args:[1,1]}),l.jsx("shaderMaterial",{vertexShader:E,fragmentShader:G,uniforms:m,transparent:!0,depthWrite:!1,side:M})]})})}function A({waveSpeed:t=.02,waveScale:o=8,color1:n=[.1,.1,.2],color2:c=[.3,.4,.5],enableMouseInteraction:h=!0,mouseRadius:f=.2}){return l.jsx(C,{className:"dither-container",camera:{position:[0,0,1],fov:75},dpr:Math.min(window.devicePixelRatio,2),gl:{antialias:!1,alpha:!0,powerPreference:"default",failIfMajorPerformanceCaveat:!1,stencil:!1,depth:!0,preserveDrawingBuffer:!1,premultipliedAlpha:!0},onCreated:({gl:e})=>{e.setPixelRatio(Math.min(window.devicePixelRatio,2)),e.setClearColor(0,0),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA)},onError:e=>console.error("WebGL Error:",e),children:l.jsx(R,{waveSpeed:t,waveScale:o,color1:n,color2:c,enableMouseInteraction:h,mouseRadius:f})})}export{A as default};
