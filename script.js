const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector("#nav-links");

menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    if (menuBtn) menuBtn.textContent = "Menu";
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const canvas = document.getElementById("hero-glass");
const stage = document.getElementById("stage-grow");

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uTime;
uniform float uNoiseScaleX;
uniform float uNoiseScaleY;
uniform float uWarpStrength;
uniform float uWarpSpeed;
uniform float uFluteWidth;
uniform float uFluteStrength;
uniform float uExposure;
uniform float uBlobSpeed;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
uniform vec3 uC5;
uniform vec3 uBg;
uniform float uAlgo;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 rotate2d(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float atanh1(float x) {
  x = clamp(x, -0.9999, 0.9999);
  return 0.5 * log((1.0 + x) / (1.0 - x));
}

vec2 warpAt(vec2 uv) {
  float t = uTime * uWarpSpeed;
  vec2 n = uv * vec2(uNoiseScaleX, uNoiseScaleY);
  return vec2(snoise(n + t * 0.5), snoise(n * 0.93 - t * 0.3));
}

vec3 field(vec2 uv, vec2 warp) {
  float t = uTime * uBlobSpeed + 3.5;
  vec2 p1 = vec2(-0.32 + sin(t * 0.5 + 1.8) * 0.20, -0.12 + cos(t * 0.8 + 0.3) * 0.16);
  vec2 p2 = vec2( 0.10 + sin(t * 0.6 + 2.5) * 0.14,  0.24 + cos(t * 0.3 + 1.7) * 0.18);
  vec2 p3 = vec2(-0.15 + sin(t * 0.9 + 0.7) * 0.22, -0.08 + cos(t * 0.5 + 2.9) * 0.11);
  vec2 p4 = vec2( 0.28 + sin(t * 0.4 + 3.1) * 0.17,  0.18 + cos(t * 0.6 + 0.9) * 0.20);
  vec2 p5 = vec2(-0.05 + sin(t * 0.7 + 4.2) * 0.13, -0.20 + cos(t * 0.9 + 1.5) * 0.15);

  vec3 color = uBg;
  if (uAlgo < 0.5) {
    vec2 w = uv + warp * uWarpStrength;
    color += uC1 * exp(-dot(w - p1, w - p1) * 12.0) * 1.4;
    color += uC2 * exp(-dot(w - p2, w - p2) * 20.0) * 2.0;
    color += uC3 * exp(-dot(w - p3, w - p3) *  9.0) * 1.6;
    color += uC4 * exp(-dot(w - p4, w - p4) * 15.0) * 1.3;
    color += uC5 * exp(-dot(w - p5, w - p5) * 25.0) * 0.8;
    return color;
  }
  vec2 w = uv + vec2(warp.x * uWarpStrength, warp.y * uWarpStrength * 0.2);
  vec2 r1 = rotate2d(w - p1,  0.3);
  vec2 r2 = rotate2d(w - p2, -1.1);
  vec2 r3 = rotate2d(w - p3,  0.8);
  vec2 r4 = rotate2d(w - p4, -0.5);
  vec2 r5 = rotate2d(w - p5,  1.4);
  color += uC1 * exp(-(r1.x * r1.x *  8.0 + r1.y * r1.y *  1.0)) * 1.4;
  color += uC2 * exp(-(r2.x * r2.x * 25.0 + r2.y * r2.y * 12.0)) * 2.0;
  color += uC3 * exp(-(r3.x * r3.x *  6.0 + r3.y * r3.y * 14.0)) * 1.6;
  color += uC4 * exp(-(r4.x * r4.x * 20.0 + r4.y * r4.y *  8.0)) * 1.3;
  color += uC5 * exp(-(r5.x * r5.x * 30.0 + r5.y * r5.y * 15.0)) * 0.8;
  return color;
}

void main() {
  vec2 mapped = gl_FragCoord.xy / uPixelRatio - uResolution * 0.5;
  vec2 scaled = mapped / uFluteWidth;
  float fx = fract(scaled.x);
  vec2 fluted = vec2(
    mapped.x + uFluteStrength * (fx - 0.5),
    mapped.y - uFluteStrength * atanh1(pow(fx, 6.0))
  );
  vec3 color = field(fluted / 1000.0, warpAt(vUv));
  color = 1.0 - exp(-color * uExposure);
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

if (canvas) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const program = gl && gl.createProgram();
  const vert = gl && compile(gl.VERTEX_SHADER, VERT);
  const frag = gl && compile(gl.FRAGMENT_SHADER, FRAG);
  if (program && vert && frag) {
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
  }
  const linked = program && gl.getProgramParameter(program, gl.LINK_STATUS);

  if (linked) {
    const U = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pixelRatio: gl.getUniformLocation(program, "uPixelRatio"),
      time: gl.getUniformLocation(program, "uTime"),
      noiseScaleX: gl.getUniformLocation(program, "uNoiseScaleX"),
      noiseScaleY: gl.getUniformLocation(program, "uNoiseScaleY"),
      warpStrength: gl.getUniformLocation(program, "uWarpStrength"),
      warpSpeed: gl.getUniformLocation(program, "uWarpSpeed"),
      fluteWidth: gl.getUniformLocation(program, "uFluteWidth"),
      fluteStrength: gl.getUniformLocation(program, "uFluteStrength"),
      exposure: gl.getUniformLocation(program, "uExposure"),
      blobSpeed: gl.getUniformLocation(program, "uBlobSpeed"),
      algo: gl.getUniformLocation(program, "uAlgo"),
      c1: gl.getUniformLocation(program, "uC1"),
      c2: gl.getUniformLocation(program, "uC2"),
      c3: gl.getUniformLocation(program, "uC3"),
      c4: gl.getUniformLocation(program, "uC4"),
      c5: gl.getUniformLocation(program, "uC5"),
      bg: gl.getUniformLocation(program, "uBg"),
    };
    const buffer = gl.createBuffer();
    const bind = () => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const pos = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    };
    bind();

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let last = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      const w = Math.round(cssW * dpr);
      const h = Math.round(cssH * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        bind();
      }
    };

    const draw = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const gap = coarse ? 33 : 16;
      if (!reduceMotion && last && now - last < gap) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      if (!start) start = now;
      const width = cssW;
      gl.uniform2f(U.resolution, width, cssH);
      gl.uniform1f(U.pixelRatio, dpr);
      gl.uniform1f(U.time, reduceMotion ? 0 : (now - start) / 1000);
      gl.uniform1f(U.noiseScaleX, 0.35);
      gl.uniform1f(U.noiseScaleY, 0.55);
      gl.uniform1f(U.warpStrength, 0.4);
      gl.uniform1f(U.warpSpeed, 0.36);
      gl.uniform1f(U.fluteWidth, width < 640 ? 44 : 70);
      gl.uniform1f(U.fluteStrength, 140);
      gl.uniform1f(U.exposure, 0.32);
      gl.uniform1f(U.blobSpeed, 1.8);
      gl.uniform1f(U.algo, 1);
      gl.uniform3f(U.c1, 0, 0.2745, 0.251);
      gl.uniform3f(U.c2, 0, 0.4314, 0.3922);
      gl.uniform3f(U.c3, 0, 0.5176, 0.4706);
      gl.uniform3f(U.c4, 0.7686, 0.8902, 0.9765);
      gl.uniform3f(U.c5, 0.4471, 0.7608, 0.7098);
      gl.uniform3f(U.bg, 0.0078, 0.0902, 0.0863);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!canvas.hasAttribute("data-ready")) canvas.setAttribute("data-ready", "");
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(draw);
    };

    resize();
    startLoop();
    window.addEventListener("resize", () => {
      resize();
      startLoop();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else startLoop();
    });
    const hero = canvas.closest(".hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startLoop();
        else cancelAnimationFrame(raf);
      }).observe(hero);
    }
  }
}

