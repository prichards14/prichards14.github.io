/**
 * Patrick Richards Portfolio — Interactive Logic & Live Demonstrators
 * Apple-inspired smooth interactions, live mini-engines, and project deep dives.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initProjectFiltering();
  initSubleqWidget();
  initChromataWidget();
  initTimerWidget();
  initProjectModal();
});

/* ==========================================================================
   0. Theme Management (Light / Dark Appearance Toggle)
   ========================================================================== */
const THEME_STORAGE_KEY = 'theme-appearance';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaScheme) metaScheme.setAttribute('content', theme);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }

  const lightBtn = document.getElementById('theme-btn-light');
  const darkBtn = document.getElementById('theme-btn-dark');

  if (lightBtn && darkBtn) {
    if (theme === 'light') {
      lightBtn.classList.add('active');
      lightBtn.setAttribute('aria-pressed', 'true');
      darkBtn.classList.remove('active');
      darkBtn.setAttribute('aria-pressed', 'false');
    } else {
      darkBtn.classList.add('active');
      darkBtn.setAttribute('aria-pressed', 'true');
      lightBtn.classList.remove('active');
      lightBtn.setAttribute('aria-pressed', 'false');
    }
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // Gracefully handle storage disabled/blocked
  }
}

function initThemeToggle() {
  let activeTheme = 'light'; // Default to Light on load!
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      activeTheme = saved;
    }
  } catch (e) {}

  applyTheme(activeTheme);

  const lightBtn = document.getElementById('theme-btn-light');
  const darkBtn = document.getElementById('theme-btn-dark');

  if (lightBtn) {
    lightBtn.addEventListener('click', () => applyTheme('light'));
  }
  if (darkBtn) {
    darkBtn.addEventListener('click', () => applyTheme('dark'));
  }

  // Cross-tab theme sync
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyTheme(e.newValue);
    }
  });
}

/* ==========================================================================
   1. Project Filtering by Category
   ========================================================================== */
function initProjectFiltering() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterPills.length || !projectCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category')?.split(' ') || [];
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   2. Live SUBLEQ OISC Mini-Simulator
   mem[B] -= mem[A]; if (mem[B] <= 0) goto C
   ========================================================================== */
function initSubleqWidget() {
  const ledsContainer = document.getElementById('oisc-leds');
  const pcDisplay = document.getElementById('oisc-pc');
  const cycleDisplay = document.getElementById('oisc-cycles');
  const stepBtn = document.getElementById('oisc-step-btn');
  const runBtn = document.getElementById('oisc-run-btn');
  const resetBtn = document.getElementById('oisc-reset-btn');

  if (!ledsContainer) return;

  // Render 8 LEDs
  ledsContainer.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const led = document.createElement('div');
    led.className = 'oisc-led';
    led.id = `oisc-led-${i}`;
    ledsContainer.appendChild(led);
  }

  // Knight rider bounce cycle: 1, 3, 6, 12, 24, 48, 96, 192, 128, 192, 96, 48, 24, 12, 6, 3
  const patterns = [1, 3, 6, 12, 24, 48, 96, 192, 128, 192, 96, 48, 24, 12, 6, 3];
  let stepIndex = 0;
  let cycles = 0;
  let isRunning = false;
  let runInterval = null;

  function updateDisplay(val) {
    for (let i = 0; i < 8; i++) {
      const bit = (val >> (7 - i)) & 1;
      const led = document.getElementById(`oisc-led-${i}`);
      if (led) {
        if (bit) led.classList.add('on');
        else led.classList.remove('on');
      }
    }
    if (pcDisplay) pcDisplay.textContent = `0x${(stepIndex * 3).toString(16).toUpperCase().padStart(2, '0')}`;
    if (cycleDisplay) cycleDisplay.textContent = cycles.toString();
  }

  function step() {
    stepIndex = (stepIndex + 1) % patterns.length;
    cycles += 3; // 3 bytes per subleq instruction
    updateDisplay(patterns[stepIndex]);
  }

  updateDisplay(patterns[0]);

  if (stepBtn) {
    stepBtn.addEventListener('click', () => {
      if (isRunning) toggleRun();
      step();
    });
  }

  function toggleRun() {
    isRunning = !isRunning;
    if (isRunning) {
      runBtn.textContent = 'Pause';
      runInterval = setInterval(step, 140);
    } else {
      runBtn.textContent = 'Run';
      clearInterval(runInterval);
    }
  }

  if (runBtn) {
    runBtn.addEventListener('click', toggleRun);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (isRunning) toggleRun();
      stepIndex = 0;
      cycles = 0;
      updateDisplay(patterns[0]);
    });
  }
}

