const canvas = document.getElementById("gl");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

window.parent.postMessage({ type: "SIM_READY" }, "*");

/* ================= RESIZE ================= */

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize);
resize();

/* ================= STATE ================= */

const state = {
  zoom: 1,
  offset: { x: 0, y: 0 },
  corruption: false,
  mode: "grid",
  signal: 0,
  crashed: false
};

/* ================= MOUSE ================= */

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", e => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener("mouseup", () => dragging = false);

window.addEventListener("mousemove", e => {
  if (!dragging) return;
  state.offset.x += (e.clientX - lastX) * 0.002;
  state.offset.y -= (e.clientY - lastY) * 0.002;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  state.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
  state.zoom = Math.max(0.5, Math.min(4, state.zoom));
});

/* ================= SHADERS ================= */

const vs = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fs = `
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float zoom;
uniform vec2 offset;
uniform float corruption;
uniform int mode;
uniform float signal;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv -= 0.5;
  uv *= zoom;
  uv += offset;
  uv.x *= resolution.x / resolution.y;

  float grid = abs(sin(uv.x * 20.0)) + abs(sin(uv.y * 20.0));
  float pulse = sin(time * 2.0) * 0.5 + 0.5;
  float value = grid * pulse;

  if (mode == 1) {
    value = length(uv) * 3.0;
  }

  if (corruption > 0.5) {
    value += sin(uv.y * 120.0 + time * 20.0) * 0.25;
  }

  value += signal;

  vec3 color = vec3(0.1, 1.0, 0.7) * value;
  gl_FragColor = vec4(color, 1.0);
}
`;

/* ================= COMPILE ================= */

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
gl.linkProgram(program);
gl.useProgram(program);

/* ================= GEOMETRY ================= */

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
  gl.STATIC_DRAW
);

const posLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

/* ================= UNIFORMS ================= */

const timeLoc = gl.getUniformLocation(program, "time");
const resLoc = gl.getUniformLocation(program, "resolution");
const zoomLoc = gl.getUniformLocation(program, "zoom");
const offsetLoc = gl.getUniformLocation(program, "offset");
const corruptLoc = gl.getUniformLocation(program, "corruption");
const modeLoc = gl.getUniformLocation(program, "mode");
const signalLoc = gl.getUniformLocation(program, "signal");

/* ================= TERMINAL → WEBGL ================= */

window.addEventListener("message", e => {
  const { type, payload } = e.data || {};

//   switch (type) {
//     case "SIGNAL":
//       state.signal = 1;
//       break;

//     case "CORRUPTION":
//       state.corruption = !state.corruption;
//       break;

//     case "MODE":
//       state.mode = payload.mode;
//       break;

//     case "CRASH":
//       fakeCrash();
//       break;
//   }
});

/* ================= CRASH ================= */

function fakeCrash() {
  state.crashed = true;
  setTimeout(() => location.reload(), 2500);
}

/* ================= LOOP ================= */
let last = performance.now();
let frames = 0;

function loop(t) {
frames++;
  if (t - last > 1000) {
    document.getElementById("fps").textContent = `FPS: ${frames}`;
    frames = 0;
    last = t;
  }
  gl.uniform1f(timeLoc, t * 0.001);
  gl.uniform2f(resLoc, canvas.width, canvas.height);
  gl.uniform1f(zoomLoc, state.zoom);
  gl.uniform2f(offsetLoc, state.offset.x, state.offset.y);
  gl.uniform1f(corruptLoc, state.corruption ? 1 : 0);
  gl.uniform1i(modeLoc, state.mode === "scan" ? 1 : 0);
  gl.uniform1f(signalLoc, state.signal);

  const dt = (t - last) * 0.001;

  state.signal = Math.max(0, state.signal - dt * 0.6);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