if (stage && !reduceMotion) {
  let queued = 0;
  let growNow = -1;
  let awayNow = -1;
  const updateGrow = () => {
    queued = 0;
    const rect = stage.getBoundingClientRect();
    const view = window.innerHeight;
    const t = Math.min(1, Math.max(0, 1 - (rect.top - 0.18 * view) / (0.46 * view)));
    const grow = Math.round((1 - Math.pow(1 - t, 3)) * 1000) / 1000;
    const awayLinear = Math.min(1, Math.max(0, (0.12 * view - rect.top) / (0.8 * view)));
    const away = Math.round(awayLinear * awayLinear * 1000) / 1000;
    if (grow !== growNow) {
      growNow = grow;
      stage.style.setProperty("--grow", String(grow));
    }
    if (away !== awayNow) {
      awayNow = away;
      stage.style.setProperty("--away", String(away));
    }
  };
  const queue = () => {
    if (!queued) queued = requestAnimationFrame(updateGrow);
  };
  stage.setAttribute("data-grow", "");
  updateGrow();
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
}

const termScreen = document.getElementById("term-screen");

if (termScreen) {
  const steps = [
    { cmd: "whoami", out: "Nadim Mahmud Shuvo" },
    { cmd: "role --now", out: "Full-stack engineer · open to opportunities" },
    { cmd: "cat about.txt", out: "Physics, then software. B.Sc. and M.Sc., National University of Bangladesh." },
    { cmd: "ls projects", projects: true },
  ];
  const projects = [
    ["01  gartnerforbund", "webflow", "https://9643---gartnerforbundet-nettsider.webflow.io/"],
    ["02  vadio", "react", "https://www.vadio.no/"],
    ["03  pareto-securities", "sitevision", "https://paretosec.com/"],
  ];

  const sleep = (ms) => new Promise((resolve) => {
    const start = () => setTimeout(resolve, ms);
    if (!document.hidden) start();
    else {
      document.addEventListener("visibilitychange", function onShow() {
        if (!document.hidden) {
          document.removeEventListener("visibilitychange", onShow);
          start();
        }
      });
    }
  });

  const sizer = document.createElement("div");
  sizer.className = "term-sizer";
  sizer.setAttribute("aria-hidden", "true");
  const live = document.createElement("div");
  live.className = "term-live";
  termScreen.append(sizer, live);

  const addLine = (parent, className) => {
    const line = document.createElement("div");
    if (className) line.className = className;
    parent.appendChild(line);
    return line;
  };

  const promptLine = (parent) => {
    const line = addLine(parent, "term-line");
    line.innerHTML = '<span class="term-prompt">nadim@portfolio</span> <span class="term-dim">~</span> ';
    return line;
  };

  const addProjects = (parent) => {
    const list = addLine(parent, "term-projects");
    projects.forEach(([name, tag, href]) => {
      const row = document.createElement("div");
      const link = document.createElement("a");
      link.href = href;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = name;
      row.append(link, document.createTextNode(" "), document.createElement("span"));
      row.lastElementChild.className = "term-dim";
      row.lastElementChild.textContent = tag;
      list.appendChild(row);
    });
  };

  const addProfile = (parent) => {
    const card = document.createElement("div");
    card.className = "term-card";
    const img = document.createElement("img");
    img.src = "me.png";
    img.alt = "";
    img.width = 64;
    img.height = 64;
    const copy = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = "Nadim Mahmud Shuvo";
    const meta = document.createElement("span");
    const mail = document.createElement("a");
    mail.href = "mailto:nadimshuvo1997@gmail.com";
    mail.textContent = "nadimshuvo1997@gmail.com";
    meta.append(mail, document.createTextNode(" · 2+ years · 15+ projects"));
    copy.append(name, meta);
    card.append(img, copy);
    parent.appendChild(card);
  };

  const paintAll = (parent) => {
    parent.replaceChildren();
    steps.forEach((step) => {
      const line = promptLine(parent);
      const typed = document.createElement("span");
      typed.textContent = step.cmd;
      line.appendChild(typed);
      if (step.projects) addProjects(parent);
      else addLine(parent).textContent = step.out;
    });
    const idle = promptLine(parent);
    const caret = document.createElement("span");
    caret.className = "term-cursor";
    idle.appendChild(caret);
    addProfile(parent);
  };

  const typeInto = async (el, text) => {
    for (const ch of text) {
      el.textContent += ch;
      await sleep(16);
    }
  };

  const run = async () => {
    live.replaceChildren();
    for (const step of steps) {
      const line = promptLine(live);
      const typed = document.createElement("span");
      const caret = document.createElement("span");
      caret.className = "term-cursor";
      line.append(typed, caret);
      await typeInto(typed, step.cmd);
      caret.remove();
      await sleep(160);
      if (step.projects) addProjects(live);
      else addLine(live).textContent = step.out;
      await sleep(260);
    }
    const idle = promptLine(live);
    const caret = document.createElement("span");
    caret.className = "term-cursor";
    idle.appendChild(caret);
    addProfile(live);
    await sleep(2800);
    run();
  };

  paintAll(sizer);
  if (reduceMotion) paintAll(live);
  else run();
}