/* ==========================================================================
   3. Live Chromata OKLCH Theme Harmonizer
   ========================================================================== */
function initChromataWidget() {
  const container = document.getElementById('chromata-swatches');
  const slider = document.getElementById('chromata-hue-slider');
  const modeSelect = document.getElementById('chromata-mode');
  const hexDisplay = document.getElementById('chromata-hex');

  if (!container || !slider) return;

  function getHarmonyHues(baseHue, mode) {
    baseHue = Number(baseHue);
    switch (mode) {
      case 'triadic':
        return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360, (baseHue + 30) % 360, (baseHue + 150) % 360, (baseHue + 270) % 360];
      case 'complementary':
        return [baseHue, (baseHue + 180) % 360, (baseHue + 20) % 360, (baseHue + 200) % 360, (baseHue + 40) % 360, (baseHue + 220) % 360];
      case 'analogous':
      default:
        return [baseHue, (baseHue + 25) % 360, (baseHue + 50) % 360, (baseHue + 75) % 360, (baseHue + 100) % 360, (baseHue + 125) % 360];
    }
  }

  function updatePalette() {
    const baseHue = slider.value;
    const mode = modeSelect ? modeSelect.value : 'triadic';
    const hues = getHarmonyHues(baseHue, mode);

    container.innerHTML = '';
    hues.forEach((hue, index) => {
      const lightness = 65 + (index % 3) * 6;
      const chroma = 0.17;
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = `oklch(${lightness}% ${chroma} ${hue})`;
      swatch.title = `oklch(${lightness}% ${chroma} ${Math.round(hue)})`;
      container.appendChild(swatch);
    });

    if (hexDisplay) {
      hexDisplay.textContent = `Hue: ${Math.round(baseHue)}° · OKLCH 68% 0.18`;
    }
  }

  slider.addEventListener('input', updatePalette);
  if (modeSelect) modeSelect.addEventListener('change', updatePalette);
  updatePalette();
}

/* ==========================================================================
   4. Live Sequential Exercise Timer Mini-Widget
   ========================================================================== */
function initTimerWidget() {
  const display = document.getElementById('timer-countdown');
  const phaseDisplay = document.getElementById('timer-phase');
  const toggleBtn = document.getElementById('timer-toggle-btn');
  if (!display || !toggleBtn) return;

  let secondsLeft = 10;
  let phase = 'PREPARE'; // PREPARE (10) -> EXERCISE (45) -> REST (10)
  let timerActive = false;
  let timerInterval = null;

  function tick() {
    secondsLeft--;
    if (secondsLeft <= 0) {
      if (phase === 'PREPARE') {
        phase = 'EXERCISE';
        secondsLeft = 45;
        phaseDisplay.textContent = 'EXERCISE (Work)';
        phaseDisplay.style.color = '#34c759';
      } else if (phase === 'EXERCISE') {
        phase = 'COOLDOWN';
        secondsLeft = 10;
        phaseDisplay.textContent = 'COOLDOWN';
        phaseDisplay.style.color = '#af52de';
      } else {
        phase = 'PREPARE';
        secondsLeft = 10;
        phaseDisplay.textContent = 'PREPARE';
        phaseDisplay.style.color = '#ff9500';
      }
    }
    display.textContent = `00:${secondsLeft.toString().padStart(2, '0')}`;
  }

  toggleBtn.addEventListener('click', () => {
    timerActive = !timerActive;
    if (timerActive) {
      toggleBtn.textContent = 'Pause';
      timerInterval = setInterval(tick, 1000);
    } else {
      toggleBtn.textContent = 'Start';
      clearInterval(timerInterval);
    }
  });
}

/* ==========================================================================
   5. Project Deep Dive Modal Dialog
   ========================================================================== */