const music = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

if (music && musicToggle) {
  music.volume = 0.3;

  const setMusicState = () => {
    const playing = !music.paused;
    musicToggle.classList.toggle("is-on", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
  };

  const startMusic = () => {
    if (!music.paused) return;
    music.play().then(setMusicState).catch(() => setMusicState());
  };

  setMusicState();
  startMusic();

  const onGesture = (event) => {
    if (musicToggle.contains(event.target)) return;
    startMusic();
  };
  document.addEventListener("pointerdown", onGesture);
  music.addEventListener("play", () => {
    document.removeEventListener("pointerdown", onGesture);
    setMusicState();
  });
  music.addEventListener("pause", setMusicState);

  musicToggle.addEventListener("click", () => {
    if (music.paused) music.play().then(setMusicState).catch(() => {});
    else music.pause();
  });
}

const aboutStats = document.querySelector("#about .stats");
if (aboutStats) {
  const figures = [...aboutStats.querySelectorAll("dt")].map((el) => {
    const raw = el.textContent.trim();
    const value = parseInt(raw, 10);
    return { el, value, suffix: raw.slice(String(value).length) };
  });
  const paint = (progress) => {
    figures.forEach(({ el, value, suffix }) => {
      el.textContent = Math.round(value * progress) + suffix;
    });
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    paint(1);
  } else {
    paint(0);
    const watcher = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      watcher.disconnect();
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - started) / 1400);
        const eased = 1 - (1 - progress) ** 3;
        paint(eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.45 });
    watcher.observe(aboutStats);
  }
}