const PROJECT_DATABASE = {
  'c64-sprite-studio': {
    title: 'Commodore 64 Sprite Studio',
    tagline: 'Authentic VIC-II Hardware Sprite Editor & BASIC V2 Generator',
    aiModel: 'Google Antigravity / Gemini Pro',
    liveUrl: 'https://prichards14.github.io/pr-c64-sprite-studio/',
    repoUrl: 'https://github.com/prichards14/pr-c64-sprite-studio',
    image: 'assets/images/c64-screenshot.jpg',
    prompt: `Created with Google Antigravity and Gemini Pro.
Design a browser-based Single Page Application (SPA) utility for designing and editing Commodore 64 sprites.
Strict VIC-II hardware mode requirements:
1. Exact 24×21 pixel matrix matching 63 data bytes per sprite.
2. Authentic Hires (2-color, 1-bit per pixel) and Lores Multicolor (4-color, 12×21 double-width pixels, 2-to-1 aspect ratio).
3. The official 16 Commodore 64 color swatches mapped to Colodore CRT phosphor palette.
4. Real-time Commodore BASIC V2 setup routine POKE generator starting at line 100, Sprite 0 cassette buffer pointer addressing ($0340 / 832), and compact or row-by-row DATA statements with an uppercase/lowercase toggle for emulator paste mode.`,
    architecture: [
      'Engineered in Google Antigravity using Gemini Pro for full hardware constraint modeling.',
      'Authentic 63-byte binary sprite memory matrix mapping directly to Commodore 64 VIC-II video controller registers ($D000 - $D02E).',
      'High-precision pixel grid with nearest-neighbor CRT scaling, 8-bit byte boundary markers (every 8 hires / 4 multicolor dots), and undo/redo history.',
      'Instant Commodore BASIC V2 (.BAS) code emitter featuring emulator paste mode (lowercase ASCII mapped to unshifted PETSCII for VICE).',
      'Hardware expansion simulation: Expand X ($D01D) and Expand Y ($D017) double-dimension previews with screen color backdrop toggle ($D021).'
    ],
    techStack: ['Google Antigravity', 'Gemini Pro', 'JavaScript (ES6+)', 'HTML5 Canvas', 'Colodore Palette', 'Commodore BASIC V2']
  },
  'fractal-landscape': {
    title: 'Fractal Landscape (VistaPro Web)',
    tagline: 'Browser-based 3D Landscape & Terrain Generator inspired by Vista Pro (1991)',
    aiModel: 'Claude Opus',
    liveUrl: 'https://github.com/prichards14/prdev-fractal-landscape',
    repoUrl: 'https://github.com/prichards14/prdev-fractal-landscape',
    image: 'assets/images/landscape-screenshot.jpg',
    prompt: `Build a browser-based 3D landscape generator inspired by the 1991 Commodore Amiga program Vista Pro.
Technical requirements:
1. Multi-octave simplex noise terrain generated in a dedicated Web Worker so the main UI thread never locks up, using zero-copy Transferable Float32Array buffers.
2. Elevation-accurate color gradient mapping from sea level to snow caps.
3. GPU-instanced rendering of up to 35,000 altitude-appropriate trees (deciduous icospheres vs conifer cones).
4. Procedural drifting volumetric clouds with sun-angle shading, physically positioned sun, atmospheric fog, and orbit camera navigation.`,
    architecture: [
      'Multi-threaded Terrain Engine: Heavy simplex noise math runs in a dedicated Web Worker, passing Float32Array heightmaps and vertex normals to Three.js with zero main-thread jank.',
      'Massive GPU Instancing: Renders up to 35,000 altitude-dependent trees (icosphere deciduous trees at low altitudes, layered conifer cones at high altitudes) in single draw calls.',
      'Atmospheric Lighting: Synchronized sun directional light and Three.js sky shader; procedural drifting volumetric cloud clusters; exponential distance fog warming to amber at sunset.',
      'Camera & Export: OrbitControls camera (rotate, zoom, pan) with 1080p high-resolution PNG snapshot generator.'
    ],
    techStack: ['React 19', 'TypeScript', 'Three.js (WebGL)', 'Web Workers', 'Simplex Noise', 'Vite']
  },
  'chromata': {
    title: 'Chromata — OKLCH Color Studio',
    tagline: 'Perceptually Uniform Color Palette Studio & Design System Synthesizer',
    aiModel: 'Claude Opus',
    liveUrl: 'https://prichards14.github.io/prdev-chromata/',
    repoUrl: 'https://github.com/prichards14/prdev-chromata',
    image: null,
    prompt: `Create an OKLCH-first color palette studio and theme synthesizer.
Features:
1. Build around modern OKLCH color space for true perceptual uniformity across lightness and chroma channels.
2. Harmonic color algorithm supporting Complementary, Split-Complementary, Triadic, Tetradic, Monochromatic, and Analogous modes.
3. Real-time UI component simulation across dark/light surfaces with WCAG contrast verification.
4. Instant CSS Custom Property and Tailwind CSS token export.`,
    architecture: [
      'Perceptually Uniform Color Engine: Leverages modern OKLCH color math to ensure tints and shades maintain constant perceived lightness and chroma.',
      'Multi-mode Harmonic Algorithms: Mathematical angle generation across the OKLCH color wheel with gamut clipping protection.',
      'Live Component Mirror: Instant preview of typography, buttons, cards, and borders rendered dynamically against dark and light surface tokens.',
      'Design Token Exporter: One-click generation of CSS custom properties and JSON tokens ready for design system integration.'
    ],
    techStack: ['HTML5', 'Modern CSS (OKLCH, CSS Variables)', 'JavaScript', 'Geist & DM Mono Typography']
  },
  'styledraft': {
    title: 'StyleDraft — Design Mock-up Tool',
    tagline: 'Guardrailed Real-Time Website Style Drafting Powered by Google Gemini & Claude Opus',
    aiModel: 'Google Gemini & Claude Opus',
    liveUrl: 'https://prichards14.github.io/pr-styledraft/',
    repoUrl: 'https://github.com/prichards14/pr-styledraft',
    image: null,
    prompt: `Create an interactive website style drafting tool with curated design guardrails, dynamic CSS variables injection, and Google Gemini API integration (@google/genai).
The user can draft and tweak typography, spacing, and palettes in real-time on live mockups, leverage Gemini AI to suggest complementary palettes and design rules, and export clean production CSS.`,
    architecture: [
      'AI Design Assistant: Powered by the Google Gemini API (@google/genai) to generate harmonized color schemes and typographical pairings tailored to user prompts.',
      'Dynamic CSS Custom Property Pipeline: Injects real-time CSS variables directly into mockup DOM containers without page reloads.',
      'Curated Design Guardrails: Enforces typographic hierarchy, contrast safety, and aesthetic scaling ratios so mockups remain polished.',
      'Developer Handoff Exporter: Generates clean, production-ready CSS rules and Tailwind configuration snippets.'
    ],
    techStack: ['Google Gemini API (@google/genai)', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Motion', 'Vite']
  },
  'oisc': {
    title: 'SUBLEQ OISC Simulator',
    tagline: 'One Instruction Set Computer Architecture Simulator',
    aiModel: 'Claude Opus',
    liveUrl: 'https://prichards14.github.io/prdev-oisc/',
    repoUrl: 'https://github.com/prichards14/prdev-oisc',
    image: null,
    prompt: `Build an in-browser simulator for a One Instruction Set Computer (OISC) implementing the universal SUBLEQ architecture:
mem[B] -= mem[A]; if (mem[B] <= 0) goto C
Include:
1. 256-byte interactive memory grid with live bus reads and writes.
2. Built-in programs proving Turing completeness: Knight Rider LED bounce, Fibonacci sequence, counter, and multiplication.
3. Eliminate display flickering on 8-bit memory buses by implementing delta-based subtraction outputs.
4. Cycle counter, register trace, and variable clock frequencies.`,
    architecture: [
      'Single-Opcode Turing Machine: Executes the universal SUBLEQ instruction without opcode decode stages, proving minimal architecture computation.',
      'Delta-Based Output Innovation: Subtracts pre-calculated deltas from output register 0xFF to render smooth 8-bit animations without blanking or flicker.',
      'Live Memory Matrix: 256-cell Uint8Array memory display with read/write highlighting, instruction pointer tracking, and step-by-step cycle execution.',
      'Program Registry: Pre-loaded assembly routines demonstrating arithmetic, conditional branching, and memory-mapped I/O.'
    ],
    techStack: ['JavaScript (TypedArrays, Uint8Array)', 'Hardware Emulation', 'Systems Architecture', 'CSS Grid']
  },
  'routines': {
    title: 'Sequential Exercise Timer PWA',
    tagline: 'Mobile-Ready Precision Interval Timer & Sound Engine PWA',
    aiModel: 'Google AI Studio / Gemini',
    liveUrl: 'https://github.com/prichards14/prdev-routines',
    repoUrl: 'https://github.com/prichards14/prdev-routines',
    image: null,
    prompt: `Build a mobile-ready PWA for sequential exercise routines with 10-second Prepare intervals, configurable work countdowns, per-second audio ticks, cooldowns, and a final triple-beep finish tone.
Requirements:
1. Web Audio API synthesized audio engine (no audio sample loading latency).
2. Screen Wake Lock API integration to prevent display sleep during workouts.
3. Standalone single-file HTML export capability for portability.`,
    architecture: [
      'Built in Google AI Studio: Structured using Gemini prompt scaffolding with complete typed state management.',
      'Synthesized Web Audio: Oscillator-driven audio ticks and triple-chime finishes with zero external audio asset latency.',
      'Screen Wake Lock API: Automatically prevents mobile operating systems from sleeping during active exercise intervals.',
      'PWA & Single-File Bundler: Service worker caching and built-in project packaging for standalone HTML distribution.'
    ],
    techStack: ['Google AI Studio', 'Gemini API', 'React', 'TypeScript', 'Web Audio API', 'Wake Lock API', 'PWA']
  },
  'fractals': {
    title: 'Fractals Mathematical Suite',
    tagline: 'Mandelbrot Explorer, Barnsley Fern IFS, and Hilbert Curve Visualizer',
    aiModel: 'Claude Opus',
    liveUrl: 'https://prichards14.github.io/prdev-fractals/Mandelbrot.html',
    repoUrl: 'https://github.com/prichards14/prdev-fractals',
    image: null,
    prompt: `Create a trio of self-contained mathematical fractal explorers:
1. Mandelbrot set visualizer with deep smooth palette cycling and zoom controls.
2. Barnsley Fern generated via Iterated Function Systems (IFS) affine matrix probability transformations.
3. Recursive space-filling Hilbert curve visualizer with interactive recursion depth.`,
    architecture: [
      'Direct Canvas Pixel Manipulation: Uses raw ImageData Uint8ClampedArray buffers for high-speed complex number escape-time rendering.',
      'Stochastic Iterated Function Systems: Computes affine coordinate transformations with weighted probabilities for organic fern generation.',
      'Recursive Space-Filling Geometry: Implements Lindenmayer and recursive quad-tree vertex generation for the 2D Hilbert curve.'
    ],
    techStack: ['HTML5 Canvas API', 'Iterated Function Systems (IFS)', 'L-Systems', 'Complex Math Algorithms']
  },
  'tic-tac-toe': {
    title: 'Minimalist Tic-Tac-Toe',
    tagline: 'Clean Zero-Dependency Interactive Game SPA',
    aiModel: 'Claude Opus',
    liveUrl: 'https://prichards14.github.io/prdev-tic-tac-toe/',
    repoUrl: 'https://github.com/prichards14/prdev-tic-tac-toe',
    image: null,
    prompt: `Build a zero-dependency Tic-Tac-Toe game using clean modern JavaScript event delegation, CSS Grid, and state-driven DOM updates.`,
    architecture: [
      'Event Delegation: Single listener on container grid managing state transitions and turn mechanics.',
      'Responsive CSS Grid: Resolution-independent board layout with accessible state messaging.'
    ],
    techStack: ['HTML5', 'CSS Grid', 'JavaScript (ES6+)']
  }
};

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const detailButtons = document.querySelectorAll('[data-open-modal]');

  if (!modal) return;

  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-open-modal');
      const data = PROJECT_DATABASE[projectId];
      if (!data) return;

      populateModal(data);
      modal.showModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.close());
  }

  // Light dismiss on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      modal.close();
    }
  });
}

function populateModal(data) {
  const title = document.getElementById('modal-title');
  const tagline = document.getElementById('modal-tagline');
  const badge = document.getElementById('modal-badge');
  const promptText = document.getElementById('modal-prompt');
  const archList = document.getElementById('modal-arch-list');
  const techPills = document.getElementById('modal-tech-pills');
  const liveLink = document.getElementById('modal-live-link');
  const repoLink = document.getElementById('modal-repo-link');
  const mediaContainer = document.getElementById('modal-media');

  if (title) title.textContent = data.title;
  if (tagline) tagline.textContent = data.tagline;
  if (badge) badge.textContent = `Prompted with ${data.aiModel}`;
  if (promptText) promptText.textContent = data.prompt;

  if (archList) {
    archList.innerHTML = '';
    data.architecture.forEach(item => {
      const li = document.createElement('li');
      li.className = 'timeline-highlight-item';
      li.textContent = item;
      archList.appendChild(li);
    });
  }

  if (techPills) {
    techPills.innerHTML = '';
    data.techStack.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tech-pill';
      span.textContent = tech;
      techPills.appendChild(span);
    });
  }

  if (mediaContainer) {
    if (data.image) {
      mediaContainer.style.display = 'block';
      mediaContainer.innerHTML = `<img src="${data.image}" alt="${data.title}" style="width:100%; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--color-border); box-shadow: var(--color-media-shadow);" />`;
    } else {
      mediaContainer.style.display = 'none';
      mediaContainer.innerHTML = '';
    }
  }

  if (liveLink) {
    if (data.liveUrl) {
      liveLink.href = data.liveUrl;
      liveLink.style.display = 'inline-flex';
    } else {
      liveLink.style.display = 'none';
    }
  }

  if (repoLink) {
    repoLink.href = data.repoUrl;
  }
}

